import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaybook } from "@/lib/playbooks";
import { getEffectiveNextStepForAustria } from "../next-action";

describe("Austria playbook resolution", () => {
  it("resolves Vienna city playbook", () => {
    assert.equal(resolvePlaybook("Austria", "Vienna")?.id, "at-vienna");
    assert.equal(resolvePlaybook("at", "Wien")?.id, "at-vienna");
    assert.equal(resolvePlaybook("österreich", "vienne")?.id, "at-vienna");
  });

  it("falls back to generic Austria playbook", () => {
    assert.equal(resolvePlaybook("Austria", "Salzburg")?.id, "at-generic");
  });

  it("exposes expected Vienna step keys", () => {
    const playbook = resolvePlaybook("Austria", "Vienna")!;
    const keys = playbook.steps.map((s) => s.key);
    assert.ok(keys.includes("vienna-at-confirm-str"));
    assert.ok(keys.includes("vienna-at-dossier"));
    assert.ok(keys.includes("vienna-at-official-registration"));
    assert.ok(keys.includes("vienna-at-store-registration"));
    assert.ok(keys.includes("vienna-display-at-registration"));
  });
});

describe("getEffectiveNextStepForAustria", () => {
  it("prioritizes dossier when not prepared", () => {
    const playbook = resolvePlaybook("Austria", "Vienna")!;
    const step = getEffectiveNextStepForAustria(
      playbook,
      [{ stepKey: "vienna-at-confirm-str", status: "done" }],
      null,
      {
      country: "Austria",
      city: "Vienna",
      atFederalState: "vienna",
      isDossierPrepared: false,
      }
    );
    assert.equal(step?.key, "vienna-at-dossier");
  });

  it("prioritizes official registration when dossier prepared but no number", () => {
    const playbook = resolvePlaybook("Austria", "Vienna")!;
    const step = getEffectiveNextStepForAustria(
      playbook,
      [
        { stepKey: "vienna-at-confirm-str", status: "done" },
        { stepKey: "vienna-at-dossier", status: "done" },
      ],
      null,
      {
      country: "Austria",
      city: "Vienna",
      atFederalState: "vienna",
      isDossierPrepared: true,
      hasAtRegistrationNumber: false,
      }
    );
    assert.equal(step?.key, "vienna-at-official-registration");
  });
});
