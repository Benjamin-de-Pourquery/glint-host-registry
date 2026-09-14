import type { ListingChannel } from "@/generated/prisma/client";
import { isValidListingUrl, normalizeListingUrl } from "./url-validation";

export const LISTING_CHANNELS = ["AIRBNB", "BOOKING", "VRBO", "OTHER"] as const;
export type ListingChannelType = (typeof LISTING_CHANNELS)[number];

export const DISPLAY_STATUSES = ["MISSING", "PRESENT", "UNKNOWN", "BLOCKED"] as const;
export type DisplayStatus = (typeof DISPLAY_STATUSES)[number];

export type ListingChannelRecord = {
  id: string;
  propertyId: string;
  channel: ListingChannelType;
  listingUrl: string;
  registrationNumberDisplayed: string | null;
  displayStatus: DisplayStatus;
  lastCheckedAt: string | null;
  notes: string | null;
  blockedAt: string | null;
  blockReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toListingChannelRecord(row: ListingChannel): ListingChannelRecord {
  return {
    id: row.id,
    propertyId: row.propertyId,
    channel: row.channel as ListingChannelType,
    listingUrl: row.listingUrl,
    registrationNumberDisplayed: row.registrationNumberDisplayed,
    displayStatus: row.displayStatus as DisplayStatus,
    lastCheckedAt: row.lastCheckedAt?.toISOString() ?? null,
    notes: row.notes,
    blockedAt: row.blockedAt?.toISOString() ?? null,
    blockReason: row.blockReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function channelToLegacyPlatformField(
  channel: ListingChannelType
): "airbnbUrl" | "bookingUrl" | "vrboUrl" | null {
  switch (channel) {
    case "AIRBNB":
      return "airbnbUrl";
    case "BOOKING":
      return "bookingUrl";
    case "VRBO":
      return "vrboUrl";
    default:
      return null;
  }
}

/** Sync legacy Property URL columns when standard channels change */
export function legacyUrlPatchFromChannels(
  channels: Array<{ channel: ListingChannelType; listingUrl: string | null }>
): Partial<Record<"airbnbUrl" | "bookingUrl" | "vrboUrl", string | null>> {
  const patch: Partial<Record<"airbnbUrl" | "bookingUrl" | "vrboUrl", string | null>> = {
    airbnbUrl: null,
    bookingUrl: null,
    vrboUrl: null,
  };

  for (const row of channels) {
    const field = channelToLegacyPlatformField(row.channel);
    if (field && row.listingUrl) {
      patch[field] = row.listingUrl;
    }
  }

  return patch;
}

export function needsListingComplianceAttention(
  channels: Array<{ displayStatus: string; listingUrl: string }>
): boolean {
  return channels.some(
    (c) =>
      c.listingUrl.trim() &&
      (c.displayStatus === "MISSING" || c.displayStatus === "BLOCKED")
  );
}

export function countListingComplianceIssues(
  channels: Array<{ displayStatus: string; listingUrl: string }>
): { missing: number; blocked: number; total: number } {
  const active = channels.filter((c) => c.listingUrl.trim());
  return {
    missing: active.filter((c) => c.displayStatus === "MISSING").length,
    blocked: active.filter((c) => c.displayStatus === "BLOCKED").length,
    total: active.filter(
      (c) => c.displayStatus === "MISSING" || c.displayStatus === "BLOCKED"
    ).length,
  };
}

export function allChannelsPresent(
  channels: Array<{ displayStatus: string; listingUrl: string }>
): boolean {
  const active = channels.filter((c) => c.listingUrl.trim());
  if (active.length === 0) return false;
  return active.every((c) => c.displayStatus === "PRESENT");
}

export function validateChannelInput(input: {
  channel: string;
  listingUrl: string;
  displayStatus?: string;
}): { ok: true } | { ok: false; error: string } {
  if (!LISTING_CHANNELS.includes(input.channel as ListingChannelType)) {
    return { ok: false, error: "Invalid channel" };
  }
  if (!isValidListingUrl(input.listingUrl)) {
    return { ok: false, error: "Invalid listing URL — use http or https" };
  }
  if (
    input.displayStatus &&
    !DISPLAY_STATUSES.includes(input.displayStatus as DisplayStatus)
  ) {
    return { ok: false, error: "Invalid display status" };
  }
  return { ok: true };
}

export function buildStatusTransition(
  displayStatus: DisplayStatus,
  options?: { blockReason?: string | null }
): {
  displayStatus: DisplayStatus;
  blockedAt: Date | null;
  blockReason: string | null;
  lastCheckedAt: Date;
} {
  const now = new Date();
  if (displayStatus === "BLOCKED") {
    return {
      displayStatus,
      blockedAt: now,
      blockReason: options?.blockReason?.trim() || null,
      lastCheckedAt: now,
    };
  }
  return {
    displayStatus,
    blockedAt: null,
    blockReason: null,
    lastCheckedAt: now,
  };
}

export function inferDisplayStatusFromRegistration(
  registrationNumber: string | null | undefined,
  current: DisplayStatus
): DisplayStatus {
  if (current === "BLOCKED") return "BLOCKED";
  if (registrationNumber?.trim()) {
    if (current === "UNKNOWN" || current === "MISSING") return "PRESENT";
  }
  return current;
}

export { isValidListingUrl, normalizeListingUrl };
