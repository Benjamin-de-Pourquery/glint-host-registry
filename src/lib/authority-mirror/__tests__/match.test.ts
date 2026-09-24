import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchReservationsToStays, reservationsMatchStay } from "../match";

describe("authority-mirror match", () => {
  it("matches reservation to stay within one-day tolerance", () => {
    const reservation = {
      id: "r1",
      channel: "AIRBNB",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-04"),
      status: "confirmed",
    };
    const stay = {
      id: "s1",
      source: "airbnb",
      checkIn: new Date("2026-03-02"),
      checkOut: new Date("2026-03-04"),
      importStatus: "active",
    };

    assert.equal(reservationsMatchStay(reservation, stay), true);
  });

  it("does not match different channels", () => {
    const reservation = {
      id: "r1",
      channel: "BOOKING",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-04"),
      status: "confirmed",
    };
    const stay = {
      id: "s1",
      source: "airbnb",
      checkIn: new Date("2026-03-01"),
      checkOut: new Date("2026-03-04"),
      importStatus: "active",
    };

    assert.equal(reservationsMatchStay(reservation, stay), false);
  });

  it("assigns one-to-one matches", () => {
    const reservations = [
      {
        id: "r1",
        channel: "AIRBNB",
        checkIn: new Date("2026-03-01"),
        checkOut: new Date("2026-03-03"),
        status: "confirmed",
      },
      {
        id: "r2",
        channel: "AIRBNB",
        checkIn: new Date("2026-03-10"),
        checkOut: new Date("2026-03-12"),
        status: "confirmed",
      },
    ];
    const stays = [
      {
        id: "s1",
        source: "airbnb",
        checkIn: new Date("2026-03-01"),
        checkOut: new Date("2026-03-03"),
        importStatus: "active",
      },
      {
        id: "s2",
        source: "airbnb",
        checkIn: new Date("2026-03-10"),
        checkOut: new Date("2026-03-12"),
        importStatus: "active",
      },
    ];

    const matches = matchReservationsToStays(reservations, stays);
    assert.equal(matches.get("r1"), "s1");
    assert.equal(matches.get("r2"), "s2");
  });
});
