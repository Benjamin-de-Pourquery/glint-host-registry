import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isCroatiaCountry } from "./regions";

export const CATEGORISATION_STEP_SUFFIX = "-categorisation-registration";
export const EVISITOR_STEP_SUFFIX = "-evisitor-guest-reporting";

export type CroatiaNextActionContext = {
  country: string;
  city: string;
  hasCategorisationNumber?: boolean;
  hasEvisitorObjectId?: boolean;
  hasActiveStayNeedingEvisitor?: boolean;
};

export function getCategorisationStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(CATEGORISATION_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getEvisitorStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(EVISITOR_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getEffectiveNextStepForCroatia(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: CroatiaNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isCroatiaCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  const categorisationStepKey = getCategorisationStepKey(playbook);
  if (categorisationStepKey && !context.hasCategorisationNumber) {
    const step = playbook.steps.find((s) => s.key === categorisationStepKey);
    const status = progressMap.get(categorisationStepKey);
    if (step && (!status || status === "pending")) {
      const stepIndex = playbook.steps.findIndex((s) => s.key === categorisationStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || stepIndex <= defaultIndex) {
        return step;
      }
    }
  }

  const objectStepKey = playbook.steps.find((s) => s.key.endsWith("-evisitor-object-setup"))?.key;
  if (objectStepKey && !context.hasEvisitorObjectId) {
    const step = playbook.steps.find((s) => s.key === objectStepKey);
    const status = progressMap.get(objectStepKey);
    if (step && (!status || status === "pending")) {
      const stepIndex = playbook.steps.findIndex((s) => s.key === objectStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || stepIndex <= defaultIndex) {
        return step;
      }
    }
  }

  const evisitorStepKey = getEvisitorStepKey(playbook);
  if (evisitorStepKey && context.hasActiveStayNeedingEvisitor) {
    const step = playbook.steps.find((s) => s.key === evisitorStepKey);
    const status = progressMap.get(evisitorStepKey);
    if (step && (!status || status === "pending")) {
      const stepIndex = playbook.steps.findIndex((s) => s.key === evisitorStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || stepIndex < defaultIndex) {
        return step;
      }
    }
  }

  return defaultNext;
}
