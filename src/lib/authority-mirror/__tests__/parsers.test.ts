import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseAirbnbCsv } from "../parsers/airbnb";
import { parseBookingCsv } from "../parsers/booking";
import { parseGenericCsv } from "../parsers/generic";

const fixturesDir = join(import.meta.dirname, "fixtures");

describe("authority-mirror parsers", () => {
  it("parses Airbnb reservations CSV and skips cancelled rows", () => {
    const content = readFileSync(join(fixturesDir, "airbnb-reservations.csv"), "utf-8");
    const rows = parseAirbnbCsv(content);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].externalRef, "HM123ABC");
    assert.equal(rows[0].nights, 3);
    assert.equal(rows[0].guests, 2);
  });

  it("parses Booking.com reservations CSV with EU dates", () => {
    const content = readFileSync(join(fixturesDir, "booking-reservations.csv"), "utf-8");
    const rows = parseBookingCsv(content);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].externalRef, "BK-10001");
    assert.equal(rows[0].checkIn.getMonth(), 2);
    assert.equal(rows[0].nights, 3);
  });

  it("parses generic CSV with explicit column mapping", () => {
    const content = [
      "ref,start,end,nights,guests",
      "GEN-1,2026-04-01,2026-04-03,2,2",
    ].join("\n");
    const rows = parseGenericCsv(content, {
      externalRef: "ref",
      checkIn: "start",
      checkOut: "end",
      nights: "nights",
      guests: "guests",
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].externalRef, "GEN-1");
    assert.equal(rows[0].nights, 2);
  });
});
