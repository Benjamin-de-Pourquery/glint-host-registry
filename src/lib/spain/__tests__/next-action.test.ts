import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaybook } from "@/lib/playbooks";
import { getEffectiveNextStepForSpainRegistration } from "../next-action";

describe("Catalonia playbook resolution", () => {
  it("resolves Barcelona to es-barcelona", () => {
    assert.equal(resolvePlaybook("Spain", "Barcelona")?.id, "es-barcelona");
  });

  it("resolves Girona to es-catalonia", () => {
    assert.equal(resolvePlaybook("Spain", "Girona")?.id, "es-catalonia");
  });
});

describe("Madrid playbook resolution", () => {
  it("resolves Madrid capital to es-madrid", () => {
    assert.equal(resolvePlaybook("Spain", "Madrid")?.id, "es-madrid");
  });

  it("resolves Getafe to es-madrid-community", () => {
    assert.equal(resolvePlaybook("Spain", "Getafe")?.id, "es-madrid-community");
  });
});

describe("Spain registration next action", () => {
  it("prioritizes community confirmation before dossier", () => {
    const playbook = resolvePlaybook("Spain", "Barcelona")!;
    const step = getEffectiveNextStepForSpainRegistration(
      playbook,
      [],
      null,
      {
        country: "Spain",
        city: "Barcelona",
        esAutonomousCommunity: null,
        hasEsRegistrationNumber: false,
        isDossierPrepared: false,
        isLicenseKindSet: false,
        isDisplayedOnListings: false,
      }
    );
    assert.equal(step?.key, "barcelona-es-autonomous-community");
  });

  it("prioritizes listing display after HUT stored", () => {
    const playbook = resolvePlaybook("Spain", "Barcelona")!;
    const progress = playbook.steps.map((s) => ({
      stepKey: s.key,
      status: s.key.endsWith("-display-es-registration") ? "pending" : "done",
    }));
    const step = getEffectiveNextStepForSpainRegistration(
      playbook,
      progress,
      null,
      {
        country: "Spain",
        city: "Barcelona",
        esAutonomousCommunity: "catalonia",
        hasEsRegistrationNumber: true,
        isDossierPrepared: true,
        isLicenseKindSet: true,
        isDisplayedOnListings: false,
      }
    );
    assert.equal(step?.key, "barcelona-display-es-registration");
  });

  it("prioritizes Madrid community confirmation", () => {
    const playbook = resolvePlaybook("Spain", "Madrid")!;
    const step = getEffectiveNextStepForSpainRegistration(
      playbook,
      [],
      null,
      {
        country: "Spain",
        city: "Madrid",
        esAutonomousCommunity: null,
        hasEsRegistrationNumber: false,
        isDossierPrepared: false,
        isLicenseKindSet: false,
        isDisplayedOnListings: false,
      }
    );
    assert.equal(step?.key, "madrid-es-autonomous-community");
  });
});
