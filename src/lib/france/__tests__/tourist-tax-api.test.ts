import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDeclarationDueDate,
  type TouristTaxResponse,
} from "@/lib/france/tourist-tax-api";

describe("formatDeclarationDueDate", () => {
  it("formats ISO strings from the tourist-tax API", () => {
    const formatted = formatDeclarationDueDate("2026-03-15T00:00:00.000Z", "en");
    assert.match(formatted, /15/);
    assert.match(formatted, /2026/);
  });

  it("accepts Date instances", () => {
    const formatted = formatDeclarationDueDate(new Date("2026-01-10T12:00:00.000Z"), "fr");
    assert.match(formatted, /2026/);
  });
});

describe("TouristTaxResponse", () => {
  it("allows serialized period dates as in JSON responses", () => {
    const payload: TouristTaxResponse = {
      applies: true,
      settings: null,
      summary: {
        enabled: true,
        collectionMode: "unknown",
        declarationCadence: "quarterly",
        attentionCount: 2,
        overdueCount: 1,
        dueCount: 1,
        nextDuePeriod: {
          id: "p1",
          periodStart: "2026-01-01T00:00:00.000Z",
          periodEnd: "2026-03-31T00:00:00.000Z",
          status: "due",
          declarationDueDate: "2026-04-15T00:00:00.000Z",
          daysUntilDue: 3,
          needsAttention: true,
        },
        periods: [
          {
            id: "p1",
            periodStart: "2026-01-01T00:00:00.000Z",
            periodEnd: "2026-03-31T00:00:00.000Z",
            status: "due",
            declarationDueDate: "2026-04-15T00:00:00.000Z",
            daysUntilDue: 3,
            needsAttention: true,
            nightsInPeriod: 4,
          },
          {
            id: "p2",
            periodStart: "2025-10-01T00:00:00.000Z",
            periodEnd: "2025-12-31T00:00:00.000Z",
            status: "overdue",
            declarationDueDate: "2026-01-15T00:00:00.000Z",
            daysUntilDue: -10,
            needsAttention: true,
            nightsInPeriod: 2,
          },
        ],
      },
      priorityAction: null,
    };

    for (const period of payload.summary!.periods) {
      if (period.status === "due" || period.status === "overdue") {
        assert.doesNotThrow(() =>
          formatDeclarationDueDate(period.declarationDueDate, "en")
        );
      }
    }
  });
});
