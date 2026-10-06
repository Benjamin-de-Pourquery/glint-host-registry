import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getParisSituation,
  stepAppliesForParis,
} from "@/lib/france/paris-playbook";
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

describe("getParisSituation", () => {
  it("maps primary apartment to primary whole dwelling", () => {
    assert.equal(getParisSituation("apartment", "primary"), "primaryWholeDwelling");
  });

  it("maps secondary house to non-primary housing", () => {
    assert.equal(getParisSituation("house", "secondary"), "nonPrimaryHousing");
  });

  it("maps commercial property type", () => {
    assert.equal(getParisSituation("commercial", "primary"), "commercialPremises");
  });

  it("maps non_habitation to other premises", () => {
    assert.equal(getParisSituation("non_habitation", null), "otherPremises");
  });

  it("maps primary room to single room exempt", () => {
    assert.equal(getParisSituation("room", "primary"), "singleRoomExempt");
  });
});

describe("stepAppliesForParis", () => {
  it("shows primary declaration only for primary whole dwelling", () => {
    const declare = step("primaryResidence");
    assert.equal(stepAppliesForParis(declare, "primary", "apartment"), true);
    assert.equal(stepAppliesForParis(declare, "secondary", "apartment"), false);
    assert.equal(stepAppliesForParis(declare, "primary", "commercial"), false);
  });

  it("shows commercial steps only for commercial type", () => {
    const commercial = step("commercialPremises");
    assert.equal(stepAppliesForParis(commercial, "primary", "commercial"), true);
    assert.equal(stepAppliesForParis(commercial, "primary", "apartment"), false);
  });
});

describe("Paris night cap limit", () => {
  it("uses 90 nights for Paris commune cap", () => {
    assert.equal(defaultNightCapLimitForCity("Paris"), 90);
  });
});
