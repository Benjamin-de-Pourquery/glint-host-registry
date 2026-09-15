/** Canonical production URL fallback when NEXT_PUBLIC_APP_URL is unset. */
const PRODUCTION_URL = "https://glint-host-registry.vercel.app";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || PRODUCTION_URL;
  return raw.replace(/\/$/, "");
}

export const SITE_NAME = "Glint Host Registry";
