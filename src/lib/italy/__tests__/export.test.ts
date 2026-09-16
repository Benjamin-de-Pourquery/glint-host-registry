import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildAlloggiatiCsvExport,
  validateStayForAlloggiatiExport,
} from "../export";

const validGuest = {
  id: "guest-1",
  lastName: "Rossi",
  firstNames: "Mario",
  dateOfBirth: new Date("1990-05-15"),
  placeOfBirth: "Roma",
  nationality: "ITA",
  usualAddress: "Via Roma 1",
  mobile: "+393331234567",
  email: "mario@example.com",
  arrivalDate: new Date("2026-09-20"),
  departureDate: new Date("2026-09-25"),
  documentType: "PAS",
  documentNumber: "YA1234567",
  sex: "M",
  postalCode: "00100",
  municipalityName: "Roma",
  addressCountryAlpha3: "ITA",
  accompanyingChildrenJson: null,
};

describe("buildAlloggiatiCsvExport", () => {
  it("includes Italian column headers and guest data", () => {
    const csv = buildAlloggiatiCsvExport({
      stayId: "stay-1",
      checkInDate: new Date("2026-09-20"),
      checkOutDate: new Date("2026-09-25"),
      guestLabel: "Booking guest",
      guests: [validGuest],
    });

    assert.match(csv, /cognome,nome,sesso/);
    assert.match(csv, /Rossi,Mario,M/);
    assert.match(csv, /Alloggiati Web schedina export/);
    assert.match(csv, /Manual portal entry/);
  });
});

describe("validateStayForAlloggiatiExport", () => {
  it("passes for complete guest records", () => {
    const errors = validateStayForAlloggiatiExport([validGuest]);
    assert.equal(errors.length, 0);
  });

  it("flags missing document fields", () => {
    const errors = validateStayForAlloggiatiExport([
      { ...validGuest, id: "guest-2", documentNumber: null, sex: null },
    ]);
    assert.ok(errors.some((e) => e.field === "documentNumber"));
    assert.ok(errors.some((e) => e.field === "sex"));
  });
});
