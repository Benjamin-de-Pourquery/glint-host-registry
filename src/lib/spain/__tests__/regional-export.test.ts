import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildRegionalCsvExport,
  validateStayForRegionalExport,
} from "../regional-export";

const sampleGuest = {
  id: "guest-1",
  lastName: "García",
  firstNames: "María",
  dateOfBirth: new Date("1990-05-15"),
  placeOfBirth: "Madrid",
  nationality: "Spain",
  usualAddress: "Calle Mayor 1",
  mobile: "+34600111222",
  email: "maria@example.com",
  arrivalDate: new Date("2026-09-12"),
  departureDate: new Date("2026-09-15"),
  documentType: "NIF",
  documentNumber: "12345678Z",
  documentSupport: "AAA123456",
  sex: "M",
  kinship: null,
  postalCode: "08001",
  municipalityCode: "08019",
  municipalityName: null,
  addressCountryAlpha3: "ESP",
  accompanyingChildrenJson: null,
};

describe("Regional export", () => {
  it("builds CSV with Annex I headers for mossos", () => {
    const csv = buildRegionalCsvExport(
      {
        stayId: "stay-1",
        checkInDate: new Date("2026-09-12"),
        checkOutDate: new Date("2026-09-15"),
        guestLabel: "Booking guest",
        guests: [sampleGuest],
      },
      "mossos"
    );

    assert.ok(csv.includes("Mossos d'Esquadra"));
    assert.ok(csv.includes("lastName"));
    assert.ok(csv.includes("García"));
    assert.ok(csv.includes("12345678Z"));
  });

  it("builds CSV for ertzaintza", () => {
    const csv = buildRegionalCsvExport(
      {
        stayId: "stay-2",
        checkInDate: new Date("2026-09-12"),
        checkOutDate: new Date("2026-09-15"),
        guestLabel: null,
        guests: [sampleGuest],
      },
      "ertzaintza"
    );

    assert.ok(csv.includes("Ertzaintza"));
    assert.ok(csv.includes("maria@example.com"));
  });

  it("validates complete guest data", () => {
    const errors = validateStayForRegionalExport([sampleGuest]);
    assert.equal(errors.length, 0);
  });

  it("flags missing document number", () => {
    const errors = validateStayForRegionalExport([
      { ...sampleGuest, documentNumber: null },
    ]);
    assert.ok(errors.some((e) => e.field === "documentNumber"));
  });
});
