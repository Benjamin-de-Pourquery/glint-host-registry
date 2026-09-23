import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isBelgiumCountry } from "./regions";

export const BE_REGION_STEP_SUFFIX = "-be-region-selection";
export const BE_DOSSIER_STEP_SUFFIX = "-be-dossier";
export const BE_REGISTRATION_STEP_SUFFIX = "-be-registration";
export const BE_DISPLAY_STEP_SUFFIX = "-display-be-registration";

export type BelgiumNextActionContext = {
  country: string;
  city: string;
  beRegion?: string | null;
  hasBeRegistrationNumber?: boolean;
  isDossierComplete?: boolean;
  isDisplayedOnListings?: boolean;
};

export function getBeRegionStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(BE_REGION_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getBeDossierStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(BE_DOSSIER_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getBeRegistrationStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(BE_REGISTRATION_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getBeDisplayStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(BE_DISPLAY_STEP_SUFFIX));
  return step?.key ?? null;
}

function pickEarlierStep(
  playbook: Playbook,
  candidate: PlaybookStep,
  defaultNext: PlaybookStep | null,
  preferBeforeDefault = true
): boolean {
  const stepIndex = playbook.steps.findIndex((s) => s.key === candidate.key);
  const defaultIndex = defaultNext
    ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
    : -1;
  if (defaultIndex === -1) return true;
  return preferBeforeDefault ? stepIndex <= defaultIndex : stepIndex < defaultIndex;
}

export function getEffectiveNextStepForBelgium(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: BelgiumNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isBelgiumCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const region = context.beRegion;
  const missingRegion = !region || region === "unknown";

  const regionStepKey = getBeRegionStepKey(playbook);
  if (regionStepKey && missingRegion) {
    const step = playbook.steps.find((s) => s.key === regionStepKey);
    const status = progressMap.get(regionStepKey);
    if (step && (!status || status === "pending")) {
      if (pickEarlierStep(playbook, step, defaultNext)) return step;
    }
  }

  const dossierStepKey = getBeDossierStepKey(playbook);
  const dossierComplete = context.isDossierComplete ?? false;

  if (dossierStepKey && !missingRegion && !dossierComplete) {
    const step = playbook.steps.find((s) => s.key === dossierStepKey);
    const status = progressMap.get(dossierStepKey);
    if (step && (!status || status === "pending")) {
      if (pickEarlierStep(playbook, step, defaultNext)) return step;
    }
  }

  const registrationStepKey = getBeRegistrationStepKey(playbook);
  const hasNumber = context.hasBeRegistrationNumber ?? false;

  if (registrationStepKey && !hasNumber && !missingRegion && dossierComplete) {
    const step = playbook.steps.find((s) => s.key === registrationStepKey);
    const status = progressMap.get(registrationStepKey);
    if (step && (!status || status === "pending")) {
      return step;
    }
  }

  const displayStepKey = getBeDisplayStepKey(playbook);
  if (
    displayStepKey &&
    hasNumber &&
    !context.isDisplayedOnListings
  ) {
    const step = playbook.steps.find((s) => s.key === displayStepKey);
    const status = progressMap.get(displayStepKey);
    if (step && (!status || status === "pending")) {
      return step;
    }
  }

  return defaultNext;
}
