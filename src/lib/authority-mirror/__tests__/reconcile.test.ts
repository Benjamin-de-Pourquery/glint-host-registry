import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { reconcile } from "../reconcile";

const periodStart = new Date("2026-03-01");
const periodEnd = new Date("2026-03-31T23:59:59.999Z");

describe("authority-mirror reconcile", () => {
  it("flags undeclared nights when platform exceeds tourist tax declaration", () => {
    const findings = reconcile({
      propertyId: "p1",
      periodStart,
      periodEnd,
      stays: [],
      platformReservations: [
        {
          id: "r1",
          channel: "AIRBNB",
          checkIn: new Date("2026-03-05"),
          checkOut: new Date("2026-03-08"),
          nights: 3,
          guests: 2,
          status: "confirmed",
          matchedStayId: null,
        },
      ],
      declared: {
        touristTaxNightsTotal: 1,
        guestReportsFiled: 0,
        guestReportsExpected: 0,
        nightCapUsed: 0,
        nightCapLimit: 120,
        nightCapExceeded: false,
        primaryRegistrationNumber: "NER-123",
        channelRegistrations: [],
        dac7DaysRented: null,
        dac7ImportedDays: null,
      },
    });

    assert.ok(findings.some((finding) => finding.code === "UNDECLARED_NIGHTS"));
  });

  it("flags orphan platform reservations without matched stays", () => {
    const findings = reconcile({
      propertyId: "p1",
      periodStart,
      periodEnd,
      stays: [],
      platformReservations: [
        {
          id: "r1",
          channel: "BOOKING",
          checkIn: new Date("2026-03-05"),
          checkOut: new Date("2026-03-07"),
          nights: 2,
          guests: 1,
          status: "confirmed",
          matchedStayId: null,
        },
      ],
      declared: {
        touristTaxNightsTotal: null,
        guestReportsFiled: 0,
        guestReportsExpected: 0,
        nightCapUsed: 0,
        nightCapLimit: 120,
        nightCapExceeded: false,
        primaryRegistrationNumber: null,
        channelRegistrations: [],
        dac7DaysRented: null,
        dac7ImportedDays: null,
      },
    });

    assert.ok(findings.some((finding) => finding.code === "ORPHAN_PLATFORM_RESERVATION"));
  });

  it("flags wrong registration key on channel", () => {
    const findings = reconcile({
      propertyId: "p1",
      periodStart,
      periodEnd,
      stays: [],
      platformReservations: [],
      declared: {
        touristTaxNightsTotal: null,
        guestReportsFiled: 0,
        guestReportsExpected: 0,
        nightCapUsed: 0,
        nightCapLimit: 120,
        nightCapExceeded: false,
        primaryRegistrationNumber: "NER-111",
        channelRegistrations: [
          { channel: "AIRBNB", displayedRegistrationNumber: "NER-222" },
        ],
        dac7DaysRented: null,
        dac7ImportedDays: null,
      },
    });

    assert.ok(findings.some((finding) => finding.code === "WRONG_KEY_ON_CHANNEL"));
  });

  it("flags DAC7 days mismatch", () => {
    const findings = reconcile({
      propertyId: "p1",
      periodStart,
      periodEnd,
      stays: [],
      platformReservations: [],
      declared: {
        touristTaxNightsTotal: null,
        guestReportsFiled: 0,
        guestReportsExpected: 0,
        nightCapUsed: 0,
        nightCapLimit: 120,
        nightCapExceeded: false,
        primaryRegistrationNumber: null,
        channelRegistrations: [],
        dac7DaysRented: 40,
        dac7ImportedDays: 30,
      },
    });

    assert.ok(findings.some((finding) => finding.code === "DAC7_DAYS_MISMATCH"));
  });
});
