import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaybook } from "@/lib/playbooks";
import { getEffectiveNextStepForBelgium } from "../next-action";

describe("playbook resolution", () => {
  it("resolves city playbooks", () => {
    assert.equal(resolvePlaybook("Belgium", "Brussels")?.id, "be-brussels");
    assert.equal(resolvePlaybook("be", "Antwerp")?.id, "be-antwerp");
    assert.equal(resolvePlaybook("Belgium", "Liège")?.id, "be-liege");
  });

  it("falls back to generic Belgium playbook", () => {
    assert.equal(resolvePlaybook("Belgium", "Spa")?.id, "be-generic");
  });
});

describe("getEffectiveNextStepForBelgium", () => {
  it("prioritizes region selection on generic playbook when region unknown", () => {
    const playbook = resolvePlaybook("Belgium", "Spa")!;
    const step = getEffectiveNextStepForBelgium(playbook, [], null, {
      country: "Belgium",
      city: "Spa",
      beRegion: null,
    });
    assert.equal(step?.key, "be-be-region-selection");
  });

  it("prioritizes dossier before registration for Brussels", () => {
    const playbook = resolvePlaybook("Belgium", "Brussels")!;
    const step = getEffectiveNextStepForBelgium(playbook, [], null, {
      country: "Belgium",
      city: "Brussels",
      beRegion: "brussels",
      isDossierComplete: false,
    });
    assert.equal(step?.key, "brussels-be-dossier");
  });

  it("prioritizes registration when dossier complete but no number", () => {
    const playbook = resolvePlaybook("Belgium", "Antwerp")!;
    const step = getEffectiveNextStepForBelgium(playbook, [], null, {
      country: "Belgium",
      city: "Antwerp",
      beRegion: "flanders",
      isDossierComplete: true,
      hasBeRegistrationNumber: false,
    });
    assert.equal(step?.key, "antwerp-be-registration");
  });

  it("prioritizes display when number present but not on listings", () => {
    const playbook = resolvePlaybook("Belgium", "Liège")!;
    const step = getEffectiveNextStepForBelgium(playbook, [], null, {
      country: "Belgium",
      city: "Liège",
      beRegion: "wallonia",
      isDossierComplete: true,
      hasBeRegistrationNumber: true,
      isDisplayedOnListings: false,
    });
    assert.equal(step?.key, "liege-display-be-registration");
  });
});
