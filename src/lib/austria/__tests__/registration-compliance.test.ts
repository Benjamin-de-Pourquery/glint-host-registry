import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasAtRegistrationNumber,
  needsAustriaRegistrationAttention,
} from "../registration-compliance";

describe("hasAtRegistrationNumber", () => {
  it("detects trimmed numbers", () => {
    assert.equal(hasAtRegistrationNumber({ atRegistrationNumber: "W-123" }), true);
    assert.equal(hasAtRegistrationNumber({ atRegistrationNumber: "  " }), false);
  });
});

describe("needsAustriaRegistrationAttention", () => {
  it("ignores non-Austria countries", () => {
    assert.equal(needsAustriaRegistrationAttention("France", null), false);
  });

  it("flags missing registration", () => {
    assert.equal(needsAustriaRegistrationAttention("Austria", null, "Vienna"), true);
  });

  it("clears when complete for Vienna", () => {
    assert.equal(
      needsAustriaRegistrationAttention("Austria", {
        atFederalState: "vienna",
        atDossierPreparedAt: new Date("2026-09-01"),
        atRegistrationNumber: "W-999",
        atRegistrationStatus: "active",
        atRegistrationDisplayedOnListings: true,
      }, "Vienna"),
      false
    );
  });
});
