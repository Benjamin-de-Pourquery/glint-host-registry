import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasNlRegistrationNumber,
  needsNlRegistrationAttention,
} from "../registration-compliance";

describe("hasNlRegistrationNumber", () => {
  it("returns true when number is present", () => {
    assert.equal(hasNlRegistrationNumber({ nlRegistrationNumber: "NL-123" }), true);
    assert.equal(hasNlRegistrationNumber({ nlRegistrationNumber: "  " }), false);
    assert.equal(hasNlRegistrationNumber(null), false);
  });
});

describe("needsNlRegistrationAttention", () => {
  it("flags missing registration for NL properties", () => {
    assert.equal(needsNlRegistrationAttention("Netherlands", null), true);
    assert.equal(needsNlRegistrationAttention("France", null), false);
  });

  it("flags when registration not displayed on listings", () => {
    assert.equal(
      needsNlRegistrationAttention("Netherlands", {
        nlRegistrationNumber: "NL-123",
        nlRegistrationStatus: "active",
        nlRegistrationDisplayedOnListings: false,
        nlHolidayPermitStatus: "active",
      }),
      true
    );
  });

  it("flags when permit missing or expired", () => {
    assert.equal(
      needsNlRegistrationAttention("Netherlands", {
        nlRegistrationNumber: "NL-123",
        nlRegistrationStatus: "active",
        nlRegistrationDisplayedOnListings: true,
        nlHolidayPermitStatus: "not_started",
      }),
      true
    );
  });

  it("returns false when fully compliant", () => {
    assert.equal(
      needsNlRegistrationAttention("Netherlands", {
        nlRegistrationNumber: "NL-123",
        nlRegistrationStatus: "active",
        nlRegistrationDisplayedOnListings: true,
        nlHolidayPermitStatus: "active",
        nlHolidayPermitExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }),
      false
    );
  });
});
