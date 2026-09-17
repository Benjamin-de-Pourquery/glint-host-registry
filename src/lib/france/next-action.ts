import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import {
  getNightCapPriorityAction,
  nightCapApplies,
  type NightCapComputation,
} from "@/lib/france/night-cap";

export function getNightCapStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith("-primary-night-cap"));
  return step?.key ?? null;
}

export type FranceNightCapNextActionContext = {
  country: string;
  residencyStatus: "primary" | "secondary" | "other" | null | undefined;
  nightCapComputation: NightCapComputation | null;
};

export function getEffectiveNextStepForFranceWithNightCap(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: FranceNightCapNextActionContext,
  defaultNext: PlaybookStep | null
): PlaybookStep | null {
  if (
    !nightCapApplies(context.country, context.residencyStatus) ||
    !context.nightCapComputation?.enabled
  ) {
    return defaultNext;
  }

  const priority = getNightCapPriorityAction(context.nightCapComputation);
  if (!priority) {
    return defaultNext;
  }

  const nightCapStepKey = getNightCapStepKey(playbook);
  if (!nightCapStepKey) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const nightCapStep = playbook.steps.find((s) => s.key === nightCapStepKey);
  const nightCapPending =
    !progressMap.get(nightCapStepKey) || progressMap.get(nightCapStepKey) === "pending";

  if (nightCapStep && nightCapPending) {
    const nightCapIndex = playbook.steps.findIndex((s) => s.key === nightCapStepKey);
    const defaultIndex = defaultNext
      ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
      : -1;

    if (
      context.nightCapComputation.status === "exceeded" ||
      context.nightCapComputation.status === "critical" ||
      defaultIndex === -1 ||
      nightCapIndex < defaultIndex
    ) {
      return nightCapStep;
    }
  }

  return defaultNext;
}

export function getFranceNextStepBase(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined
): PlaybookStep | null {
  return getNextPendingStep(playbook, progress, residencyStatus);
}
