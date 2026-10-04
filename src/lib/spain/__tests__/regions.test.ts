import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getSpainAutonomousCommunity,
  getSpainGuestReportingMode,
  isCataloniaLocation,
  isLikelyCataloniaHutNumber,
  isLikelyMadridVutNumber,
  isLikelyAndaluciaVutNumber,
  isLikelyValencianVutNumber,
  isAndaluciaLocation,
  isMadridLocation,
  isValencianLocation,
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
    assert.equal(getSpainAutonomousCommunity("Madrid"), "madrid");
  });
});

describe("Spain Madrid region resolution", () => {
  it("resolves Madrid capital and Getafe as Comunidad de Madrid", () => {
    assert.equal(isMadridLocation("Madrid"), true);
    assert.equal(isMadridLocation("Getafe"), true);
    assert.equal(getSpainAutonomousCommunity("Getafe"), "madrid");
  });

  it("uses SES guest reporting for Madrid", () => {
    assert.equal(getSpainGuestReportingMode("Madrid"), "ses");
  });
});

describe("Spain Valencian region resolution", () => {
  it("resolves Valencia capital and Alicante as Comunitat Valenciana", () => {
    assert.equal(isValencianLocation("Valencia"), true);
    assert.equal(isValencianLocation("Alicante"), true);
    assert.equal(getSpainAutonomousCommunity("Benidorm"), "valencian");
  });

  it("uses SES guest reporting for Valencia", () => {
    assert.equal(getSpainGuestReportingMode("Valencia"), "ses");
  });
});

describe("Spain Andalucía region resolution", () => {
  it("resolves Seville and Málaga as Andalucía", () => {
    assert.equal(isAndaluciaLocation("Seville"), true);
    assert.equal(isAndaluciaLocation("Sevilla"), true);
    assert.equal(isAndaluciaLocation("Málaga"), true);
    assert.equal(getSpainAutonomousCommunity("Granada"), "andalucia");
  });

});

describe("Spain STR registration compliance scope", () => {
  it("includes Catalonia, Madrid, Comunitat Valenciana, and Andalucía", () => {
    assert.equal(supportsSpainStrRegistrationCompliance("Spain", "Barcelona"), true);
    assert.equal(supportsSpainStrRegistrationCompliance("Spain", "Madrid"), true);
    assert.equal(supportsSpainStrRegistrationCompliance("Spain", "Valencia"), true);
    assert.equal(supportsSpainStrRegistrationCompliance("Spain", "Seville"), true);
    assert.equal(supportsSpainStrRegistrationCompliance("France", "Barcelona"), false);
  });
});

describe("Regional registration number format", () => {
  it("accepts likely HUT prefixes", () => {
    assert.equal(isLikelyCataloniaHutNumber("HUT-123456"), true);
    assert.equal(isLikelyCataloniaHutNumber("hut 999"), true);
    assert.equal(isLikelyCataloniaHutNumber("NRUA-123"), false);
  });

  it("accepts Madrid VUT references without HUT prefix", () => {
    assert.equal(isLikelyMadridVutNumber("CM-VUT-12345"), true);
    assert.equal(isLikelyMadridVutNumber("HUT-1"), false);
  });

  it("accepts Valencian Registro Turismo references without HUT prefix", () => {
    assert.equal(isLikelyValencianVutNumber("VT-CV-12345"), true);
    assert.equal(isLikelyValencianVutNumber("HUT-1"), false);
  });

  it("accepts Andalucía VUT/PROVINCE pattern", () => {
    assert.equal(isLikelyAndaluciaVutNumber("VUT/MA/12345"), true);
    assert.equal(isLikelyAndaluciaVutNumber("VUT-SE-99999"), true);
    assert.equal(isLikelyAndaluciaVutNumber("HUT-1"), false);
  });
});
