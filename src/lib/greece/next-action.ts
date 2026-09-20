import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { hasGreeceRegistrationNumber, needsGreeceAmaAttention } from "./ama-compliance";
import { isGreeceCountry } from "./regions";

export const AMA_STEP_SUFFIX = "-ama-registration";
export const AADE_STEP_SUFFIX = "-aade-stay-declaration";

export type GreeceNextActionContext = {
  country: string;
  city: string;
  hasAmaNumber?: boolean;
  amaDisplayedOnListings?: boolean;
  hasActiveStayNeedingAade?: boolean;
};

export function getAmaStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(AMA_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getAadeStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(AADE_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getEffectiveNextStepForGreece(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: GreeceNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isGreeceCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  const amaStepKey = getAmaStepKey(playbook);
  if (amaStepKey && !context.hasAmaNumber) {
    const amaStep = playbook.steps.find((s) => s.key === amaStepKey);
    const amaStatus = progressMap.get(amaStepKey);
    if (amaStep && (!amaStatus || amaStatus === "pending")) {
      const amaIndex = playbook.steps.findIndex((s) => s.key === amaStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || amaIndex <= defaultIndex) {
        return amaStep;
      }
    }
  }

  const displayStepKey = playbook.steps.find((s) => s.key.endsWith("-display-ama"))?.key;
  if (displayStepKey && context.hasAmaNumber && !context.amaDisplayedOnListings) {
    const displayStep = playbook.steps.find((s) => s.key === displayStepKey);
    const displayStatus = progressMap.get(displayStepKey);
    if (displayStep && (!displayStatus || displayStatus === "pending")) {
      return displayStep;
    }
  }

  const aadeStepKey = getAadeStepKey(playbook);
  if (aadeStepKey && context.hasActiveStayNeedingAade) {
    const aadeStep = playbook.steps.find((s) => s.key === aadeStepKey);
    const aadeStatus = progressMap.get(aadeStepKey);
    if (aadeStep && (!aadeStatus || aadeStatus === "pending")) {
      const aadeIndex = playbook.steps.findIndex((s) => s.key === aadeStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || aadeIndex < defaultIndex) {
        return aadeStep;
      }
    }
  }

  return defaultNext;
}

export { hasGreeceRegistrationNumber, needsGreeceAmaAttention };
