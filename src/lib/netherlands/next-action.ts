import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { isNetherlandsCountry } from "./regions";

export const NL_REGISTRATION_STEP_SUFFIX = "-nl-registration";
export const NL_PERMIT_STEP_SUFFIX = "-nl-holiday-permit";
export const NL_STAY_NOTIFY_STEP_SUFFIX = "-nl-stay-notification";

export type NetherlandsNextActionContext = {
  country: string;
  city: string;
  hasNlRegistrationNumber?: boolean;
  hasNlHolidayPermit?: boolean;
  hasActiveStayNeedingNotification?: boolean;
};

export function getNlRegistrationStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(NL_REGISTRATION_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getNlPermitStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(NL_PERMIT_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getNlStayNotifyStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith(NL_STAY_NOTIFY_STEP_SUFFIX));
  return step?.key ?? null;
}

export function getEffectiveNextStepForNetherlands(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: NetherlandsNextActionContext
): PlaybookStep | null {
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isNetherlandsCountry(context.country)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  const registrationStepKey = getNlRegistrationStepKey(playbook);
  if (registrationStepKey && !context.hasNlRegistrationNumber) {
    const step = playbook.steps.find((s) => s.key === registrationStepKey);
    const status = progressMap.get(registrationStepKey);
    if (step && (!status || status === "pending")) {
      const stepIndex = playbook.steps.findIndex((s) => s.key === registrationStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || stepIndex <= defaultIndex) {
        return step;
      }
    }
  }

  const permitStepKey = getNlPermitStepKey(playbook);
  if (permitStepKey && !context.hasNlHolidayPermit) {
    const step = playbook.steps.find((s) => s.key === permitStepKey);
    const status = progressMap.get(permitStepKey);
    if (step && (!status || status === "pending")) {
      const stepIndex = playbook.steps.findIndex((s) => s.key === permitStepKey);
      const defaultIndex = defaultNext
        ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
        : -1;
      if (defaultIndex === -1 || stepIndex <= defaultIndex) {
        return step;
      }
    }
  }

  const stayNotifyStepKey = getNlStayNotifyStepKey(playbook);
  if (stayNotifyStepKey && context.hasActiveStayNeedingNotification) {
    const step = playbook.steps.find((s) => s.key === stayNotifyStepKey);
    const status = progressMap.get(stayNotifyStepKey);
    if (step && (!status || status === "pending")) {
      const stepIndex = playbook.steps.findIndex((s) => s.key === stayNotifyStepKey);
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
