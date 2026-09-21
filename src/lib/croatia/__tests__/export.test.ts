import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildEvisitorCsvExport,
  EVISITOR_SYSTEM,
  getEvisitorPhaseFromNotes,
  EVISITOR_PHASE_NOTES,
} from "../export";

const guest = {
  id: "g1",
  lastName: "Horvat",
  firstNames: "Ana",
  dateOfBirth: new Date("1990-05-15"),
  placeOfBirth: "Zagreb",
  nationality: "HR",
  usualAddress: "Ilica 1",
  mobile: "+385911234567",
  email: "ana@example.com",
  arrivalDate: new Date("2026-07-01"),
  departureDate: new Date("2026-07-07"),
  documentType: "IDC",
  documentNumber: "123456789",
  sex: "F",
};

describe("buildEvisitorCsvExport", () => {
  it("includes guest data and phase", () => {
    const csv = buildEvisitorCsvExport({
      stayId: "stay1",
      checkInDate: new Date("2026-07-01"),
      checkOutDate: new Date("2026-07-07"),
      guestLabel: "Booking #123",
      guests: [guest],
      phase: "arrival",
    });
    assert.match(csv, /Horvat/);
    assert.match(csv, /arrival/);
    assert.match(csv, /eVisitor/);
  });
});

describe("EVISITOR_SYSTEM", () => {
  it("uses evisitor system string", () => {
    assert.equal(EVISITOR_SYSTEM, "evisitor");
  });
});

describe("getEvisitorPhaseFromNotes", () => {
  it("parses phase from notes", () => {
    assert.equal(getEvisitorPhaseFromNotes(EVISITOR_PHASE_NOTES.arrival), "arrival");
    assert.equal(getEvisitorPhaseFromNotes(EVISITOR_PHASE_NOTES.departure), "departure");
    assert.equal(getEvisitorPhaseFromNotes(null), null);
  });
});
