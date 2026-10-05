import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysUntilRegistrationDeadline,
  getForm15DueBy,
  getForm17Window,
  isForm17DueNow,
} from "../planning-forms";

describe("registration deadline", () => {
  it("counts days until 31 Dec 2026", () => {
    const days = daysUntilRegistrationDeadline(new Date("2026-10-05T12:00:00Z"));
    assert.ok(days >= 87 && days <= 88);
  });
});

describe("Form 15", () => {
  it("deadline is within four weeks of year start when no stays", () => {
    const due = getForm15DueBy(2026, [], new Date("2026-01-10T12:00:00Z"));
    assert.ok(due);
    assert.equal(due!.getMonth(), 0);
    assert.ok(due!.getDate() >= 28 && due!.getDate() <= 29);
  });
});

describe("Form 17", () => {
  it("window is 1 to 28 January of following year", () => {
    const { from, to } = getForm17Window(2026);
    assert.equal(from.getFullYear(), 2027);
    assert.equal(from.getMonth(), 0);
    assert.equal(from.getDate(), 1);
    assert.equal(to.getDate(), 28);
  });

  it("is due in January 2027 for 2026 letting year", () => {
    assert.equal(isForm17DueNow(2026, new Date("2027-01-15T12:00:00Z")), true);
    assert.equal(isForm17DueNow(2026, new Date("2027-02-01T12:00:00Z")), false);
  });
});
