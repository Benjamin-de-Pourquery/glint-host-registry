import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getMarseilleArrondissementGroup,
  getMarseilleSituation,
  parseMarseillePostalCode,
  stepAppliesForMarseille,
} from "@/lib/france/marseille-playbook";
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

describe("parseMarseillePostalCode", () => {
  it("extracts 13001 to 13016 from address", () => {
    assert.equal(parseMarseillePostalCode("12 rue Foo, 13008 Marseille"), "13008");
    assert.equal(parseMarseillePostalCode("13016"), "13016");
    assert.equal(parseMarseillePostalCode("Lyon 69003"), null);
  });
});

describe("getMarseilleArrondissementGroup", () => {
  it("maps postal codes to arrondissement groups", () => {
    assert.equal(getMarseilleArrondissementGroup("13002"), "group1to3");
    assert.equal(getMarseilleArrondissementGroup("13005"), "group4to6");
    assert.equal(getMarseilleArrondissementGroup("13009"), "group7to9");
    assert.equal(getMarseilleArrondissementGroup("13011"), "group10to12");
    assert.equal(getMarseilleArrondissementGroup("13015"), "group13to16");
  });
});

describe("getMarseilleSituation", () => {
  it("maps primary apartment to primary residence", () => {
    assert.equal(
      getMarseilleSituation("apartment", "primary", { address: "13001" }),
      "primaryResidence"
    );
  });

  it("maps secondary to non-primary change of use", () => {
    assert.equal(
      getMarseilleSituation("house", "secondary", { address: "13004" }),
      "nonPrimaryChangeOfUse"
    );
  });

  it("detects social housing from notes", () => {
    assert.equal(
      getMarseilleSituation("apartment", "primary", {
        notes: "marseille:social-housing",
      }),
      "socialHousingProhibited"
    );
  });

  it("detects legacy 2021 authorisation from notes", () => {
    assert.equal(
      getMarseilleSituation("studio", "secondary", {
        notes: "marseille:legacy-2021",
      }),
      "legacy2021Temporary"
    );
  });
});

describe("stepAppliesForMarseille", () => {
  it("shows social housing step only for social branch", () => {
    const social = step("marseilleSocialHousing");
    assert.equal(
      stepAppliesForMarseille(social, "primary", "apartment", {
        notes: "marseille:social-housing",
      }),
      true
    );
    assert.equal(
      stepAppliesForMarseille(social, "primary", "apartment", {}),
      false
    );
  });

  it("shows arrondissement pending when postal code missing on non-primary", () => {
    const pending = step("marseilleArrondissementPending");
    assert.equal(
      stepAppliesForMarseille(pending, "secondary", "apartment", {
        address: "Marseille without code",
      }),
      true
    );
    assert.equal(
      stepAppliesForMarseille(pending, "secondary", "apartment", {
        address: "13007 Marseille",
      }),
      false
    );
  });

  it("shows non-primary change-of-use steps without a postal code", () => {
    const changeOfUse = step("marseilleNonPrimaryChangeOfUse");
    assert.equal(
      stepAppliesForMarseille(changeOfUse, "secondary", "apartment", {
        address: "Marseille without code",
      }),
      true
    );
    assert.equal(
      stepAppliesForMarseille(changeOfUse, "primary", "apartment", {
        address: "13007 Marseille",
      }),
      false
    );
  });

  it("shows arrondissement group check only when postal code is known", () => {
    const groupCheck = step("marseilleNonPrimaryWithArrondissement");
    assert.equal(
      stepAppliesForMarseille(groupCheck, "secondary", "apartment", {
        address: "13007 Marseille",
      }),
      true
    );
    assert.equal(
      stepAppliesForMarseille(groupCheck, "secondary", "apartment", {
        address: "Marseille without code",
      }),
      false
    );
  });

  it("hides declaration for social housing", () => {
    const declare = step("marseilleNotSocialHousing");
    assert.equal(
      stepAppliesForMarseille(declare, "primary", "apartment", {
        notes: "marseille:social-housing",
      }),
      false
    );
    assert.equal(
      stepAppliesForMarseille(declare, "primary", "apartment", {}),
      true
    );
  });
});

describe("Marseille night cap limit", () => {
  it("uses 90 nights for Marseille commune cap", () => {
    assert.equal(defaultNightCapLimitForCity("Marseille"), 90);
  });
});
