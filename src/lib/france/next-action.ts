import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import {
  getNightCapPriorityAction,
  nightCapApplies,
  type NightCapComputation,
} from "@/lib/france/night-cap";
import {
  getTouristTaxPriorityAction,
  touristTaxApplies,
  type TouristTaxSummary,
} from "@/lib/france/tourist-tax";

export function getNightCapStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith("-primary-night-cap"));
  return step?.key ?? null;
}

export function getTouristTaxStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith("-tourist-tax-declaration"));
  return step?.key ?? null;
}

export type FranceNightCapNextActionContext = {
  country: string;
  residencyStatus: "primary" | "secondary" | "other" | null | undefined;
  nightCapComputation: NightCapComputation | null;
  touristTaxSummary?: TouristTaxSummary | null;
};

function promoteStepIfPending(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  stepKey: string | null,
  defaultNext: PlaybookStep | null,
  force = false
): PlaybookStep | null {
  if (!stepKey) return null;

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const step = playbook.steps.find((s) => s.key === stepKey);
  const pending =
    !progressMap.get(stepKey) || progressMap.get(stepKey) === "pending";

  if (!step || !pending) return null;

  const stepIndex = playbook.steps.findIndex((s) => s.key === stepKey);
  const defaultIndex = defaultNext
    ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
    : -1;

  if (force || defaultIndex === -1 || stepIndex < defaultIndex) {
    return step;
  }

  return null;
}

export function getEffectiveNextStepForFranceWithNightCap(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: FranceNightCapNextActionContext,
  defaultNext: PlaybookStep | null
): PlaybookStep | null {
  if (touristTaxApplies(context.country) && context.touristTaxSummary?.enabled) {
    const touristPriority = getTouristTaxPriorityAction(context.touristTaxSummary);
    if (touristPriority) {
      const touristStep = promoteStepIfPending(
        playbook,
        progress,
        getTouristTaxStepKey(playbook),
        defaultNext,
        touristPriority.level === "critical"
      );
      if (touristStep) return touristStep;
    }
  }

  if (
    nightCapApplies(context.country, context.residencyStatus) &&
    context.nightCapComputation?.enabled
  ) {
    const priority = getNightCapPriorityAction(context.nightCapComputation);
    if (priority) {
      const nightCapStep = promoteStepIfPending(
        playbook,
        progress,
        getNightCapStepKey(playbook),
        defaultNext,
        context.nightCapComputation.status === "exceeded" ||
          context.nightCapComputation.status === "critical"
      );
      if (nightCapStep) return nightCapStep;
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
