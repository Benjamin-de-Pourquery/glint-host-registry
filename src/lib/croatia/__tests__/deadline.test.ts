import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getEvisitorDeadline,
  getHoursRemaining,
  EVISITOR_HOURS_DEADLINE,
} from "../deadline";

describe("getEvisitorDeadline", () => {
  it("adds 24 hours after event date", () => {
    const arrival = new Date("2026-07-01T14:00:00Z");
    const deadline = getEvisitorDeadline(arrival);
    assert.equal(deadline.getTime() - arrival.getTime(), EVISITOR_HOURS_DEADLINE * 60 * 60 * 1000);
  });
});

describe("getHoursRemaining", () => {
  it("returns hours until deadline", () => {
    const now = new Date("2026-07-01T14:00:00Z");
    const deadline = new Date("2026-07-02T14:00:00Z");
    assert.equal(getHoursRemaining(deadline, now), 24);
  });

  it("returns 0 when overdue", () => {
    const now = new Date("2026-07-03T14:00:00Z");
    const deadline = new Date("2026-07-02T14:00:00Z");
    assert.equal(getHoursRemaining(deadline, now), 0);
  });
});
