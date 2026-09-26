import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isAustriaCountry } from "./regions";

export const AT_CONFIRM_STEP_SUFFIX = "-at-confirm-str";
export const AT_DOSSIER_STEP_SUFFIX = "-at-dossier";
export const AT_OFFICIAL_REG_STEP_SUFFIX = "-at-official-registration";
export const AT_STORE_STEP_SUFFIX = "-at-store-registration";
export const AT_DISPLAY_STEP_SUFFIX = "-display-at-registration";
export const AT_FEDERAL_STATE_STEP_SUFFIX = "-at-federal-state";

export type AustriaNextActionContext = {
  country: string;
  city: string;
  atFederalState?: string | null;
  hasAtRegistrationNumber?: boolean;
  isDossierPrepared?: boolean;
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

export function getEffectiveNextStepForAustria(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: AustriaNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isAustriaCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const state = context.atFederalState;
  const missingState = !state || state === "unknown";

  const federalStep = findStepBySuffix(playbook, AT_FEDERAL_STATE_STEP_SUFFIX);
  if (federalStep && missingState) {
    const status = progressMap.get(federalStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, federalStep, defaultNext)) return federalStep;
    }
  }

  const dossierStep = findStepBySuffix(playbook, AT_DOSSIER_STEP_SUFFIX);
  const dossierPrepared = context.isDossierPrepared ?? false;

  if (dossierStep && !missingState && !dossierPrepared) {
    const status = progressMap.get(dossierStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, dossierStep, defaultNext)) return dossierStep;
    }
  }

  const officialRegStep = findStepBySuffix(playbook, AT_OFFICIAL_REG_STEP_SUFFIX);
  const hasNumber = context.hasAtRegistrationNumber ?? false;

  if (officialRegStep && !hasNumber && !missingState && dossierPrepared) {
    const status = progressMap.get(officialRegStep.key);
    if (!status || status === "pending") {
      return officialRegStep;
    }
  }

  const storeStep = findStepBySuffix(playbook, AT_STORE_STEP_SUFFIX);
  if (storeStep && hasNumber) {
    const status = progressMap.get(storeStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, storeStep, defaultNext)) return storeStep;
    }
  }

  const displayStep = findStepBySuffix(playbook, AT_DISPLAY_STEP_SUFFIX);
  if (displayStep && hasNumber && !context.isDisplayedOnListings) {
    const status = progressMap.get(displayStep.key);
    if (!status || status === "pending") {
      return displayStep;
    }
  }

  return defaultNext;
}
