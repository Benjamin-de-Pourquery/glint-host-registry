import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAadeCsvExport } from "../export";

describe("buildAadeCsvExport", () => {
  it("includes guest row and AMA in CSV", () => {
    const csv = buildAadeCsvExport({
      stayId: "stay-123",
      checkInDate: new Date(2026, 6, 1),
      checkOutDate: new Date(2026, 6, 5),
      guestLabel: "Smith party",
      amaNumber: "AMA-999",
      propertyAddress: "1 Plaka St",
      propertyCity: "Athina",
      guests: [
        {
          id: "g1",
          lastName: "Smith",
          firstNames: "John",
          dateOfBirth: new Date(1990, 0, 15),
          placeOfBirth: "London",
          nationality: "GB",
          usualAddress: "1 High St",
          mobile: "+441234",
          email: "john@example.com",
          arrivalDate: new Date(2026, 6, 1),
          departureDate: new Date(2026, 6, 5),
          documentType: "PAS",
          documentNumber: "AB123",
          sex: "M",
        },
      ],
    });

    assert.match(csv, /Glint Host Registry — AADE/);
    assert.match(csv, /Smith/);
    assert.match(csv, /AMA-999/);
    assert.match(csv, /epwnymo/);
  });
});
