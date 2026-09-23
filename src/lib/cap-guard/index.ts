import { randomBytes } from "crypto";

export * from "./types";
export * from "./compute-blocks";
export * from "./forecast";
export * from "./ical";

export function generateCapGuardFeedToken(): string {
  return randomBytes(32).toString("base64url");
}

export function buildCapGuardFeedUrl(token: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/api/ical/guard/${token}.ics`;
}
