import type { FrNerMigrationRecord } from "./types";
import type { FrNerMigrationPatch } from "./service";

export type FrNerMigrationErrorCode =
  | "migration_not_found"
  | "migration_already_complete";

export type FrNerMigrationErrorBody = {
  error: string;
  code: FrNerMigrationErrorCode;
};

export function migrationNotFoundBody(): FrNerMigrationErrorBody {
  return {
    code: "migration_not_found",
    error: "Migration record not found for this property",
  };
}

export function migrationAlreadyCompleteBody(): FrNerMigrationErrorBody {
  return {
    code: "migration_already_complete",
    error: "NER migration is already complete for this property",
  };
}

export function shouldRejectFrNerMigrationPatch(
  current: FrNerMigrationRecord,
  patch: FrNerMigrationPatch
): FrNerMigrationErrorCode | null {
  const nerActive =
    current.status === "NER_ACTIVE" && Boolean(current.nerNumber?.trim());

  if (!nerActive) {
    return null;
  }

  if (patch.status !== undefined && patch.status !== "NER_ACTIVE") {
    return "migration_already_complete";
  }

  if (
    patch.localRegistrationNumber !== undefined &&
    patch.localRegistrationNumber !== current.localRegistrationNumber
  ) {
    return "migration_already_complete";
  }

  if (patch.nerNumber !== undefined && patch.nerNumber !== current.nerNumber) {
    return "migration_already_complete";
  }

  return null;
}
