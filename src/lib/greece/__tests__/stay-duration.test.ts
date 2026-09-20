import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAadeDeclarationDeadline,
  getStayNightCount,
  isLongTermStay,
  isShortTermStay,
} from "../stay-duration";

describe("getStayNightCount", () => {
  it("uses hotel semantics (check-in inclusive, check-out exclusive)", () => {
    const checkIn = new Date(2026, 6, 1);
    const checkOut = new Date(2026, 6, 2);
    assert.equal(getStayNightCount(checkIn, checkOut), 1);
  });
});

describe("short-term vs long-term classification", () => {
  it("classifies 59 nights as short-term", () => {
    const checkIn = new Date(2026, 0, 1);
    const checkOut = new Date(2026, 2, 1);
    assert.equal(getStayNightCount(checkIn, checkOut), 59);
    assert.equal(isShortTermStay(checkIn, checkOut), true);
    assert.equal(isLongTermStay(checkIn, checkOut), false);
  });

  it("classifies 60 nights as long-term", () => {
    const checkIn = new Date(2026, 0, 1);
    const checkOut = new Date(2026, 2, 2);
    assert.equal(getStayNightCount(checkIn, checkOut), 60);
    assert.equal(isShortTermStay(checkIn, checkOut), false);
    assert.equal(isLongTermStay(checkIn, checkOut), true);
  });
});

describe("getAadeDeclarationDeadline", () => {
  it("returns 20th of month after checkout", () => {
    const checkOut = new Date(2026, 6, 15);
    const deadline = getAadeDeclarationDeadline(checkOut);
    assert.equal(deadline.getFullYear(), 2026);
    assert.equal(deadline.getMonth(), 7);
    assert.equal(deadline.getDate(), 20);
  });

  it("handles year rollover", () => {
    const checkOut = new Date(2026, 11, 10);
    const deadline = getAadeDeclarationDeadline(checkOut);
    assert.equal(deadline.getFullYear(), 2027);
    assert.equal(deadline.getMonth(), 0);
    assert.equal(deadline.getDate(), 20);
  });
});
