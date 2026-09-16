import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isItalyCountry } from "./regions";

export const CIN_BDSR_STEP_SUFFIX = "-cin-bdsr";
export const ALLOGGIATI_STEP_SUFFIX = "-alloggiati-web";

export type ItalyNextActionContext = {
  country: string;
  city: string;
  hasCinNumber?: boolean;
  hasActiveStayNeedingAlloggiati?: boolean;
};

export function getCinStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(CIN_BDSR_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getAlloggiatiStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(ALLOGGIATI_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getEffectiveNextStepForItaly(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: ItalyNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isItalyCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  const cinStepKey = getCinStepKey(playbook);
  if (cinStepKey && !context.hasCinNumber) {
    const cinStep = playbook.steps.find((s) => s.key === cinStepKey);
    const cinStatus = progressMap.get(cinStepKey);
    if (cinStep && (!cinStatus || cinStatus === "pending")) {
      const cinIndex = playbook.steps.findIndex((s) => s.key === cinStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || cinIndex <= defaultIndex) {
        return cinStep;
      }
    }
  }

  const alloggiatiStepKey = getAlloggiatiStepKey(playbook);
  if (
    alloggiatiStepKey &&
    context.hasActiveStayNeedingAlloggiati
  ) {
    const alloggiatiStep = playbook.steps.find((s) => s.key === alloggiatiStepKey);
    const alloggiatiStatus = progressMap.get(alloggiatiStepKey);
    if (
      alloggiatiStep &&
      (!alloggiatiStatus || alloggiatiStatus === "pending")
    ) {
      const alloggiatiIndex = playbook.steps.findIndex((s) => s.key === alloggiatiStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || alloggiatiIndex < defaultIndex) {
        return alloggiatiStep;
      }
    }
  }

  return defaultNext;
}
