import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  migrationAlreadyCompleteBody,
  migrationNotFoundBody,
  shouldRejectFrNerMigrationPatch,
} from "../route-errors";
import type { FrNerMigrationRecord } from "../types";

const baseRecord: FrNerMigrationRecord = {
  id: "m1",
  registrationId: "r1",
  status: "NER_ACTIVE",
  localRegistrationNumber: "75112-STR-2024-001",
  localIssuingCommune: "Paris",
  nerNumber: "FRA123456789",
  nerIssuedAt: "2026-01-01T00:00:00.000Z",
  transitionEndsAt: null,
  documentsChecklist: [],
  channelUpdatesChecklist: [],
  notifyOnPortalOpen: false,
  wizardStep: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("fr-ner migration route errors", () => {
  it("exposes stable not-found payload", () => {
    assert.deepEqual(migrationNotFoundBody(), {
      code: "migration_not_found",
      error: "Migration record not found for this property",
    });
  });

  it("exposes stable conflict payload", () => {
    assert.equal(migrationAlreadyCompleteBody().code, "migration_already_complete");
  });

  it("blocks wizard changes after NER is active", () => {
    assert.equal(
      shouldRejectFrNerMigrationPatch(baseRecord, { wizardStep: "account" }),
      "migration_already_complete"
    );
  });

  it("allows checklist updates after NER is active", () => {
    assert.equal(
      shouldRejectFrNerMigrationPatch(baseRecord, {
        documentsChecklist: [{ key: "id_copy", done: true }],
      }),
      null
    );
  });
});
