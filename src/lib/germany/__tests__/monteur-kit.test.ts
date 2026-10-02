import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultMonteurKitChecklist,
  mergeMonteurKitChecklist,
  monteurKitProgress,
} from "../monteur-kit";

describe("monteur-kit", () => {
  it("merges stored checklist with template keys", () => {
    const merged = mergeMonteurKitChecklist([
      { key: "zwvbg_fourth_act_2026", track: "zwvbg", done: true },
    ]);
    assert.equal(merged.length, defaultMonteurKitChecklist().length);
    const act = merged.find((i) => i.key === "zwvbg_fourth_act_2026");
    assert.equal(act?.done, true);
  });

  it("reports progress", () => {
    const items = defaultMonteurKitChecklist().map((i, idx) => ({
      ...i,
      done: idx < 2,
    }));
    const p = monteurKitProgress(items);
    assert.equal(p.done, 2);
    assert.equal(p.total, items.length);
  });
});
