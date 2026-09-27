import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isGermanyCountry,
  getGermanyFederalState,
  normalizeGermanyCity,
  isBerlinBezirk,
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

  it("validates Berlin Bezirke", () => {
    assert.equal(isBerlinBezirk("mitte"), true);
    assert.equal(isBerlinBezirk("invalid"), false);
  });
});
