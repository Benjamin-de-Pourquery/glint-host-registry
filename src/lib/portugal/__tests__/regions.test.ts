import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getPortugalGuestReportingMode,
  isPortugalCountry,
  isPortugalGuestReporting,
  normalizePortugalCity,
} from "../regions";

describe("isPortugalCountry", () => {
  it("recognizes Portugal aliases", () => {
    assert.equal(isPortugalCountry("Portugal"), true);
    assert.equal(isPortugalCountry("PT"), true);
    assert.equal(isPortugalCountry("portuguese"), true);
    assert.equal(isPortugalCountry("France"), false);
  });
});

describe("getPortugalGuestReportingMode", () => {
  it("returns siba for Portuguese cities", () => {
    assert.equal(getPortugalGuestReportingMode("Lisboa"), "siba");
    assert.equal(getPortugalGuestReportingMode("Porto"), "siba");
    assert.equal(getPortugalGuestReportingMode("Faro"), "siba");
    assert.equal(getPortugalGuestReportingMode("Funchal"), "siba");
  });

  it("returns none without city", () => {
    assert.equal(getPortugalGuestReportingMode(""), "none");
  });
});

describe("normalizePortugalCity", () => {
  it("normalizes city aliases", () => {
    assert.equal(normalizePortugalCity("lisbon"), "Lisboa");
    assert.equal(normalizePortugalCity("oporto"), "Porto");
    assert.equal(normalizePortugalCity("madeira"), "Funchal");
  });
});

describe("isPortugalGuestReporting", () => {
  it("is true when mode is siba", () => {
    assert.equal(isPortugalGuestReporting("Lisboa"), true);
  });
});
