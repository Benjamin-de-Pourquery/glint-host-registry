import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidEircode, normalizeEircode } from "../eircode";

describe("normalizeEircode", () => {
  it("strips spaces and uppercases", () => {
    assert.equal(normalizeEircode("d02 af30"), "D02AF30");
  });
});

describe("isValidEircode", () => {
  it("accepts 7 alphanumeric characters", () => {
    assert.equal(isValidEircode("D02AF30"), true);
    assert.equal(isValidEircode("A65 F4E2"), true);
  });

  it("rejects invalid lengths or characters", () => {
    assert.equal(isValidEircode("D02AF3"), false);
    assert.equal(isValidEircode(""), false);
    assert.equal(isValidEircode("D02-AF30"), false);
  });
});
