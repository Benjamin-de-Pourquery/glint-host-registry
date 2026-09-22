import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isNetherlandsCountry,
  isAmsterdam15NightWijk,
  resolveNlNightCapSource,
  nightCapLimitForNlSource,
  getNetherlandsMode,
  normalizeNetherlandsCity,
} from "../regions";
import { getGuestReportingJurisdiction } from "@/lib/guest-reporting/router";
import { getNetherlandsModeFromCountry } from "@/lib/guest-reporting/router";

describe("isNetherlandsCountry", () => {
  it("recognizes country aliases", () => {
    assert.equal(isNetherlandsCountry("Netherlands"), true);
    assert.equal(isNetherlandsCountry("nl"), true);
    assert.equal(isNetherlandsCountry("Nederland"), true);
    assert.equal(isNetherlandsCountry("France"), false);
  });
});

describe("Amsterdam wijk night-cap mapping", () => {
  it("maps designated wijken to 15-night cap", () => {
    assert.equal(isAmsterdam15NightWijk("jordaan"), true);
    assert.equal(isAmsterdam15NightWijk("oude-pijp"), true);
    assert.equal(isAmsterdam15NightWijk("de-pijp"), false);
  });

  it("resolves night-cap source from city and wijk", () => {
    assert.equal(resolveNlNightCapSource("Amsterdam", "jordaan"), "amsterdam_15");
    assert.equal(resolveNlNightCapSource("Amsterdam", null), "amsterdam_30");
    assert.equal(resolveNlNightCapSource("Rotterdam", null), "nl_municipal");
  });

  it("returns correct limits per source", () => {
    assert.equal(nightCapLimitForNlSource("amsterdam_30"), 30);
    assert.equal(nightCapLimitForNlSource("amsterdam_15"), 15);
    assert.equal(nightCapLimitForNlSource("nl_municipal"), null);
  });
});

describe("jurisdiction routing", () => {
  it("returns none for guest reporting (NL uses stay notification ops)", () => {
    assert.equal(getGuestReportingJurisdiction("Netherlands", "Amsterdam"), "none");
    assert.equal(getGuestReportingJurisdiction("nl", "Rotterdam"), "none");
  });

  it("returns stay_notify ops mode for NL cities", () => {
    assert.equal(getNetherlandsMode("Amsterdam"), "stay_notify");
    assert.equal(getNetherlandsModeFromCountry("Netherlands", "Amsterdam"), "stay_notify");
  });
});

describe("city normalization", () => {
  it("normalizes Amsterdam aliases", () => {
    assert.equal(normalizeNetherlandsCity("ams"), "Amsterdam");
    assert.equal(normalizeNetherlandsCity("den haag"), "Den Haag");
  });
});
