import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  countNightsBetween,
  countRentalNightsInYear,
  countStayNightsInYear,
  computeNightCapStatus,
  defaultNightCapLimitForCity,
  defaultNightCapSourceForCity,
  getNightCapPriorityAction,
  nightCapApplies,
  resolveNightCapStatusLevel,
  shouldCountStayForNightCap,
} from "@/lib/france/night-cap";

describe("night cap — night counting", () => {
  it("counts hotel nights as check-in inclusive, check-out exclusive", () => {
    assert.equal(
      countNightsBetween(new Date(2026, 0, 1), new Date(2026, 0, 3)),
      2
    );
    assert.equal(
      countNightsBetween(new Date(2026, 0, 1), new Date(2026, 0, 2)),
      1
    );
    assert.equal(
      countNightsBetween(new Date(2026, 0, 1), new Date(2026, 0, 1)),
      0
    );
  });

  it("counts only nights within the calendar year", () => {
    assert.equal(
      countStayNightsInYear(
        new Date(2025, 11, 28),
        new Date(2026, 0, 3),
        2026
      ),
      2
    );
    assert.equal(
      countStayNightsInYear(
        new Date(2026, 11, 31),
        new Date(2027, 0, 2),
        2026
      ),
      1
    );
  });

  it("sums stays and excludes cancelled or removed imports", () => {
    const stays = [
      {
        checkInDate: new Date(2026, 5, 1),
        checkOutDate: new Date(2026, 5, 4),
        importStatus: "active",
      },
      {
        checkInDate: new Date(2026, 6, 1),
        checkOutDate: new Date(2026, 6, 3),
        importStatus: "cancelled",
      },
      {
        checkInDate: new Date(2026, 7, 1),
        checkOutDate: new Date(2026, 7, 2),
        importStatus: null,
      },
      {
        checkInDate: new Date(2026, 8, 1),
        checkOutDate: new Date(2026, 8, 5),
        importStatus: "removed_from_feed",
      },
    ];

    assert.equal(countRentalNightsInYear(stays, 2026), 4);
    assert.equal(shouldCountStayForNightCap("cancelled"), false);
    assert.equal(shouldCountStayForNightCap("active"), true);
    assert.equal(shouldCountStayForNightCap(null), true);
  });
});

describe("night cap — city defaults", () => {
  it("uses commune 90 for Paris and statutory 120 for Lille", () => {
    assert.equal(defaultNightCapSourceForCity("Paris"), "commune_90");
    assert.equal(defaultNightCapLimitForCity("Paris"), 90);
    assert.equal(defaultNightCapSourceForCity("Lille"), "statutory_120");
    assert.equal(defaultNightCapLimitForCity("Lille"), 120);
  });
});

describe("night cap — applicability and thresholds", () => {
  it("applies only to French primary residences", () => {
    assert.equal(nightCapApplies("France", "primary"), true);
    assert.equal(nightCapApplies("FR", "primary"), true);
    assert.equal(nightCapApplies("France", "secondary"), false);
    assert.equal(nightCapApplies("Spain", "primary"), false);
  });

  it("resolves status levels at 70%, 90%, and over limit", () => {
    assert.equal(resolveNightCapStatusLevel(50, 120, true), "ok");
    assert.equal(resolveNightCapStatusLevel(84, 120, true), "warning");
    assert.equal(resolveNightCapStatusLevel(108, 120, true), "critical");
    assert.equal(resolveNightCapStatusLevel(121, 120, true), "exceeded");
    assert.equal(resolveNightCapStatusLevel(10, 120, false), "disabled");
  });

  it("computes full status snapshot", () => {
    const computation = computeNightCapStatus(
      [
        {
          checkInDate: new Date(2026, 0, 1),
          checkOutDate: new Date(2026, 0, 91),
          importStatus: "active",
        },
      ],
      {
        nightCapEnabled: true,
        nightCapLimit: 90,
        nightCapYear: 2026,
        nightCapSource: "commune_90",
      },
      2026
    );

    assert.equal(computation.nightsUsed, 90);
    assert.equal(computation.remaining, 0);
    assert.equal(computation.status, "critical");
  });

  it("returns priority action for critical and exceeded states", () => {
    const critical = computeNightCapStatus(
      [
        {
          checkInDate: new Date(2026, 0, 1),
          checkOutDate: new Date(2026, 0, 110),
          importStatus: "active",
        },
      ],
      {
        nightCapEnabled: true,
        nightCapLimit: 120,
        nightCapYear: 2026,
        nightCapSource: "statutory_120",
      }
    );
    const action = getNightCapPriorityAction(critical);
    assert.ok(action);
    assert.equal(action?.level, "critical");

    const exceeded = computeNightCapStatus(
      [
        {
          checkInDate: new Date(2026, 0, 1),
          checkOutDate: new Date(2026, 0, 122),
          importStatus: "active",
        },
      ],
      {
        nightCapEnabled: true,
        nightCapLimit: 120,
        nightCapYear: 2026,
        nightCapSource: "statutory_120",
      }
    );
    assert.equal(getNightCapPriorityAction(exceeded)?.level, "exceeded");
  });
});
