import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import {
  getSpainAutonomousCommunity,
  isSpainCountry,
  supportsSpainStrRegistrationCompliance,
  type SpainAutonomousCommunity,
} from "./regions";

export const ES_COMMUNITY_STEP_SUFFIX = "-es-autonomous-community";
export const ES_DOSSIER_STEP_SUFFIX = "-es-dossier";
export const ES_OFFICIAL_REG_STEP_SUFFIX = "-es-official-registration";
export const ES_STORE_STEP_SUFFIX = "-es-store-registration";
export const ES_DISPLAY_STEP_SUFFIX = "-display-es-registration";

export type SpainRegistrationNextActionContext = {
  country: string;
  city: string;
  esAutonomousCommunity?: string | null;
  hasEsRegistrationNumber?: boolean;
  isDossierPrepared?: boolean;
  isLicenseKindSet?: boolean;
  isDisplayedOnListings?: boolean;
};

function findStepBySuffix(playbook: Playbook, suffix: string): PlaybookStep | null {
  return playbook.steps.find((s) => s.key.endsWith(suffix)) ?? null;
}

function pickEarlierStep(
  playbook: Playbook,
  candidate: PlaybookStep,
  defaultNext: PlaybookStep | null
): boolean {
  const stepIndex = playbook.steps.findIndex((s) => s.key === candidate.key);
  const defaultIndex = defaultNext
    ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
    : -1;
  if (defaultIndex === -1) return true;
  return stepIndex <= defaultIndex;
}

export function getEffectiveNextStepForSpainRegistration(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: SpainRegistrationNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isSpainCountry(context.country)) {
    return defaultNext;
  }

  if (
    !supportsSpainStrRegistrationCompliance(
      context.country,
      context.city,
      context.esAutonomousCommunity
    )
  ) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  const communityStep = findStepBySuffix(playbook, ES_COMMUNITY_STEP_SUFFIX);
  const inferredCommunity = getSpainAutonomousCommunity(context.city);
  const expectedCommunity: SpainAutonomousCommunity | null =
    inferredCommunity === "catalonia" ||
    inferredCommunity === "madrid" ||
    inferredCommunity === "valencian" ||
    inferredCommunity === "andalucia"
      ? inferredCommunity
      : null;
  const missingCommunity =
    Boolean(expectedCommunity) &&
    context.esAutonomousCommunity !== expectedCommunity;

  if (communityStep && missingCommunity) {
    const status = progressMap.get(communityStep.key);
    if (!status || status === "pending") {
      return communityStep;
    }
  }

  const licenseReady = context.isLicenseKindSet ?? false;
  const dossierStep = findStepBySuffix(playbook, ES_DOSSIER_STEP_SUFFIX);
  const dossierPrepared = context.isDossierPrepared ?? false;

  if (dossierStep && !missingCommunity && (!licenseReady || !dossierPrepared)) {
    const status = progressMap.get(dossierStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, dossierStep, defaultNext)) return dossierStep;
    }
  }

  const officialRegStep = findStepBySuffix(playbook, ES_OFFICIAL_REG_STEP_SUFFIX);
  const hasNumber = context.hasEsRegistrationNumber ?? false;

  if (
    officialRegStep &&
    !hasNumber &&
    !missingCommunity &&
    licenseReady &&
    dossierPrepared
  ) {
    const status = progressMap.get(officialRegStep.key);
    if (!status || status === "pending") {
      return officialRegStep;
    }
  }

  const storeStep = findStepBySuffix(playbook, ES_STORE_STEP_SUFFIX);
  if (storeStep && hasNumber) {
    const status = progressMap.get(storeStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, storeStep, defaultNext)) return storeStep;
    }
  }

  const displayStep = findStepBySuffix(playbook, ES_DISPLAY_STEP_SUFFIX);
  if (displayStep && hasNumber && !context.isDisplayedOnListings) {
    const status = progressMap.get(displayStep.key);
    if (!status || status === "pending") {
      return displayStep;
    }
  }

  return defaultNext;
}
