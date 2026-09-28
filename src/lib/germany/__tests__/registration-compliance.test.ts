import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasDeRegistrationNumber,
  needsGermanyRegistrationAttention,
} from "../registration-compliance";

describe("hasDeRegistrationNumber", () => {
  it("detects trimmed numbers", () => {
    assert.equal(hasDeRegistrationNumber({ deRegistrationNumber: "B-123" }), true);
    assert.equal(hasDeRegistrationNumber({ deRegistrationNumber: "  " }), false);
  });
});

describe("needsGermanyRegistrationAttention", () => {
  it("ignores non-Germany countries", () => {
    assert.equal(needsGermanyRegistrationAttention("France", null), false);
  });

  it("flags missing registration", () => {
    assert.equal(needsGermanyRegistrationAttention("Germany", null, "Berlin"), true);
  });

  it("clears when complete for Berlin", () => {
    assert.equal(
      needsGermanyRegistrationAttention(
        "Germany",
        {
          deFederalState: "berlin",
          deCityOrDistrict: "mitte",
          deOperatorCategory: "hauptwohnung",
          dePermitType: "genehmigung",
          deDossierPreparedAt: new Date("2026-09-01"),
          deRegistrationNumber: "ZW-999",
          deRegistrationStatus: "active",
          deRegistrationDisplayedOnListings: true,
        },
        "Berlin"
      ),
      false
    );
  });

  it("flags Munich awaiting portal without number", () => {
    assert.equal(
      needsGermanyRegistrationAttention(
        "Germany",
        {
          deFederalState: "bayern",
          deCityOrDistrict: "whole_unit",
          deOperatorCategory: "whole_unit",
          dePermitType: "zes_5a_registration",
          deDossierPreparedAt: new Date("2026-09-01"),
          deRegistrationStatus: "awaiting_registration_portal",
          deRegistrationDisplayedOnListings: false,
        },
        "Munich"
      ),
      true
    );
  });

  it("clears when complete for Munich with number", () => {
    assert.equal(
      needsGermanyRegistrationAttention(
        "Germany",
        {
          deFederalState: "bayern",
          deCityOrDistrict: "private_room",
          deOperatorCategory: "private_room",
          dePermitType: "zes_5a_registration",
          deDossierPreparedAt: new Date("2026-09-01"),
          deRegistrationNumber: "MUC-123",
          deRegistrationStatus: "active",
          deRegistrationDisplayedOnListings: true,
        },
        "Munich"
      ),
      false
    );
  });
});
