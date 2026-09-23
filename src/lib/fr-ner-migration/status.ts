import { NER_MIGRATION_TIMELINE } from "./config";
import { isDocumentsChecklistComplete } from "./documents";
import type { ChecklistItem, FrNerMigrationStatus } from "./types";
import { FR_NER_MIGRATION_STATUSES } from "./types";

export function isFrNerMigrationStatus(value: string): value is FrNerMigrationStatus {
  return FR_NER_MIGRATION_STATUSES.includes(value as FrNerMigrationStatus);
}

export type StatusInferenceInput = {
  status?: string | null;
  localRegistrationNumber?: string | null;
  nerNumber?: string | null;
  documentsChecklist?: ChecklistItem[];
  transitionEndsAt?: Date | string | null;
  explicitStatus?: FrNerMigrationStatus | null;
};

export function inferFrNerMigrationStatus(input: StatusInferenceInput): FrNerMigrationStatus {
  if (input.explicitStatus && isFrNerMigrationStatus(input.explicitStatus)) {
    if (input.explicitStatus === "SUBMITTED" && !input.nerNumber?.trim()) {
      return "SUBMITTED";
    }
    if (input.explicitStatus === "NER_ACTIVE" && input.nerNumber?.trim()) {
      return "NER_ACTIVE";
    }
    if (
      input.explicitStatus !== "NER_ACTIVE" &&
      input.explicitStatus !== "SUBMITTED" &&
      input.explicitStatus !== "STALE_LOCAL"
    ) {
      return input.explicitStatus;
    }
  }

  const nerNumber = input.nerNumber?.trim() ?? "";
  if (nerNumber) {
    return "NER_ACTIVE";
  }

  const transitionEnd =
    input.transitionEndsAt ?? NER_MIGRATION_TIMELINE.transitionEndsAt;
  if (transitionEnd) {
    const end = new Date(transitionEnd);
    if (!Number.isNaN(end.getTime()) && end < new Date()) {
      const hasLocal = Boolean(input.localRegistrationNumber?.trim());
      if (hasLocal && !nerNumber) {
        return "STALE_LOCAL";
      }
    }
  }

  if (input.status === "SUBMITTED") {
    return "SUBMITTED";
  }

  const hasLocal = Boolean(input.localRegistrationNumber?.trim());
  if (!hasLocal) {
    return "NO_LOCAL";
  }

  const docs = input.documentsChecklist ?? [];
  if (isDocumentsChecklistComplete(docs)) {
    return "PREP_DONE";
  }

  return "HAS_LOCAL";
}

export function needsFrNerMigrationAttention(
  status: FrNerMigrationStatus,
  notifyOnPortalOpen?: boolean
): boolean {
  if (status === "STALE_LOCAL") return true;
  if (status === "NER_ACTIVE") return false;
  if (status === "SUBMITTED") return true;
  if (status === "NO_LOCAL" || status === "HAS_LOCAL" || status === "PREP_DONE") {
    return true;
  }
  return Boolean(notifyOnPortalOpen);
}

export function canEnterWizard(status: FrNerMigrationStatus): boolean {
  return status === "PREP_DONE" || status === "SUBMITTED" || status === "NER_ACTIVE";
}
