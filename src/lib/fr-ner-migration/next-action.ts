import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import type { FrNerMigrationRecord } from "./types";
import { needsFrNerMigrationAttention } from "./status";

export function getNerMigrationStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith("-ner-migration-prep"));
  return step?.key ?? null;
}

export function promoteNerMigrationStepIfNeeded(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  migration: FrNerMigrationRecord | null | undefined,
  defaultNext: PlaybookStep | null
): PlaybookStep | null {
  if (!migration) return null;

  const stepKey = getNerMigrationStepKey(playbook);
  if (!stepKey) return null;

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const pending = !progressMap.get(stepKey) || progressMap.get(stepKey) === "pending";
  if (!pending) return null;

  const step = playbook.steps.find((s) => s.key === stepKey);
  if (!step) return null;

  if (!needsFrNerMigrationAttention(migration.status, migration.notifyOnPortalOpen)) {
    return null;
  }

  const stepIndex = playbook.steps.findIndex((s) => s.key === stepKey);
  const defaultIndex = defaultNext
    ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
    : -1;

  if (defaultIndex === -1 || stepIndex <= defaultIndex) {
    return step;
  }

  if (migration.status === "STALE_LOCAL" || migration.status === "SUBMITTED") {
    return step;
  }

  return null;
}
