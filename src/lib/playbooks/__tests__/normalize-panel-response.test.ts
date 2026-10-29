import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizePlaybookPanelResponse } from "../normalize-panel-response";

describe("normalizePlaybookPanelResponse", () => {
  it("returns null for invalid payloads", () => {
    assert.equal(normalizePlaybookPanelResponse(undefined), null);
  });

  it("normalizes missing progress and summary", () => {
    const data = normalizePlaybookPanelResponse({ playbook: null });
    assert.ok(data);
    assert.deepEqual(data.progress, []);
    assert.deepEqual(data.summary, { completed: 0, total: 0, skipped: 0 });
  });

  it("drops invalid progress rows", () => {
    const data = normalizePlaybookPanelResponse({
      playbook: null,
      progress: [{ stepKey: "a", status: "done" }, { foo: "bar" }],
      summary: { completed: 1, total: 2, skipped: 0 },
    });
    assert.equal(data?.progress.length, 1);
  });
});
