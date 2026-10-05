import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isIrelandCountry } from "./regions";

export const IE_SCOPE_STEP_SUFFIX = "-ie-scope";
export const IE_PLANNING_STEP_SUFFIX = "-ie-planning";
export const IE_DATA_STEP_SUFFIX = "-ie-register-data";
export const IE_SELF_DECL_STEP_SUFFIX = "-ie-self-declaration";
export const IE_OFFICIAL_REG_STEP_SUFFIX = "-ie-official-registration";
export const IE_STORE_STEP_SUFFIX = "-ie-store-stl-number";
export const IE_DISPLAY_STEP_SUFFIX = "-display-ie-stl-number";
export const IE_RENEWAL_STEP_SUFFIX = "-ie-renewal";

export type IrelandNextActionContext = {
  country: string;
  city: string;
  isRegisterDataReady?: boolean;
  hasIeStlNumber?: boolean;
  isDisplayedOnListings?: boolean;
  isRenewalDue?: boolean;
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

export function getEffectiveNextStepForIreland(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: IrelandNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isIrelandCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const dataReady = context.isRegisterDataReady ?? false;
  const hasNumber = context.hasIeStlNumber ?? false;

  const dataStep = findStepBySuffix(playbook, IE_DATA_STEP_SUFFIX);
  if (dataStep && !dataReady) {
    const status = progressMap.get(dataStep.key);
    if (!status || status === "pending") {
      return dataStep;
    }
  }

  const officialRegStep = findStepBySuffix(playbook, IE_OFFICIAL_REG_STEP_SUFFIX);
  if (officialRegStep && dataReady && !hasNumber) {
    const status = progressMap.get(officialRegStep.key);
    if (!status || status === "pending") {
      return officialRegStep;
    }
  }

  const storeStep = findStepBySuffix(playbook, IE_STORE_STEP_SUFFIX);
  if (storeStep && hasNumber) {
    const status = progressMap.get(storeStep.key);
    if (!status || status === "pending") {
      if (pickEarlierStep(playbook, storeStep, defaultNext)) return storeStep;
    }
  }

  const displayStep = findStepBySuffix(playbook, IE_DISPLAY_STEP_SUFFIX);
  if (displayStep && hasNumber && !context.isDisplayedOnListings) {
    const status = progressMap.get(displayStep.key);
    if (!status || status === "pending") {
      return displayStep;
    }
  }

  const renewalStep = findStepBySuffix(playbook, IE_RENEWAL_STEP_SUFFIX);
  if (renewalStep && context.isRenewalDue) {
    const status = progressMap.get(renewalStep.key);
    if (!status || status === "pending") {
      return renewalStep;
    }
  }

  return defaultNext;
}
