import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addDays } from "date-fns";
import { computeScore } from "@/lib/listing-health/compute-score";
import type { ListingHealthComputeInput } from "@/lib/listing-health/types";

const NOW = new Date("2026-09-23T12:00:00Z");
const PROPERTY_ID = "prop-1";
const LOCALE = "en";

function baseInput(
  overrides: Partial<ListingHealthComputeInput> = {}
): ListingHealthComputeInput {
  return {
    propertyId: PROPERTY_ID,
    locale: LOCALE,
    registrationRequired: true,
    primaryRegistrationNumber: "NER-12345",
    expiryDate: null,
    channels: [
      {
        channel: "AIRBNB",
        listingUrl: "https://airbnb.com/rooms/1",
        displayedRegistrationNumber: "NER-12345",
      },
    ],
    guestDueCriticalCount: 0,
    guestDueWarningCount: 0,
    nightCapPercentUsed: null,
    nightCapExceeded: false,
    now: NOW,
    ...overrides,
  };
}

describe("computeScore", () => {
  const cases: Array<{
    name: string;
    input: Partial<ListingHealthComputeInput>;
    expectedScore: "GREEN" | "ORANGE" | "RED";
    expectedCodes: string[];
    isActivated?: boolean;
  }> = [
    {
      name: "green when all signals clear",
      input: {},
      expectedScore: "GREEN",
      expectedCodes: [],
      isActivated: true,
    },
    {
      name: "setup incomplete when no registration and no URLs",
      input: {
        primaryRegistrationNumber: null,
        channels: [],
      },
      expectedScore: "RED",
      expectedCodes: ["setup_incomplete", "missing_registration"],
      isActivated: false,
    },
    {
      name: "red when required registration missing",
      input: {
        primaryRegistrationNumber: null,
        channels: [{ channel: "AIRBNB", listingUrl: "https://airbnb.com/x", displayedRegistrationNumber: null }],
      },
      expectedScore: "RED",
      expectedCodes: ["missing_registration"],
    },
    {
      name: "red when expiry passed",
      input: {
        expiryDate: addDays(NOW, -3),
      },
      expectedScore: "RED",
      expectedCodes: ["expiry_passed"],
    },
    {
      name: "orange when expiry within 30 days",
      input: {
        expiryDate: addDays(NOW, 20),
      },
      expectedScore: "ORANGE",
      expectedCodes: ["expiry_within_30"],
    },
    {
      name: "orange when expiry within 14 days",
      input: {
        expiryDate: addDays(NOW, 10),
      },
      expectedScore: "ORANGE",
      expectedCodes: ["expiry_within_14"],
    },
    {
      name: "orange when expiry within 7 days",
      input: {
        expiryDate: addDays(NOW, 5),
      },
      expectedScore: "ORANGE",
      expectedCodes: ["expiry_within_7"],
    },
    {
      name: "orange when no listing URLs but registration present",
      input: {
        channels: [],
      },
      expectedScore: "ORANGE",
      expectedCodes: ["no_listing_urls"],
    },
    {
      name: "orange when channel numbers mismatch",
      input: {
        channels: [
          { channel: "AIRBNB", listingUrl: "https://airbnb.com/1", displayedRegistrationNumber: "NER-111" },
          { channel: "BOOKING", listingUrl: "https://booking.com/1", displayedRegistrationNumber: "NER-222" },
        ],
      },
      expectedScore: "ORANGE",
      expectedCodes: ["channel_number_mismatch"],
    },
    {
      name: "red when guest due critical",
      input: {
        guestDueCriticalCount: 2,
      },
      expectedScore: "RED",
      expectedCodes: ["guest_due_critical"],
    },
    {
      name: "orange when guest due warning only",
      input: {
        guestDueWarningCount: 1,
      },
      expectedScore: "ORANGE",
      expectedCodes: ["guest_due_warning"],
    },
    {
      name: "red when night cap exceeded",
      input: {
        nightCapPercentUsed: 105,
        nightCapExceeded: true,
      },
      expectedScore: "RED",
      expectedCodes: ["night_cap_exceeded"],
    },
    {
      name: "orange when night cap at 80 percent",
      input: {
        nightCapPercentUsed: 82,
        nightCapExceeded: false,
      },
      expectedScore: "ORANGE",
      expectedCodes: ["night_cap_warning"],
    },
    {
      name: "red wins over orange factors",
      input: {
        expiryDate: addDays(NOW, 10),
        guestDueCriticalCount: 1,
      },
      expectedScore: "RED",
      expectedCodes: ["expiry_within_14", "guest_due_critical"],
    },
    {
      name: "not required registration with no number stays green",
      input: {
        registrationRequired: false,
        primaryRegistrationNumber: null,
        channels: [{ channel: "DIRECT", listingUrl: "https://example.com/rent", displayedRegistrationNumber: null }],
      },
      expectedScore: "GREEN",
      expectedCodes: [],
    },
  ];

  for (const { name, input, expectedScore, expectedCodes, isActivated } of cases) {
    it(name, () => {
      const result = computeScore(baseInput(input));
      assert.equal(result.score, expectedScore);
      const codes = result.factors.map((f) => f.code);
      for (const code of expectedCodes) {
        assert.ok(codes.includes(code as never), `expected factor ${code}, got ${codes.join(", ")}`);
      }
      if (isActivated !== undefined) {
        assert.equal(result.isActivated, isActivated);
      }
    });
  }
});
