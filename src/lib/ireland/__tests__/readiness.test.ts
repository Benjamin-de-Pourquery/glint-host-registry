import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeIrelandReadiness } from "../readiness";

describe("computeIrelandReadiness", () => {
  it("marks data ready when core fields are set", () => {
    const result = computeIrelandReadiness({
      iePlanningStatus: "permission",
      ieEircode: "D02AF30",
      ieResidenceType: "primary",
      ieMaxGuests: 4,
      ieBedPlaces: 2,
    });
    assert.equal(result.dataReady, true);
    assert.ok(result.completeCount >= 6);
  });

  it("flags listing display when channels missing number", () => {
    const result = computeIrelandReadiness(
      {
        iePlanningStatus: "permission",
        ieEircode: "D02AF30",
        ieResidenceType: "primary",
        ieMaxGuests: 2,
        ieBedPlaces: 2,
        ieStlNumber: "STL-123",
      },
      [{ displayStatus: "MISSING" }]
    );
    const listing = result.checks.find((c) => c.key === "listing_display");
    assert.equal(listing?.complete, false);
  });
});
