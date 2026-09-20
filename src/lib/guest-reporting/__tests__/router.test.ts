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

  it("routes Portugal to SIBA", () => {
    assert.equal(getGuestReportingJurisdiction("Portugal", "Lisboa"), "portugal_siba");
    assert.equal(getGuestReportingJurisdiction("Portugal", "Porto"), "portugal_siba");
  });

  it("does not route Portugal to Spain or Italy systems", () => {
    assert.notEqual(getGuestReportingJurisdiction("Portugal", "Lisboa"), "spain_ses");
    assert.notEqual(getGuestReportingJurisdiction("Portugal", "Lisboa"), "italy_alloggiati");
    assert.notEqual(getGuestReportingJurisdiction("Portugal", "Lisboa"), "spain_mossos");
  });

  it("routes Greece to AADE", () => {
    assert.equal(getGuestReportingJurisdiction("Greece", "Athina"), "greece_aade");
    assert.equal(getGuestReportingJurisdiction("GR", "Thessaloniki"), "greece_aade");
    assert.equal(getGuestReportingJurisdiction("EL", "Rhodes"), "greece_aade");
  });

  it("does not route Greece to SES, SIBA, or Alloggiati", () => {
    assert.notEqual(getGuestReportingJurisdiction("Greece", "Athina"), "spain_ses");
    assert.notEqual(getGuestReportingJurisdiction("Greece", "Athina"), "portugal_siba");
    assert.notEqual(getGuestReportingJurisdiction("Greece", "Athina"), "italy_alloggiati");
  });
});

describe("requiresExtendedGuestCheckIn", () => {
  it("requires extended fields for Spain and Italy guest reporting", () => {
    assert.equal(requiresExtendedGuestCheckIn("Spain", "Madrid"), true);
    assert.equal(requiresExtendedGuestCheckIn("Italy", "Roma"), true);
    assert.equal(requiresExtendedGuestCheckIn("France", "Paris"), false);
    assert.equal(requiresExtendedGuestCheckIn("Portugal", "Lisboa"), true);
    assert.equal(requiresExtendedGuestCheckIn("Greece", "Athina"), true);
  });

  it("isolates Portugal from SES and Alloggiati", () => {
    assert.notEqual(getGuestReportingJurisdiction("Portugal", "Lisboa"), "spain_ses");
    assert.notEqual(getGuestReportingJurisdiction("Portugal", "Lisboa"), "italy_alloggiati");
  });
});
