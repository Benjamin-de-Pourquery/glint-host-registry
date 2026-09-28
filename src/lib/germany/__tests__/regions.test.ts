import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isGermanyCountry,
  getGermanyFederalState,
  normalizeGermanyCity,
  isBerlinBezirk,
  isMunichCity,
  isMunichRentalUnitType,
} from "../regions";

describe("Germany regions", () => {
  it("detects Germany country aliases", () => {
    assert.equal(isGermanyCountry("DE"), true);
    assert.equal(isGermanyCountry("Deutschland"), true);
    assert.equal(isGermanyCountry("allemagne"), true);
    assert.equal(isGermanyCountry("Austria"), false);
  });

  it("normalizes Berlin city", () => {
    assert.equal(normalizeGermanyCity("berlin"), "Berlin");
    assert.equal(getGermanyFederalState("Berlin"), "berlin");
  });

  it("normalizes Munich city and Bavaria state", () => {
    assert.equal(normalizeGermanyCity("München"), "Munich");
    assert.equal(normalizeGermanyCity("muenchen"), "Munich");
    assert.equal(getGermanyFederalState("Munich"), "bayern");
    assert.equal(isMunichCity("München"), true);
  });

  it("validates Berlin Bezirke", () => {
    assert.equal(isBerlinBezirk("mitte"), true);
    assert.equal(isBerlinBezirk("invalid"), false);
  });

  it("validates Munich rental unit types", () => {
    assert.equal(isMunichRentalUnitType("private_room"), true);
    assert.equal(isMunichRentalUnitType("whole_unit"), true);
    assert.equal(isMunichRentalUnitType("mitte"), false);
  });
});
