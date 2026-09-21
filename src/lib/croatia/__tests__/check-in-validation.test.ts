import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateCheckInForEvisitor } from "../check-in-validation";

const validInput = {
  lastName: "Horvat",
  firstNames: "Ana",
  dateOfBirth: "1990-05-15",
  placeOfBirth: "Zagreb",
  nationality: "HR",
  usualAddress: "Ilica 1, Zagreb",
  mobile: "+385911234567",
  email: "ana@example.com",
  arrivalDate: "2026-07-01",
  departureDate: "2026-07-07",
  documentType: "IDC",
  documentNumber: "123456789",
  sex: "F",
};

describe("validateCheckInForEvisitor", () => {
  it("returns no errors for valid input", () => {
    assert.equal(validateCheckInForEvisitor(validInput).length, 0);
  });

  it("requires document fields for all guests", () => {
    const errors = validateCheckInForEvisitor({
      ...validInput,
      documentType: undefined,
      documentNumber: undefined,
      sex: undefined,
    });
    assert.ok(errors.some((e) => e.field === "documentType"));
    assert.ok(errors.some((e) => e.field === "documentNumber"));
    assert.ok(errors.some((e) => e.field === "sex"));
  });

  it("validates sex values", () => {
    const errors = validateCheckInForEvisitor({ ...validInput, sex: "X" });
    assert.ok(errors.some((e) => e.field === "sex"));
  });
});
