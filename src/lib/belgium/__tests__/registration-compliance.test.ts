import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hasBeRegistrationNumber,
  isBeDossierComplete,
  needsBelgiumRegistrationAttention,
  getBelgiumDossierProgress,
} from "../registration-compliance";

describe("hasBeRegistrationNumber", () => {
  it("detects trimmed numbers", () => {
    assert.equal(hasBeRegistrationNumber({ beRegistrationNumber: "BE-123" }), true);
    assert.equal(hasBeRegistrationNumber({ beRegistrationNumber: "  " }), false);
  });
});

describe("isBeDossierComplete", () => {
  it("requires urban planning for Brussels", () => {
    assert.equal(
      isBeDossierComplete(
        {
          beFireSafetyStatus: "valid",
          beInsuranceStatus: "valid",
          beUrbanPlanningStatus: "not_started",
        },
        "brussels"
      ),
      false
    );
    assert.equal(
      isBeDossierComplete(
        {
          beFireSafetyStatus: "valid",
          beInsuranceStatus: "valid",
          beUrbanPlanningStatus: "valid",
        },
        "brussels"
      ),
      true
    );
  });

  it("does not require urban planning for Flanders", () => {
    assert.equal(
      isBeDossierComplete(
        {
          beFireSafetyStatus: "pending",
          beInsuranceStatus: "valid",
        },
        "flanders"
      ),
      true
    );
  });
});

describe("needsBelgiumRegistrationAttention", () => {
  it("flags missing registration for BE properties", () => {
    assert.equal(needsBelgiumRegistrationAttention("Belgium", null), true);
    assert.equal(needsBelgiumRegistrationAttention("France", null), false);
  });

  it("flags missing region", () => {
    assert.equal(
      needsBelgiumRegistrationAttention("Belgium", {
        beRegion: null,
      }),
      true
    );
  });

  it("clears when complete and displayed", () => {
    assert.equal(
      needsBelgiumRegistrationAttention("Belgium", {
        beRegion: "flanders",
        beRegistrationNumber: "FL-123",
        beRegistrationStatus: "active",
        beRegistrationDisplayedOnListings: true,
        beFireSafetyStatus: "valid",
        beInsuranceStatus: "valid",
      }),
      false
    );
  });
});

describe("getBelgiumDossierProgress", () => {
  it("counts Brussels dossier items", () => {
    const progress = getBelgiumDossierProgress(
      {
        beOperatorCategory: "private",
        beFireSafetyStatus: "valid",
        beInsuranceStatus: "valid",
        beUrbanPlanningStatus: "pending",
      },
      "brussels"
    );
    assert.equal(progress.completed, 4);
    assert.equal(progress.total, 4);
  });
});
