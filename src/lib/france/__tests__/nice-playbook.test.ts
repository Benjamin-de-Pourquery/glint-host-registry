import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getNiceSituation,
  hasNiceLocationMixteNote,
  hasNiceQuotaZoneNote,
  niceCompensationBranchRequired,
  stepAppliesForNice,
} from "@/lib/france/nice-playbook";
import type { PlaybookStep } from "@/lib/playbooks/types";
import { defaultNightCapLimitForCity } from "@/lib/france/night-cap";

function step(key: string, appliesWhen?: PlaybookStep["appliesWhen"]): PlaybookStep {
  return {
    key,
    title: { en: key, fr: key },
    instruction: { en: "", fr: "" },
    officialUrls: [],
    documents: { en: [], fr: [] },
    appliesWhen,
  };
}

describe("getNiceSituation", () => {
  it("returns primaryResidence for primary residency", () => {
    assert.equal(getNiceSituation("apartment", "primary", {}), "primaryResidence");
  });

  it("returns nonPrimaryChangeOfUse for secondary", () => {
    assert.equal(getNiceSituation("house", "secondary", {}), "nonPrimaryChangeOfUse");
  });
});

describe("niceCompensationBranchRequired", () => {
  it("requires compensation for legal entities on non-primary", () => {
    assert.equal(
      niceCompensationBranchRequired(
        { ownerIsLegalEntity: true },
        "nonPrimaryChangeOfUse"
      ),
      true
    );
  });

  it("skips compensation when location mixte note is set", () => {
    assert.equal(
      niceCompensationBranchRequired(
        { notes: "nice:location-mixte" },
        "nonPrimaryChangeOfUse"
      ),
      false
    );
  });
});

describe("stepAppliesForNice", () => {
  it("shows quota step only with nice:quota-zone note", () => {
    const quota = step("nice-quota-zone", "niceQuotaZone");
    assert.equal(
      stepAppliesForNice(quota, "secondary", "apartment", { notes: "nice:quota-zone" }),
      true
    );
    assert.equal(
      stepAppliesForNice(quota, "secondary", "apartment", {}),
      false
    );
  });

  it("shows change-of-use for non-primary only", () => {
    const change = step("nice-change-of-use", "niceNonPrimaryChangeOfUse");
    assert.equal(
      stepAppliesForNice(change, "secondary", "apartment", {}),
      true
    );
    assert.equal(
      stepAppliesForNice(change, "primary", "apartment", {}),
      false
    );
  });
});

describe("Nice notes helpers", () => {
  it("detects location mixte and quota zone notes", () => {
    assert.equal(hasNiceLocationMixteNote("nice:location-mixte"), true);
    assert.equal(hasNiceQuotaZoneNote("nice:quota-zone"), true);
  });
});

describe("Nice night cap default", () => {
  it("uses 120-night statutory cap for Nice from September 2026 rules", () => {
    assert.equal(defaultNightCapLimitForCity("Nice"), 120);
  });
});
