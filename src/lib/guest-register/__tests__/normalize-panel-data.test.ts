import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeGuestRegisterPanelData } from "../normalize-panel-data";

describe("normalizeGuestRegisterPanelData", () => {
  it("returns null for non-objects", () => {
    assert.equal(normalizeGuestRegisterPanelData(null), null);
  });

  it("defaults missing arrays and counters", () => {
    const data = normalizeGuestRegisterPanelData({});
    assert.ok(data);
    assert.deepEqual(data.records, []);
    assert.deepEqual(data.stays, []);
    assert.equal(data.guestsThisMonth, 0);
    assert.equal(data.missingFichesCount, 0);
  });

  it("filters corrupt stay rows", () => {
    const data = normalizeGuestRegisterPanelData({
      stays: [{ id: "stay-1", checkInDate: "2026-01-01", checkOutDate: "2026-01-03" }, { id: "bad" }],
      records: [{ id: "rec-1", lastName: "Doe" }],
    });
    assert.equal(data?.stays.length, 1);
    assert.equal(data?.records.length, 1);
  });
});
