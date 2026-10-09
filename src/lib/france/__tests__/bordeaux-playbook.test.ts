import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getBordeauxCompensationSector,
  getBordeauxSituation,
  stepAppliesForBordeaux,
} from "@/lib/france/bordeaux-playbook";
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

describe("getBordeauxSituation", () => {
  it("maps primary apartment to primary residence", () => {
    assert.equal(getBordeauxSituation("apartment", "primary", {}), "primaryResidence");
  });

  it("maps secondary to non-primary change of use", () => {
    assert.equal(
      getBordeauxSituation("house", "secondary", {}),
      "nonPrimaryChangeOfUse"
    );
  });

  it("detects social housing from notes", () => {
    assert.equal(
      getBordeauxSituation("apartment", "primary", {
        notes: "bordeaux:social-housing",
      }),
      "socialHousingProhibited"
    );
  });
});

describe("getBordeauxCompensationSector", () => {
  it("reads sector tags from notes", () => {
    assert.equal(
      getBordeauxCompensationSector({ notes: "bordeaux:secteur-a" }),
      "a"
    );
    assert.equal(
      getBordeauxCompensationSector({ notes: "bordeaux:secteur-c" }),
      "c"
    );
  });
});

describe("stepAppliesForBordeaux", () => {
  it("shows secteur A step only with secteur-a note", () => {
    const reinforced = step("bordeauxSecteurA");
    assert.equal(
      stepAppliesForBordeaux(reinforced, "secondary", "apartment", {
        notes: "bordeaux:secteur-a",
      }),
      true
    );
    assert.equal(
      stepAppliesForBordeaux(reinforced, "secondary", "apartment", {
        notes: "bordeaux:secteur-b",
      }),
      false
    );
  });

  it("shows sector pending when non-primary without sector tag", () => {
    const pending = step("bordeauxSecteurPending");
    assert.equal(
      stepAppliesForBordeaux(pending, "secondary", "apartment", {}),
      true
    );
    assert.equal(
      stepAppliesForBordeaux(pending, "secondary", "apartment", {
        notes: "bordeaux:secteur-b",
      }),
      false
    );
  });

  it("hides registration for social housing", () => {
    const declare = step("bordeauxNotSocialHousing");
    assert.equal(
      stepAppliesForBordeaux(declare, "primary", "apartment", {
        notes: "bordeaux:social-housing",
      }),
      false
    );
  });
});

describe("Bordeaux night cap default", () => {
  it("uses commune 90 limit", () => {
    assert.equal(defaultNightCapLimitForCity("Bordeaux"), 90);
  });
});
