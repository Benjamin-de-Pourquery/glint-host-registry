import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaybook } from "@/lib/playbooks";
import {
  AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL,
  getStayNotificationPortalUrl,
} from "@/lib/netherlands/official-links";

describe("Netherlands playbook resolution", () => {
  it("resolves Amsterdam city playbook", () => {
    const playbook = resolvePlaybook("Netherlands", "Amsterdam");
    assert.ok(playbook);
    assert.equal(playbook!.id, "nl-amsterdam");
  });

  it("resolves Amsterdam via alias ams", () => {
    const playbook = resolvePlaybook("Netherlands", "ams");
    assert.equal(playbook?.id, "nl-amsterdam");
  });

  it("falls back to generic Netherlands playbook for unknown cities", () => {
    const playbook = resolvePlaybook("Netherlands", "Groningen");
    assert.equal(playbook?.id, "nl-generic");
  });

  it("Amsterdam playbook covers registration, permit, notification, and night cap", () => {
    const playbook = resolvePlaybook("Netherlands", "Amsterdam")!;
    const keys = playbook.steps.map((s) => s.key);
    assert.ok(keys.includes("amsterdam-nl-registration"));
    assert.ok(keys.includes("amsterdam-nl-holiday-permit"));
    assert.ok(keys.includes("amsterdam-nl-stay-notification"));
    assert.ok(keys.includes("amsterdam-nl-night-cap"));
    assert.ok(keys.includes("amsterdam-display-nl-registration"));
  });

  it("Amsterdam playbook reflects October 2026 source review and reporting portal", () => {
    const playbook = resolvePlaybook("Netherlands", "Amsterdam")!;
    assert.equal(playbook.sourceReviewedAt, "2026-10-03");
    const notify = playbook.steps.find((s) => s.key === "amsterdam-nl-stay-notification");
    assert.ok(notify?.officialUrls?.some((u) => u.url === AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL));
    assert.equal(getStayNotificationPortalUrl("Amsterdam"), AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL);
  });
});
