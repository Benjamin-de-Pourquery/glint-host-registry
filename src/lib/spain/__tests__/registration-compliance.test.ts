import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  needsSpainRegistrationAttention,
  shouldRequireListingDisplay,
} from "../registration-compliance";

describe("needsSpainRegistrationAttention", () => {
  it("ignores non-Catalonia Spain", () => {
    assert.equal(needsSpainRegistrationAttention("Spain", null, "Madrid"), false);
  });

  it("flags incomplete Barcelona dossier", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "catalonia",
          esLicenseKind: null,
          esDossierPreparedAt: null,
          esRegistrationStatus: "not_started",
        },
        "Barcelona"
      ),
      true
    );
  });

  it("flags missing listing display when HUT active", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "catalonia",
          esLicenseKind: "hut",
          esDossierPreparedAt: "2026-09-01",
          esRegistrationNumber: "HUT-123456",
          esRegistrationStatus: "active",
          esRegistrationDisplayedOnListings: false,
        },
        "Barcelona"
      ),
      true
    );
  });

  it("clears when complete", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "catalonia",
          esLicenseKind: "hut",
          esDossierPreparedAt: "2026-09-01",
          esRegistrationNumber: "HUT-123456",
          esRegistrationStatus: "active",
          esRegistrationDisplayedOnListings: true,
        },
        "Barcelona"
      ),
      false
    );
  });
});

describe("shouldRequireListingDisplay", () => {
  it("requires display when active with number", () => {
    assert.equal(
      shouldRequireListingDisplay({
        esRegistrationNumber: "HUT-1",
        esRegistrationStatus: "active",
      }),
      true
    );
  });
});
