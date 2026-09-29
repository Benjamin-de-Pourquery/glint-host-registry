import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getSpainAutonomousCommunity,
  isCataloniaLocation,
  isLikelyCataloniaHutNumber,
  supportsSpainStrRegistrationCompliance,
} from "../regions";

describe("Spain Catalonia region resolution", () => {
  it("resolves Barcelona and Girona as Catalonia", () => {
    assert.equal(isCataloniaLocation("Barcelona"), true);
    assert.equal(isCataloniaLocation("Girona"), true);
    assert.equal(getSpainAutonomousCommunity("Sitges"), "catalonia");
  });

  it("does not treat Madrid as Catalonia", () => {
    assert.equal(isCataloniaLocation("Madrid"), false);
    assert.equal(getSpainAutonomousCommunity("Madrid"), "other");
  });

  it("scopes registration compliance to Catalonia only", () => {
    assert.equal(supportsSpainStrRegistrationCompliance("Spain", "Barcelona"), true);
    assert.equal(supportsSpainStrRegistrationCompliance("Spain", "Madrid"), false);
    assert.equal(supportsSpainStrRegistrationCompliance("France", "Barcelona"), false);
  });
});

describe("HUT number format", () => {
  it("accepts likely HUT prefixes", () => {
    assert.equal(isLikelyCataloniaHutNumber("HUT-123456"), true);
    assert.equal(isLikelyCataloniaHutNumber("hut 999"), true);
    assert.equal(isLikelyCataloniaHutNumber("NRUA-123"), false);
  });
});
