import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getGuestReportingJurisdiction,
  requiresExtendedGuestCheckIn,
} from "../router";

describe("getGuestReportingJurisdiction", () => {
  it("routes Spain cities correctly", () => {
    assert.equal(getGuestReportingJurisdiction("Spain", "Madrid"), "spain_ses");
    assert.equal(getGuestReportingJurisdiction("Spain", "Barcelona"), "spain_mossos");
    assert.equal(getGuestReportingJurisdiction("Spain", "Bilbao"), "spain_ertzaintza");
  });

  it("routes Italy to alloggiati", () => {
    assert.equal(getGuestReportingJurisdiction("Italy", "Roma"), "italy_alloggiati");
    assert.equal(getGuestReportingJurisdiction("Italy", "Milano"), "italy_alloggiati");
  });

  it("does not route Italy cities to Spain systems", () => {
    assert.notEqual(getGuestReportingJurisdiction("Italy", "Roma"), "spain_ses");
    assert.notEqual(getGuestReportingJurisdiction("Italy", "Roma"), "spain_mossos");
  });

  it("routes France", () => {
    assert.equal(getGuestReportingJurisdiction("France", "Paris"), "france");
  });
});

describe("requiresExtendedGuestCheckIn", () => {
  it("requires extended fields for Spain and Italy guest reporting", () => {
    assert.equal(requiresExtendedGuestCheckIn("Spain", "Madrid"), true);
    assert.equal(requiresExtendedGuestCheckIn("Italy", "Roma"), true);
    assert.equal(requiresExtendedGuestCheckIn("France", "Paris"), false);
  });
});
