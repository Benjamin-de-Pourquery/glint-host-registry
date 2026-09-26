import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAustriaCountry, getAustriaFederalState, normalizeAustriaCity } from "../regions";

describe("Austria regions", () => {
  it("recognizes country aliases", () => {
    assert.equal(isAustriaCountry("AT"), true);
    assert.equal(isAustriaCountry("Österreich"), true);
    assert.equal(isAustriaCountry("autriche"), true);
    assert.equal(isAustriaCountry("Belgium"), false);
  });

  it("normalizes Vienna city aliases", () => {
    assert.equal(normalizeAustriaCity("wien"), "Vienna");
    assert.equal(getAustriaFederalState("Wien"), "vienna");
  });
});
