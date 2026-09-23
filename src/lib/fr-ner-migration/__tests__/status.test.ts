import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaultDocumentsChecklist } from "../documents";
import { inferFrNerMigrationStatus, needsFrNerMigrationAttention } from "../status";

describe("inferFrNerMigrationStatus", () => {
  it("returns NO_LOCAL when no local number", () => {
    assert.equal(
      inferFrNerMigrationStatus({ localRegistrationNumber: null }),
      "NO_LOCAL"
    );
  });

  it("returns HAS_LOCAL when local number without complete checklist", () => {
    assert.equal(
      inferFrNerMigrationStatus({
        localRegistrationNumber: "75112-STR-2024-001",
        documentsChecklist: defaultDocumentsChecklist(),
      }),
      "HAS_LOCAL"
    );
  });

  it("returns PREP_DONE when checklist complete", () => {
    const docs = defaultDocumentsChecklist().map((item) => ({ ...item, done: true }));
    assert.equal(
      inferFrNerMigrationStatus({
        localRegistrationNumber: "75112-STR-2024-001",
        documentsChecklist: docs,
      }),
      "PREP_DONE"
    );
  });

  it("returns NER_ACTIVE when ner number is set", () => {
    assert.equal(
      inferFrNerMigrationStatus({
        localRegistrationNumber: "75112-STR-2024-001",
        nerNumber: "FRA123456789",
      }),
      "NER_ACTIVE"
    );
  });

  it("respects explicit SUBMITTED before NER", () => {
    assert.equal(
      inferFrNerMigrationStatus({
        explicitStatus: "SUBMITTED",
        localRegistrationNumber: "75112-STR-2024-001",
      }),
      "SUBMITTED"
    );
  });
});

describe("needsFrNerMigrationAttention", () => {
  it("flags stale local as needing attention", () => {
    assert.equal(needsFrNerMigrationAttention("STALE_LOCAL"), true);
  });

  it("does not flag NER_ACTIVE", () => {
    assert.equal(needsFrNerMigrationAttention("NER_ACTIVE"), false);
  });
});
