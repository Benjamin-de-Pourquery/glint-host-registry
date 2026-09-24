import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assembleEvidencePackManifest } from "../assemble-manifest";
import type { EvidencePackLoadedData } from "../types";

const periodStart = new Date("2026-01-01T00:00:00.000Z");
const periodEnd = new Date("2026-03-31T00:00:00.000Z");

const fixture: EvidencePackLoadedData = {
  property: {
    id: "prop-1",
    name: "Rue de la Paix Studio",
    address: "12 Rue de la Paix",
    city: "Paris",
    country: "France",
    propertyType: "apartment",
    residencyStatus: "primary",
  },
  registration: {
    id: "reg-1",
    registrationNumber: "75123456789",
    issuingAuthority: "Mairie de Paris",
    status: "active",
    issueDate: new Date("2024-06-01"),
    expiryDate: new Date("2029-06-01"),
    nationalRegistrationNumber: "FR-123456789",
    nationalTransitionStatus: "renewed",
    nationalRenewalDeadline: new Date("2027-01-01"),
    cinNumber: null,
    rnalNumber: null,
    amaNumber: null,
    hrCategorisationNumber: null,
    nlRegistrationNumber: null,
    beRegistrationNumber: null,
  },
  playbookSteps: [
    {
      stepKey: "paris-register",
      title: "Obtain municipal registration",
      status: "done",
      completedAt: "2026-01-15T10:00:00.000Z",
    },
    {
      stepKey: "paris-display",
      title: "Display number on listings",
      status: "pending",
      completedAt: null,
    },
  ],
  playbookSummary: { completed: 1, total: 2, skipped: 0 },
  stays: [
    {
      id: "stay-1",
      checkInDate: "2026-02-10T00:00:00.000Z",
      checkOutDate: "2026-02-14T00:00:00.000Z",
      nights: 4,
      source: "ical",
      channel: "iCal",
    },
  ],
  nightCap: {
    year: 2026,
    nightsUsed: 42,
    limit: 90,
    remaining: 48,
    percentUsed: 0.47,
    status: "ok",
    enabled: true,
    source: "commune_90",
  },
  capGuard: null,
  guestQueue: {
    total: 1,
    byStatus: { awaiting_submission: 1 },
    items: [
      {
        system: "Guest register",
        queueStatus: "awaiting_submission",
        deadline: "2026-02-11T00:00:00.000Z",
        updatedAt: "2026-02-10T12:00:00.000Z",
      },
    ],
  },
  channels: [
    {
      id: "ch-1",
      propertyId: "prop-1",
      channel: "AIRBNB",
      listingUrl: "https://airbnb.com/rooms/123",
      registrationNumberDisplayed: "75123456789",
      displayStatus: "PRESENT",
      lastCheckedAt: "2026-02-01T00:00:00.000Z",
      notes: null,
      blockedAt: null,
      blockReason: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  healthScore: null,
  nerMigration: {
    nationalRegistrationNumber: "FR-123456789",
    nationalTransitionStatus: "renewed",
    nationalRenewalDeadline: "2027-01-01T00:00:00.000Z",
  },
  reconciliationStatement: {
    openFindingsCount: 1,
    touristTaxNightsDeclared: 4,
    nightCapUsed: 42,
    nightCapLimit: 90,
    channels: [
      {
        channel: "AIRBNB",
        platformNights: 4,
        platformReservations: 1,
        registrationKeyDisplayed: "75123456789",
      },
    ],
    findings: [{ code: "ORPHAN_PLATFORM_RESERVATION", severity: "to_check" }],
  },
};

describe("assembleEvidencePackManifest", () => {
  it("builds manifest sections from fixture data without inventing compliance", () => {
    const manifest = assembleEvidencePackManifest(
      fixture,
      "reg-1",
      periodStart,
      periodEnd,
      "en",
      new Date("2026-03-15T12:00:00.000Z")
    );

    assert.equal(manifest.registrationId, "reg-1");
    assert.equal(manifest.propertyId, "prop-1");
    assert.equal(manifest.stayCount, 1);
    assert.equal(manifest.locale, "en");
    assert.equal(manifest.playbookSteps.length, 2);
    assert.equal(manifest.playbookSummary?.completed, 1);
    assert.equal(manifest.nightCap?.nightsUsed, 42);
    assert.equal(manifest.channels.length, 1);
    assert.equal(manifest.channelsConfigured, true);
    assert.equal(manifest.healthScore, null);

    const healthSection = manifest.sections.find((s) => s.id === "healthScore");
    assert.ok(healthSection);
    assert.equal(healthSection.included, false);

    const identitySection = manifest.sections.find((s) => s.id === "identity");
    assert.ok(identitySection);
    assert.ok(identitySection.itemCount >= 3);

    const registrationField = manifest.identity.find(
      (field) => field.key === "registrationNumber"
    );
    assert.equal(registrationField?.value, "75123456789");

    const nerField = manifest.identity.find(
      (field) => field.key === "nationalRegistrationNumber"
    );
    assert.equal(nerField?.value, "FR-123456789");
  });

  it("marks channels as not configured when empty", () => {
    const manifest = assembleEvidencePackManifest(
      { ...fixture, channels: [] },
      "reg-1",
      periodStart,
      periodEnd,
      "fr"
    );

    assert.equal(manifest.channelsConfigured, false);
    const channelsSection = manifest.sections.find((s) => s.id === "channels");
    assert.ok(channelsSection);
    assert.match(channelsSection.omittedReason ?? "", /Non configuré|Not configured/i);
  });
});
