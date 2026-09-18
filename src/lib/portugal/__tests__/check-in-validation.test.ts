import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateCheckInForSiba } from "../check-in-validation";

const validForeignGuest = {
  lastName: "Smith",
  firstNames: "John",
  dateOfBirth: "1990-01-15",
  placeOfBirth: "London",
  nationality: "British",
  usualAddress: "10 Downing St",
  mobile: "+44123456789",
  email: "john@example.com",
  arrivalDate: "2026-09-20",
  departureDate: "2026-09-25",
  documentType: "PAS",
  documentNumber: "AB123456",
  sex: "M",
};

describe("validateCheckInForSiba", () => {
  it("passes for complete foreign guest data", () => {
    const errors = validateCheckInForSiba(validForeignGuest);
    assert.equal(errors.length, 0);
  });

  it("skips validation for Portuguese nationals", () => {
    const errors = validateCheckInForSiba({
      ...validForeignGuest,
      nationality: "Portuguese",
      documentType: undefined,
      documentNumber: undefined,
      sex: undefined,
    });
    assert.equal(errors.length, 0);
  });

  it("requires document fields for foreign guests", () => {
    const errors = validateCheckInForSiba({
      ...validForeignGuest,
      documentType: undefined,
      documentNumber: undefined,
    });
    assert.ok(errors.some((e) => e.field === "documentType"));
    assert.ok(errors.some((e) => e.field === "documentNumber"));
  });

  it("returns no errors for Portuguese nationals even with partial data", () => {
    const errors = validateCheckInForSiba({
      ...validForeignGuest,
      nationality: "Portugal",
      documentType: undefined,
      documentNumber: undefined,
      sex: undefined,
    });
    assert.equal(errors.length, 0);
  });
});
