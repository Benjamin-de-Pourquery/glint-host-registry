import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInvoicePackCsv,
  buildStayConfirmationText,
  countStayNights,
  defaultInvoicePack,
  parseInvoicePackJson,
} from "../business-stay";

describe("business-stay", () => {
  it("counts nights between check-in and check-out", () => {
    const nights = countStayNights(new Date("2026-06-01"), new Date("2026-06-04"));
    assert.equal(nights, 3);
  });

  it("parses invoice pack with defaults", () => {
    const pack = parseInvoicePackJson(null);
    assert.equal(pack.accommodationVatRatePercent, 7);
    assert.equal(pack.extrasVatRatePercent, 19);
  });

  it("builds stay confirmation with project ref", () => {
    const text = buildStayConfirmationText({
      locale: "en",
      propertyName: "Flat A",
      propertyAddress: "Example 1",
      propertyCity: "Berlin",
      checkIn: new Date("2026-06-01"),
      checkOut: new Date("2026-06-03"),
      projectRef: "PRJ-9",
    });
    assert.match(text, /Project ref: PRJ-9/);
    assert.match(text, /2026-10-01/);
  });

  it("exports invoice CSV with Berlin city tax line when enabled", () => {
    const pack = defaultInvoicePack();
    pack.accommodationNetCents = 10_000;
    pack.cityTaxEnabled = true;
    const csv = buildInvoicePackCsv({
      stayId: "stay1",
      propertyName: "Flat A",
      checkIn: new Date("2026-06-01"),
      checkOut: new Date("2026-06-02"),
      pack,
    });
    assert.match(csv, /berlin_city_tax_cents,750/);
  });
});
