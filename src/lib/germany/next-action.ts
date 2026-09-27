import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isGermanyCountry } from "./regions";

export const DE_CONFIRM_STEP_SUFFIX = "-de-confirm-str";
export const DE_BEZIRK_STEP_SUFFIX = "-de-bezirk";
export const DE_DOSSIER_STEP_SUFFIX = "-de-dossier";
export const DE_OFFICIAL_REG_STEP_SUFFIX = "-de-official-registration";
export const DE_STORE_STEP_SUFFIX = "-de-store-registration";
export const DE_DISPLAY_STEP_SUFFIX = "-display-de-registration";
export const DE_FEDERAL_STATE_STEP_SUFFIX = "-de-federal-state";

export type GermanyNextActionContext = {
  country: string;
  city: string;
  deFederalState?: string | null;
  deCityOrDistrict?: string | null;
  hasDeRegistrationNumber?: boolean;
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

export function getEffectiveNextStepForGermany(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: GermanyNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isGermanyCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const state = context.deFederalState;
  const missingState = !state || state === "unknown";

  const federalStep = findStepBySuffix(playbook, DE_FEDERAL_STATE_STEP_SUFFIX);
  if (federalStep && missingState) {
    const status = progressMap.get(federalStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, federalStep, defaultNext)) return federalStep;
    }
  }

  const bezirkStep = findStepBySuffix(playbook, DE_BEZIRK_STEP_SUFFIX);
  const missingBezirk =
    state === "berlin" && !context.deCityOrDistrict?.trim();

  if (bezirkStep && missingBezirk && !missingState) {
    const status = progressMap.get(bezirkStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, bezirkStep, defaultNext)) return bezirkStep;
    }
  }

  const dossierStep = findStepBySuffix(playbook, DE_DOSSIER_STEP_SUFFIX);
  const dossierPrepared = context.isDossierPrepared ?? false;

  if (dossierStep && !missingState && !missingBezirk && !dossierPrepared) {
    const status = progressMap.get(dossierStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, dossierStep, defaultNext)) return dossierStep;
    }
  }

  const officialRegStep = findStepBySuffix(playbook, DE_OFFICIAL_REG_STEP_SUFFIX);
  const hasNumber = context.hasDeRegistrationNumber ?? false;

  if (officialRegStep && !hasNumber && !missingState && !missingBezirk && dossierPrepared) {
    const status = progressMap.get(officialRegStep.key);
    if (!status || status === "pending") {
      return officialRegStep;
    }
  }

  const storeStep = findStepBySuffix(playbook, DE_STORE_STEP_SUFFIX);
  if (storeStep && hasNumber) {
    const status = progressMap.get(storeStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, storeStep, defaultNext)) return storeStep;
    }
  }

  const displayStep = findStepBySuffix(playbook, DE_DISPLAY_STEP_SUFFIX);
  if (displayStep && hasNumber && !context.isDisplayedOnListings) {
    const status = progressMap.get(displayStep.key);
    if (!status || status === "pending") {
      return displayStep;
    }
  }

  return defaultNext;
}
