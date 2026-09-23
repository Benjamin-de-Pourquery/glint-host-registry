import type { ChecklistItem } from "./types";

/** Channel update keys for Phase B wizard. Stored on FrNerMigration to avoid coupling to ListingChannel. */
export const DEFAULT_CHANNEL_UPDATE_KEYS = [
  "airbnb",
  "booking",
  "vrbo",
  "other",
] as const;

export type ChannelUpdateKey = (typeof DEFAULT_CHANNEL_UPDATE_KEYS)[number];

export function defaultChannelUpdatesChecklist(): ChecklistItem[] {
  return DEFAULT_CHANNEL_UPDATE_KEYS.map((key) => ({ key, done: false }));
}

export function mergeChannelUpdatesChecklist(
  stored: ChecklistItem[] | null | undefined
): ChecklistItem[] {
  const map = new Map(
    (stored ?? []).map((item) => [item.key, Boolean(item.done)])
  );

  return DEFAULT_CHANNEL_UPDATE_KEYS.map((key) => ({
    key,
    done: map.get(key) ?? false,
  }));
}

export function isChannelUpdatesComplete(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every((item) => item.done);
}

/**
 * When ListingChannel is available, listing URLs can be shown alongside this checklist.
 * Channel update completion remains on FrNerMigration.channelUpdatesChecklist.
 */
export function listingChannelIntegrationNote(): string {
  return "Listing Health channel URLs are informational; mark each channel updated here when the NER appears on the listing.";
}
