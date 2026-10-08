import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLyonSituation,
  isLyonMunicipality,
  lyonSituationRequiresServiceHabitatConfirmation,
  stepAppliesForLyon,
} from "@/lib/france/lyon-playbook";
import type { PlaybookStep } from "@/lib/playbooks/types";
import { defaultNightCapLimitForCity } from "@/lib/france/night-cap";

function step(appliesWhen: PlaybookStep["appliesWhen"]): PlaybookStep {
  return {
    key: "test",
    title: { en: "t", fr: "t" },
    instruction: { en: "i", fr: "i" },
    officialUrls: [],
    documents: { en: [], fr: [] },
    appliesWhen,
  };
}

describe("isLyonMunicipality", () => {
  it("accepts Lyon with arrondissement postal codes", () => {
    assert.equal(isLyonMunicipality("Lyon", "69003"), true);
    assert.equal(isLyonMunicipality("lyon", "69009"), true);
    assert.equal(isLyonMunicipality("Lyon", "69100"), false);
  });
});

describe("getLyonSituation", () => {
  it("maps primary apartment to primary residence", () => {
    assert.equal(getLyonSituation("apartment", "primary", {}), "primaryResidence");
  });

  it("maps hypercentre non-primary to compensation branch", () => {
    assert.equal(
      getLyonSituation("apartment", "secondary", { inHypercentre: true }),
      "nonPrimaryHypercentre"
    );
  });

  it("maps outside under 35 natural person to confirm branch", () => {
    const situation = getLyonSituation("apartment", "secondary", {
      inHypercentre: false,
      habitableSurfaceM2: 30,
      ownerIsLegalEntity: false,
    });
    assert.equal(situation, "nonPrimaryOutsideUnder35NaturalConfirm");
    assert.equal(lyonSituationRequiresServiceHabitatConfirmation(situation), true);
  });

  it("maps large surface to compensation required", () => {
    assert.equal(
      getLyonSituation("house", "other", {
        inHypercentre: false,
        habitableSurfaceM2: 40,
        ownerIsLegalEntity: false,
      }),
      "nonPrimaryCompensationRequired"
    );
  });

  it("maps legal entity to compensation required", () => {
    assert.equal(
      getLyonSituation("studio", "secondary", {
        inHypercentre: false,
        habitableSurfaceM2: 20,
        ownerIsLegalEntity: true,
      }),
      "nonPrimaryCompensationRequired"
    );
  });
});

describe("stepAppliesForLyon", () => {
  it("shows confirm step only for outside under 35 natural person branch", () => {
    const confirm = step("lyonOutsideUnder35NaturalConfirm");
    assert.equal(
      stepAppliesForLyon(confirm, "secondary", "apartment", {
        inHypercentre: false,
        habitableSurfaceM2: 28,
        ownerIsLegalEntity: false,
      }),
      true
    );
    assert.equal(
      stepAppliesForLyon(confirm, "secondary", "apartment", {
        inHypercentre: true,
      }),
      false
    );
  });

  it("hides pending-details step when branch is resolved", () => {
    const pending = step("lyonNonPrimaryDetailsPending");
    assert.equal(
      stepAppliesForLyon(pending, "secondary", "apartment", {
        inHypercentre: false,
        habitableSurfaceM2: 28,
        ownerIsLegalEntity: false,
      }),
      false
    );
    assert.equal(stepAppliesForLyon(pending, "secondary", "apartment", {}), true);
  });
});

describe("Lyon night cap limit", () => {
  it("uses 90 nights for Lyon commune cap", () => {
    assert.equal(defaultNightCapLimitForCity("Lyon"), 90);
  });
});
