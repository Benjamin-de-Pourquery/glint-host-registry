import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeCapGuardForecast,
  computeGuardBlocks,
  countFutureBookedNights,
  parseBudgetWindows,
  suggestBufferNights,
} from "@/lib/cap-guard/compute-blocks";
import type { CapGuardPolicyInput } from "@/lib/cap-guard/types";
import type { NightCapComputation } from "@/lib/france/night-cap";

const baseComputation = (
  overrides: Partial<NightCapComputation> = {}
): NightCapComputation => ({
  year: 2026,
  nightsUsed: 100,
  limit: 120,
  remaining: 20,
  percentUsed: 83.3,
  status: "warning",
  enabled: true,
  source: "statutory_120",
  ...overrides,
});

const basePolicy = (
  overrides: Partial<CapGuardPolicyInput> = {}
): CapGuardPolicyInput => ({
  enabled: true,
  mode: "BUFFER",
  bufferNights: 7,
  budgetWindows: [],
  registrationGate: false,
  ...overrides,
});

describe("cap guard: computeGuardBlocks", () => {
  it("returns no blocks when disabled", () => {
    const blocks = computeGuardBlocks(
      [],
      baseComputation(),
      basePolicy({ enabled: false }),
      new Date(2026, 5, 1)
    );
    assert.equal(blocks.length, 0);
  });

  it("HARD_STOP closes unbooked dates when remaining is zero", () => {
    const blocks = computeGuardBlocks(
      [
        {
          checkInDate: new Date(2026, 6, 10),
          checkOutDate: new Date(2026, 6, 13),
        },
      ],
      baseComputation({ remaining: 0, nightsUsed: 120, status: "exceeded" }),
      basePolicy({ mode: "HARD_STOP" }),
      new Date(2026, 5, 1)
    );
    assert.ok(blocks.length > 0);
    const july10 = blocks.some(
      (block) =>
        block.start <= new Date(2026, 6, 10) &&
        block.end >= new Date(2026, 6, 10)
    );
    assert.equal(july10, false, "booked night should stay open");
    const august1 = blocks.some(
      (block) =>
        block.start <= new Date(2026, 7, 1) &&
        block.end >= new Date(2026, 7, 1)
    );
    assert.equal(august1, true, "unbooked future date should close");
  });

  it("BUFFER closes when remaining is below buffer", () => {
    const blocks = computeGuardBlocks(
      [],
      baseComputation({ remaining: 5 }),
      basePolicy({ mode: "BUFFER", bufferNights: 7 }),
      new Date(2026, 5, 1)
    );
    assert.ok(blocks.length > 0);
  });

  it("BUFFER does not close when remaining is above buffer", () => {
    const blocks = computeGuardBlocks(
      [],
      baseComputation({ remaining: 20 }),
      basePolicy({ mode: "BUFFER", bufferNights: 7 }),
      new Date(2026, 5, 1)
    );
    assert.equal(blocks.length, 0);
  });

  it("BUDGET closes dates outside windows and when window budget is exhausted", () => {
    const blocks = computeGuardBlocks(
      [
        {
          checkInDate: new Date(2026, 6, 1),
          checkOutDate: new Date(2026, 6, 6),
        },
      ],
      baseComputation({ remaining: 30 }),
      basePolicy({
        mode: "BUDGET",
        budgetWindows: [
          {
            start: "2026-07-01",
            end: "2026-07-31",
            allocatedNights: 4,
          },
        ],
      }),
      new Date(2026, 5, 1)
    );
    const june15Closed = blocks.some(
      (block) =>
        block.start <= new Date(2026, 5, 15) &&
        block.end >= new Date(2026, 5, 15)
    );
    assert.equal(june15Closed, true, "outside window should close");
    const july10Closed = blocks.some(
      (block) =>
        block.start <= new Date(2026, 6, 10) &&
        block.end >= new Date(2026, 6, 10)
    );
    assert.equal(july10Closed, true, "window budget exhausted should close");
  });

  it("registration gate closes dates after expiry", () => {
    const blocks = computeGuardBlocks(
      [],
      baseComputation({ remaining: 50 }),
      basePolicy({ mode: "BUFFER", bufferNights: 5, registrationGate: true }),
      new Date(2026, 5, 1),
      new Date(2026, 7, 31)
    );
    const septemberClosed = blocks.some(
      (block) =>
        block.start <= new Date(2026, 8, 1) &&
        block.end >= new Date(2026, 8, 1)
    );
    assert.equal(septemberClosed, true);
    const julyOpen = blocks.some(
      (block) =>
        block.start <= new Date(2026, 6, 1) &&
        block.end >= new Date(2026, 6, 1)
    );
    assert.equal(julyOpen, false);
  });
});

describe("cap guard: forecast and helpers", () => {
  it("counts future booked nights from today", () => {
    const count = countFutureBookedNights(
      [
        {
          checkInDate: new Date(2026, 0, 1),
          checkOutDate: new Date(2026, 0, 5),
        },
        {
          checkInDate: new Date(2026, 7, 1),
          checkOutDate: new Date(2026, 7, 4),
        },
      ],
      2026,
      new Date(2026, 5, 1)
    );
    assert.equal(count, 3);
  });

  it("computes projected cap date at current pace", () => {
    const forecast = computeCapGuardForecast(
      [],
      baseComputation({ nightsUsed: 60, remaining: 60, limit: 120 }),
      new Date(2026, 5, 30)
    );
    assert.equal(forecast.nightsUsed, 60);
    assert.ok(forecast.projectedCapDate);
  });

  it("parses budget windows JSON safely", () => {
    const windows = parseBudgetWindows(
      '[{"start":"2026-07-01","end":"2026-07-31","allocatedNights":10}]'
    );
    assert.equal(windows.length, 1);
    assert.equal(windows[0].allocatedNights, 10);
    assert.equal(parseBudgetWindows("not-json").length, 0);
  });

  it("suggests buffer from channel count", () => {
    assert.equal(suggestBufferNights(2), 6);
    assert.equal(suggestBufferNights(0), 3);
  });
});
