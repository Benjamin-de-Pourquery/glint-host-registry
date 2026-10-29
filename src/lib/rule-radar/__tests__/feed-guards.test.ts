import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  nightCapLimit,
  sanitizeRuleImpactFeedItem,
  sanitizeRuleImpactFeedItems,
} from "../feed-guards";

describe("rule radar feed guards", () => {
  it("reads night cap limits safely", () => {
    assert.equal(nightCapLimit(null), null);
    assert.equal(nightCapLimit({ nightCap: { limit: 120 } } as never), 120);
    assert.equal(nightCapLimit({} as never), null);
  });

  it("drops malformed feed items", () => {
    assert.equal(sanitizeRuleImpactFeedItem(null), null);
    assert.equal(sanitizeRuleImpactFeedItem({ id: "x" }), null);
  });

  it("keeps valid feed items and tolerates missing payloads", () => {
    const item = sanitizeRuleImpactFeedItem({
      id: "impact-1",
      propertyId: "prop-1",
      propertyName: "Flat",
      summaryEn: "Change",
      summaryFr: "Changement",
      severity: "high",
      confidence: "medium",
      before: {},
      after: { nightCap: { limit: 90 } },
    });
    assert.ok(item);
    assert.equal(nightCapLimit(item?.before), null);
    assert.equal(nightCapLimit(item?.after), 90);
  });

  it("sanitizes arrays", () => {
    const items = sanitizeRuleImpactFeedItems([
      { id: "bad" },
      {
        id: "good",
        propertyId: "p",
        propertyName: "Home",
      },
    ]);
    assert.equal(items.length, 1);
    assert.equal(items[0]?.id, "good");
  });
});
