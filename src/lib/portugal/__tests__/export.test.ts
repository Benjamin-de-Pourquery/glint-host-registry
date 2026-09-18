import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSibaCsvExport,
  filterForeignGuestsForSiba,
  validateStayForSibaExport,
} from "../export";

const foreignGuest = {
  id: "g1",
  lastName: "Smith",
  firstNames: "Jane",
  dateOfBirth: new Date("1985-06-10"),
  placeOfBirth: "Paris",
  nationality: "French",
  usualAddress: "1 Rue de Rivoli",
  mobile: "+33123456789",
  email: "jane@example.com",
  arrivalDate: new Date("2026-09-20"),
  departureDate: new Date("2026-09-25"),
  documentType: "PAS",
  documentNumber: "FR123456",
  sex: "F",
};

const portugueseGuest = {
  ...foreignGuest,
  id: "g2",
  lastName: "Silva",
  firstNames: "João",
  nationality: "Portuguese",
};

describe("filterForeignGuestsForSiba", () => {
  it("excludes Portuguese nationals", () => {
    const filtered = filterForeignGuestsForSiba([foreignGuest, portugueseGuest]);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, "g1");
  });
});

describe("buildSibaCsvExport", () => {
  it("includes CSV headers and foreign guest row", () => {
    const csv = buildSibaCsvExport({
      stayId: "stay1",
      checkInDate: new Date("2026-09-20"),
      checkOutDate: new Date("2026-09-25"),
      guestLabel: "Booking",
      guests: [foreignGuest, portugueseGuest],
      phase: "arrival",
    });
    assert.ok(csv.includes("apelido,nome,sexo"));
    assert.ok(csv.includes("Smith"));
    assert.ok(!csv.includes("Silva"));
    assert.ok(csv.includes("arrival"));
  });
});

describe("validateStayForSibaExport", () => {
  it("validates only foreign guests", () => {
    const errors = validateStayForSibaExport([portugueseGuest]);
    assert.equal(errors.length, 0);
  });

  it("reports missing fields for foreign guests", () => {
    const errors = validateStayForSibaExport([
      { ...foreignGuest, documentNumber: null },
    ]);
    assert.ok(errors.length > 0);
  });
});
