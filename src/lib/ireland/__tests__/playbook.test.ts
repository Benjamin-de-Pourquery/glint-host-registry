import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPlaybookById } from "@/lib/playbooks";

describe("Ireland playbook URLs", () => {
  it("marks official links as verified", () => {
    const playbook = getPlaybookById("ie-dublin");
    assert.ok(playbook);
    const urls = playbook!.steps.flatMap((s) => s.officialUrls);
    assert.ok(urls.some((u) => u.url.includes("failteireland.ie")));
    assert.ok(urls.every((u) => u.url.startsWith("http")));
  });
});
