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
});
