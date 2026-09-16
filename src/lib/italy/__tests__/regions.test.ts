import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getItalyGuestReportingMode,
  isItalyCountry,
  isItalyGuestReporting,
  normalizeItalyCity,
  requiresAlloggiatiCheckIn,
} from "../regions";

describe("isItalyCountry", () => {
  it("recognizes Italy country variants", () => {
    assert.equal(isItalyCountry("Italy"), true);
    assert.equal(isItalyCountry("IT"), true);
    assert.equal(isItalyCountry("italia"), true);
    assert.equal(isItalyCountry("France"), false);
    assert.equal(isItalyCountry("Spain"), false);
  });
});

describe("getItalyGuestReportingMode", () => {
  it("returns alloggiati for Italian cities", () => {
    assert.equal(getItalyGuestReportingMode("Roma"), "alloggiati");
    assert.equal(getItalyGuestReportingMode("Milano"), "alloggiati");
    assert.equal(getItalyGuestReportingMode("Firenze"), "alloggiati");
    assert.equal(getItalyGuestReportingMode("Venezia"), "alloggiati");
  });

  it("returns none for empty city", () => {
    assert.equal(getItalyGuestReportingMode(""), "none");
  });
});

describe("normalizeItalyCity", () => {
  it("normalizes common aliases", () => {
    assert.equal(normalizeItalyCity("rome"), "Roma");
    assert.equal(normalizeItalyCity("milan"), "Milano");
    assert.equal(normalizeItalyCity("florence"), "Firenze");
    assert.equal(normalizeItalyCity("venice"), "Venezia");
  });
});

describe("requiresAlloggiatiCheckIn", () => {
  it("requires extended check-in for Italy properties with city", () => {
    assert.equal(requiresAlloggiatiCheckIn("Roma"), true);
    assert.equal(isItalyGuestReporting("Napoli"), true);
    assert.equal(requiresAlloggiatiCheckIn(""), false);
  });
});
