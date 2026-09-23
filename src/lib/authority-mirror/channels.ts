import type { PlatformChannel } from "./types";

const CHANNEL_ALIASES: Record<string, PlatformChannel> = {
  airbnb: "AIRBNB",
  booking: "BOOKING",
  "booking.com": "BOOKING",
  vrbo: "VRBO",
  direct: "DIRECT",
  other: "OTHER",
  generic: "GENERIC",
  ical: "OTHER",
  manual: "DIRECT",
};

export function normalizePlatformChannel(value: string | null | undefined): PlatformChannel {
  const raw = (value ?? "").trim();
  if (!raw) return "OTHER";
  const upper = raw.toUpperCase();
  if (upper === "AIRBNB" || upper === "BOOKING" || upper === "VRBO" || upper === "DIRECT" || upper === "OTHER" || upper === "GENERIC") {
    return upper as PlatformChannel;
  }
  const lower = raw.toLowerCase();
  return CHANNEL_ALIASES[lower] ?? "OTHER";
}

export function channelsMatch(a: string, b: string): boolean {
  return normalizePlatformChannel(a) === normalizePlatformChannel(b);
}

export function normalizeRegistrationNumber(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}
