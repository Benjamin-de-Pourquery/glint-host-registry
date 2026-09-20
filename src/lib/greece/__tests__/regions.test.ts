import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getGreeceGuestReportingMode,
  isGreeceCountry,
  normalizeGreeceCity,
  requiresAadeCheckIn,
} from "../regions";

describe("isGreeceCountry", () => {
  it("recognizes Greece country aliases", () => {
    assert.equal(isGreeceCountry("Greece"), true);
    assert.equal(isGreeceCountry("GR"), true);
    assert.equal(isGreeceCountry("EL"), true);
    assert.equal(isGreeceCountry("Hellas"), true);
    assert.equal(isGreeceCountry("grèce"), true);
    assert.equal(isGreeceCountry("France"), false);
    assert.equal(isGreeceCountry("Portugal"), false);
  });
});

describe("getGreeceGuestReportingMode", () => {
  it("returns aade for Greece with city", () => {
    assert.equal(getGreeceGuestReportingMode("Greece", "Athina"), "aade");
    assert.equal(getGreeceGuestReportingMode("GR", "Thessaloniki"), "aade");
  });

  it("returns none without city or for non-Greece", () => {
    assert.equal(getGreeceGuestReportingMode("Greece", ""), "none");
    assert.equal(getGreeceGuestReportingMode("France", "Paris"), "none");
  });
});

describe("normalizeGreeceCity", () => {
  it("normalizes common aliases", () => {
    assert.equal(normalizeGreeceCity("athens"), "Athina");
    assert.equal(normalizeGreeceCity("thessaloniki"), "Thessaloniki");
    assert.equal(normalizeGreeceCity("crete"), "Heraklion");
  });
});

describe("requiresAadeCheckIn", () => {
  it("requires extended check-in for Greece", () => {
    assert.equal(requiresAadeCheckIn("Greece", "Athina"), true);
    assert.equal(requiresAadeCheckIn("France", "Paris"), false);
  });
});
