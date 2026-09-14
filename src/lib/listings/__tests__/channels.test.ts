import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { propertyHasListingComplianceIssue } from "@/lib/compliance";
import {
  allChannelsPresent,
  buildStatusTransition,
  countListingComplianceIssues,
  legacyUrlPatchFromChannels,
  needsListingComplianceAttention,
  validateChannelInput,
} from "@/lib/listings/channels";
import { isValidListingUrl } from "@/lib/listings/url-validation";

describe("listing URL validation", () => {
  it("accepts http and https URLs", () => {
    assert.equal(isValidListingUrl("https://airbnb.com/rooms/123"), true);
    assert.equal(isValidListingUrl("http://booking.com/hotel"), true);
  });

  it("rejects javascript: and invalid URLs", () => {
    assert.equal(isValidListingUrl("javascript:alert(1)"), false);
    assert.equal(isValidListingUrl("not-a-url"), false);
    assert.equal(isValidListingUrl(""), false);
  });
});

describe("listing channel validation", () => {
  it("validates channel and status", () => {
    assert.deepEqual(
      validateChannelInput({
        channel: "AIRBNB",
        listingUrl: "https://airbnb.com/rooms/1",
      }),
      { ok: true }
    );
    assert.equal(
      validateChannelInput({ channel: "INVALID", listingUrl: "https://x.com" }).ok,
      false
    );
  });
});

describe("listing compliance helpers", () => {
  const channels = [
    { displayStatus: "PRESENT", listingUrl: "https://a.com" },
    { displayStatus: "MISSING", listingUrl: "https://b.com" },
  ];

  it("detects attention needed for MISSING or BLOCKED", () => {
    assert.equal(needsListingComplianceAttention(channels), true);
    assert.equal(
      needsListingComplianceAttention([{ displayStatus: "PRESENT", listingUrl: "https://a.com" }]),
      false
    );
  });

  it("counts issues", () => {
    const counts = countListingComplianceIssues(channels);
    assert.equal(counts.missing, 1);
    assert.equal(counts.blocked, 0);
    assert.equal(counts.total, 1);
  });

  it("requires all channels PRESENT", () => {
    assert.equal(allChannelsPresent(channels), false);
    assert.equal(
      allChannelsPresent([{ displayStatus: "PRESENT", listingUrl: "https://a.com" }]),
      true
    );
  });

  it("syncs legacy URL fields", () => {
    const patch = legacyUrlPatchFromChannels([
      { channel: "AIRBNB", listingUrl: "https://airbnb.com/x" },
      { channel: "BOOKING", listingUrl: null },
    ]);
    assert.equal(patch.airbnbUrl, "https://airbnb.com/x");
    assert.equal(patch.bookingUrl, null);
    assert.equal(patch.vrboUrl, null);
  });
});

describe("status transitions", () => {
  it("sets blockedAt and blockReason when BLOCKED", () => {
    const result = buildStatusTransition("BLOCKED", { blockReason: "Invalid NER" });
    assert.equal(result.displayStatus, "BLOCKED");
    assert.ok(result.blockedAt);
    assert.equal(result.blockReason, "Invalid NER");
  });

  it("clears block fields when not BLOCKED", () => {
    const result = buildStatusTransition("PRESENT");
    assert.equal(result.blockedAt, null);
    assert.equal(result.blockReason, null);
  });
});

describe("compliance portfolio helper", () => {
  it("flags properties with listing compliance issues", () => {
    assert.equal(
      propertyHasListingComplianceIssue([{ displayStatus: "BLOCKED", listingUrl: "https://x.com" }]),
      true
    );
    assert.equal(
      propertyHasListingComplianceIssue([{ displayStatus: "PRESENT", listingUrl: "https://x.com" }]),
      false
    );
  });
});
