import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDefaultTouristTaxSettings,
  computeTouristTaxSummary,
  countRentalNightsInPeriod,
  countStayNightsInPeriod,
  getDeclarationDueDate,
  getPeriodBounds,
  getTouristTaxPriorityAction,
  periodNeedsAttention,
  resolvePeriodStatus,
  touristTaxApplies,
} from "@/lib/france/tourist-tax";

describe("touristTaxApplies", () => {
  it("applies to French properties", () => {
    assert.equal(touristTaxApplies("France"), true);
    assert.equal(touristTaxApplies("FR"), true);
    assert.equal(touristTaxApplies("Spain"), false);
  });
});

describe("night counting in period", () => {
  it("clips stays to period window with hotel semantics", () => {
    const nights = countStayNightsInPeriod(
      "2026-01-28",
      "2026-02-05",
      new Date("2026-02-01"),
      new Date("2026-02-28")
    );
    assert.equal(nights, 4);
  });

  it("excludes cancelled stays from rental nights", () => {
    const nights = countRentalNightsInPeriod(
      [
        {
          checkInDate: "2026-01-10",
          checkOutDate: "2026-01-15",
          importStatus: "cancelled",
        },
        {
          checkInDate: "2026-01-20",
          checkOutDate: "2026-01-25",
          importStatus: "active",
        },
      ],
      new Date("2026-01-01"),
      new Date("2026-01-31")
    );
    assert.equal(nights, 5);
  });
});

describe("period bounds and due dates", () => {
  it("returns calendar month for monthly cadence", () => {
    const { periodStart, periodEnd } = getPeriodBounds(new Date("2026-03-15"), "monthly");
    assert.equal(periodStart.getMonth(), 2);
    assert.equal(periodEnd.getMonth(), 2);
  });

  it("sets declaration due to end of month after period end for monthly", () => {
    const due = getDeclarationDueDate(new Date("2026-01-31"), "monthly");
    assert.equal(due.getMonth(), 1);
    assert.equal(due.getDate(), 28);
  });
});

describe("resolvePeriodStatus", () => {
  it("marks past deadline as overdue", () => {
    const status = resolvePeriodStatus(
      new Date("2026-01-01"),
      new Date("2026-01-31"),
      "upcoming",
      "monthly",
      new Date("2026-04-01")
    );
    assert.equal(status, "overdue");
  });

  it("marks ended period before deadline as due", () => {
    const status = resolvePeriodStatus(
      new Date("2026-01-01"),
      new Date("2026-01-31"),
      "upcoming",
      "monthly",
      new Date("2026-02-15")
    );
    assert.equal(status, "due");
  });

  it("preserves declared status", () => {
    const status = resolvePeriodStatus(
      new Date("2026-01-01"),
      new Date("2026-01-31"),
      "declared",
      "monthly",
      new Date("2026-04-01")
    );
    assert.equal(status, "declared");
  });
});

describe("periodNeedsAttention", () => {
  it("flags overdue periods", () => {
    assert.equal(
      periodNeedsAttention("overdue", new Date("2026-02-28")),
      true
    );
  });

  it("flags due periods within 7 days of deadline", () => {
    const dueDate = new Date("2026-02-28");
    assert.equal(
      periodNeedsAttention("due", dueDate, new Date("2026-02-25")),
      true
    );
    assert.equal(
      periodNeedsAttention("due", dueDate, new Date("2026-02-10")),
      false
    );
  });
});

describe("computeTouristTaxSummary", () => {
  it("returns priority action for overdue period", () => {
    const settings = buildDefaultTouristTaxSettings();
    const summary = computeTouristTaxSummary(
      settings,
      [
        {
          id: "p1",
          periodStart: new Date("2026-01-01"),
          periodEnd: new Date("2026-01-31"),
          status: "overdue",
          nightsInPeriod: 12,
        },
      ],
      [],
      new Date("2026-04-01")
    );

    assert.equal(summary.attentionCount, 1);
    const action = getTouristTaxPriorityAction(summary);
    assert.ok(action);
    assert.equal(action?.level, "critical");
  });

  it("returns empty attention when disabled", () => {
    const summary = computeTouristTaxSummary(
      { ...buildDefaultTouristTaxSettings(), enabled: false },
      [
        {
          id: "p1",
          periodStart: new Date("2026-01-01"),
          periodEnd: new Date("2026-01-31"),
          status: "overdue",
          nightsInPeriod: 12,
        },
      ],
      []
    );
    assert.equal(summary.attentionCount, 0);
  });
});
