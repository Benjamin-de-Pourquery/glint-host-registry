import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateCheckInForSes } from "../check-in-validation";

describe("SES check-in validation", () => {
  const validInput = {
    lastName: "García",
    firstNames: "Juan",
    dateOfBirth: "1990-05-15",
    nationality: "Spain",
    usualAddress: "Calle Mayor 1, Madrid",
    mobile: "+34600111222",
    email: "juan@example.com",
    arrivalDate: "2026-09-12",
    departureDate: "2026-09-15",
    documentType: "NIF",
    documentNumber: "12345678Z",
    documentSupport: "AAA123456",
    sex: "H",
    postalCode: "28001",
    municipalityCode: "28079",
    addressCountryAlpha3: "ESP",
  };

  it("passes valid Spain SES check-in", () => {
    const errors = validateCheckInForSes(validInput);
    assert.equal(errors.length, 0);
  });

  it("requires document number for adults", () => {
    const errors = validateCheckInForSes({ ...validInput, documentNumber: "" });
    assert.ok(errors.some((e) => e.field === "documentNumber"));
  });

  it("requires document support for NIF", () => {
    const errors = validateCheckInForSes({ ...validInput, documentSupport: "" });
    assert.ok(errors.some((e) => e.field === "documentSupport"));
  });

  it("requires sex for adults", () => {
    const errors = validateCheckInForSes({ ...validInput, sex: "" });
    assert.ok(errors.some((e) => e.field === "sex"));
  });

  it("requires municipality for Spanish address", () => {
    const errors = validateCheckInForSes({
      ...validInput,
      municipalityCode: "",
      municipalityName: "",
    });
    assert.ok(errors.some((e) => e.field === "municipality"));
  });

  it("accepts foreign municipality name without code", () => {
    const errors = validateCheckInForSes({
      ...validInput,
      addressCountryAlpha3: "FRA",
      municipalityCode: "",
      municipalityName: "Paris",
    });
    assert.equal(errors.length, 0);
  });
});

describe("SES due queue status logic", () => {
  const HOURS_24_MS = 24 * 60 * 60 * 1000;

  function resolveStatus(
    now: Date,
    checkIn: Date,
    guestCount: number,
    latestStatus: string | null
  ): string {
    const deadline = new Date(checkIn.getTime() + HOURS_24_MS);
    const isOverdue = now.getTime() > deadline.getTime();

    if (checkIn.getTime() > now.getTime()) {
      return guestCount === 0 ? "awaiting_guest_data" : "prep_window";
    }
    if (isOverdue) return "overdue";
    if (guestCount === 0) return "awaiting_guest_data";
    if (latestStatus === "rejected" || latestStatus === "dry_run") {
      return "validation_needed";
    }
    return "awaiting_submission";
  }

  it("marks upcoming stay without guests as awaiting_guest_data", () => {
    const now = new Date("2026-09-10T12:00:00Z");
    const checkIn = new Date("2026-09-11T14:00:00Z");
    assert.equal(resolveStatus(now, checkIn, 0, null), "awaiting_guest_data");
  });

  it("marks upcoming stay with guests as prep_window", () => {
    const now = new Date("2026-09-10T12:00:00Z");
    const checkIn = new Date("2026-09-11T14:00:00Z");
    assert.equal(resolveStatus(now, checkIn, 2, null), "prep_window");
  });

  it("marks past deadline as overdue", () => {
    const checkIn = new Date("2026-09-10T14:00:00Z");
    const now = new Date(checkIn.getTime() + HOURS_24_MS + 1000);
    assert.equal(resolveStatus(now, checkIn, 1, null), "overdue");
  });

  it("marks dry_run as validation_needed", () => {
    const checkIn = new Date("2026-09-12T14:00:00Z");
    const now = new Date("2026-09-12T20:00:00Z");
    assert.equal(resolveStatus(now, checkIn, 1, "dry_run"), "validation_needed");
  });

  it("marks ready stay as awaiting_submission", () => {
    const checkIn = new Date("2026-09-12T14:00:00Z");
    const now = new Date("2026-09-12T20:00:00Z");
    assert.equal(resolveStatus(now, checkIn, 1, null), "awaiting_submission");
  });
});
