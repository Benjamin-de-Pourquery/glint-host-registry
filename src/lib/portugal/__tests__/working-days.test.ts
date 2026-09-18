import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addPortugueseWorkingDays,
  getSibaDeadline,
  isPortugueseWorkingDay,
  SIBA_WORKING_DAYS_DEADLINE,
} from "../working-days";

describe("isPortugueseWorkingDay", () => {
  it("returns false for Saturday and Sunday", () => {
    const saturday = new Date("2026-09-19"); // Saturday
    const sunday = new Date("2026-09-20"); // Sunday
    assert.equal(isPortugueseWorkingDay(saturday), false);
    assert.equal(isPortugueseWorkingDay(sunday), false);
  });

  it("returns false for fixed Portuguese holidays", () => {
    const christmas = new Date("2026-12-25");
    assert.equal(isPortugueseWorkingDay(christmas), false);
  });

  it("returns true for regular weekdays", () => {
    const monday = new Date("2026-09-21"); // Monday
    assert.equal(isPortugueseWorkingDay(monday), true);
  });
});

describe("addPortugueseWorkingDays", () => {
  it("adds 3 working days skipping weekend", () => {
    const friday = new Date("2026-09-18T12:00:00");
    const deadline = addPortugueseWorkingDays(friday, 3);
    // Fri + Mon + Tue + Wed = Wed Sep 23
    assert.equal(deadline.getDate(), 23);
    assert.equal(deadline.getMonth(), 8); // September
  });
});

describe("getSibaDeadline", () => {
  it("uses 3 working days constant", () => {
    assert.equal(SIBA_WORKING_DAYS_DEADLINE, 3);
    const checkIn = new Date("2026-09-21T10:00:00"); // Monday
    const deadline = getSibaDeadline(checkIn);
    assert.ok(deadline.getTime() > checkIn.getTime());
  });
});
