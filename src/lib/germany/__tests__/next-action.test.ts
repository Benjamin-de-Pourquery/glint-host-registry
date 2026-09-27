import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaybook } from "@/lib/playbooks";
import { getEffectiveNextStepForGermany } from "../next-action";

describe("Germany playbook resolution", () => {
  it("resolves Berlin city playbook", () => {
    assert.equal(resolvePlaybook("Germany", "Berlin")?.id, "de-berlin");
    assert.equal(resolvePlaybook("de", "berlin")?.id, "de-berlin");
  });

  it("falls back to generic Germany playbook", () => {
    assert.equal(resolvePlaybook("Germany", "Munich")?.id, "de-generic");
  });

  it("exposes expected Berlin step keys", () => {
    const playbook = resolvePlaybook("Germany", "Berlin")!;
    const keys = playbook.steps.map((s) => s.key);
    assert.ok(keys.includes("berlin-de-confirm-str"));
    assert.ok(keys.includes("berlin-de-bezirk"));
    assert.ok(keys.includes("berlin-de-dossier"));
    assert.ok(keys.includes("berlin-de-official-registration"));
    assert.ok(keys.includes("berlin-de-store-registration"));
    assert.ok(keys.includes("berlin-display-de-registration"));
  });
});

describe("getEffectiveNextStepForGermany", () => {
  it("prioritizes bezirk when missing", () => {
    const playbook = resolvePlaybook("Germany", "Berlin")!;
    const step = getEffectiveNextStepForGermany(
      playbook,
      [{ stepKey: "berlin-de-confirm-str", status: "done" }],
      null,
      {
        country: "Germany",
        city: "Berlin",
        deFederalState: "berlin",
        deCityOrDistrict: null,
        isDossierPrepared: false,
      }
    );
    assert.equal(step?.key, "berlin-de-bezirk");
  });

  it("prioritizes dossier when bezirk set but dossier not prepared", () => {
    const playbook = resolvePlaybook("Germany", "Berlin")!;
    const step = getEffectiveNextStepForGermany(
      playbook,
      [
        { stepKey: "berlin-de-confirm-str", status: "done" },
        { stepKey: "berlin-de-bezirk", status: "done" },
      ],
      null,
      {
        country: "Germany",
        city: "Berlin",
        deFederalState: "berlin",
        deCityOrDistrict: "mitte",
        isDossierPrepared: false,
      }
    );
    assert.equal(step?.key, "berlin-de-dossier");
  });

  it("prioritizes official registration when dossier prepared but no number", () => {
    const playbook = resolvePlaybook("Germany", "Berlin")!;
    const step = getEffectiveNextStepForGermany(
      playbook,
      [
        { stepKey: "berlin-de-confirm-str", status: "done" },
        { stepKey: "berlin-de-bezirk", status: "done" },
        { stepKey: "berlin-de-dossier", status: "done" },
      ],
      null,
      {
        country: "Germany",
        city: "Berlin",
        deFederalState: "berlin",
        deCityOrDistrict: "mitte",
        isDossierPrepared: true,
        hasDeRegistrationNumber: false,
      }
    );
    assert.equal(step?.key, "berlin-de-official-registration");
  });
});
