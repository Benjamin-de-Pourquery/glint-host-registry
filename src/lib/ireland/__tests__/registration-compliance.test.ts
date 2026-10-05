import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasIeStlNumber, needsIrelandRegistrationAttention } from "../registration-compliance";

describe("hasIeStlNumber", () => {
  it("trims whitespace", () => {
    assert.equal(hasIeStlNumber({ ieStlNumber: "  IE-1  " }), true);
    assert.equal(hasIeStlNumber({ ieStlNumber: "  " }), false);
  });
});

describe("needsIrelandRegistrationAttention", () => {
  it("ignores non-Ireland properties", () => {
    assert.equal(needsIrelandRegistrationAttention("France", null), false);
  });

  it("needs attention when registration missing", () => {
    assert.equal(needsIrelandRegistrationAttention("Ireland", null), true);
  });

  it("needs attention when number present but listings missing", () => {
    assert.equal(
      needsIrelandRegistrationAttention(
        "Ireland",
        {
          ieStlNumber: "STL-9",
          ieStlStatus: "registered",
          iePlanningStatus: "permission",
          ieEircode: "D02AF30",
          ieResidenceType: "primary",
          ieMaxGuests: 2,
          ieBedPlaces: 2,
        },
        [{ displayStatus: "MISSING" }]
      ),
      true
    );
  });
});
