import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isPortugalCountry } from "./regions";

export const RNAL_STEP_SUFFIX = "-rnal-registration";
export const SIBA_STEP_SUFFIX = "-siba-guest-reporting";

export type PortugalNextActionContext = {
  country: string;
  city: string;
  hasRnalNumber?: boolean;
  hasActiveStayNeedingSiba?: boolean;
};

export function getRnalStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(RNAL_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getSibaStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(SIBA_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getEffectiveNextStepForPortugal(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: PortugalNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isPortugalCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  const rnalStepKey = getRnalStepKey(playbook);
  if (rnalStepKey && !context.hasRnalNumber) {
    const rnalStep = playbook.steps.find((s) => s.key === rnalStepKey);
    const rnalStatus = progressMap.get(rnalStepKey);
    if (rnalStep && (!rnalStatus || rnalStatus === "pending")) {
      const rnalIndex = playbook.steps.findIndex((s) => s.key === rnalStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || rnalIndex <= defaultIndex) {
        return rnalStep;
      }
    }
  }

  const sibaStepKey = getSibaStepKey(playbook);
  if (sibaStepKey && context.hasActiveStayNeedingSiba) {
    const sibaStep = playbook.steps.find((s) => s.key === sibaStepKey);
    const sibaStatus = progressMap.get(sibaStepKey);
    if (sibaStep && (!sibaStatus || sibaStatus === "pending")) {
      const sibaIndex = playbook.steps.findIndex((s) => s.key === sibaStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || sibaIndex < defaultIndex) {
        return sibaStep;
      }
    }
  }

  return defaultNext;
}
