import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  needsSpainRegistrationAttention,
  shouldRequireListingDisplay,
} from "../registration-compliance";

describe("needsSpainRegistrationAttention", () => {
  it("flags incomplete Madrid dossier", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "madrid",
          esLicenseKind: null,
          esDossierPreparedAt: null,
          esRegistrationStatus: "not_started",
        },
        "Madrid"
      ),
      true
    );
  });

  it("flags incomplete Valencian dossier", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "valencian",
          esLicenseKind: null,
          esDossierPreparedAt: null,
          esRegistrationStatus: "not_started",
        },
        "Valencia"
      ),
      true
    );
  });

  it("ignores non-supported Spain cities", () => {
    assert.equal(needsSpainRegistrationAttention("Spain", null, "Zaragoza"), false);
  });

  it("flags missing Andalucía registration for Seville", () => {
    assert.equal(needsSpainRegistrationAttention("Spain", null, "Seville"), true);
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

  it("clears when Catalonia complete", () => {
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

  it("clears when Valencian VUT complete", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "valencian",
          esLicenseKind: "vut",
          esDossierPreparedAt: "2026-10-01",
          esRegistrationNumber: "VT-CV-445566",
          esRegistrationStatus: "active",
          esRegistrationDisplayedOnListings: true,
        },
        "Valencia"
      ),
      false
    );
  });

  it("clears when Madrid VUT complete", () => {
    assert.equal(
      needsSpainRegistrationAttention(
        "Spain",
        {
          esAutonomousCommunity: "madrid",
          esLicenseKind: "vut",
          esDossierPreparedAt: "2026-09-01",
          esRegistrationNumber: "VUT-REG-9988",
          esRegistrationStatus: "active",
          esRegistrationDisplayedOnListings: true,
        },
        "Madrid"
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
