/** Greece guest-reporting routing — national AADE short-term stay declarations. */

export type GreeceGuestReportingMode = "aade" | "none";

const GREECE_CITY_ALIASES: Record<string, string> = {
  athens: "Athina",
  athina: "Athina",
  athènes: "Athina",
  thessaloniki: "Thessaloniki",
  salonica: "Thessaloniki",
  salonique: "Thessaloniki",
  heraklion: "Heraklion",
  iraklio: "Heraklion",
  crete: "Heraklion",
  rhodes: "Rhodes",
  rodos: "Rhodes",
  corfu: "Corfu",
  kerkyra: "Corfu",
};

export function isGreeceCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return (
    c === "greece" ||
    c === "gr" ||
    c === "el" ||
    c === "hellas" ||
    c === "hellenic republic" ||
    c === "grèce" ||
    c === "grece"
  );
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeGreeceCity(city: string): string {
  const key = normalizeKey(city);
  return GREECE_CITY_ALIASES[key] ?? city.trim();
}

/**
 * Greece uses a single national guest-reporting system (AADE short-term stay declaration).
 * City is used for playbook routing only — not for alternate portals.
 */
export function getGreeceGuestReportingMode(
  country: string,
  city?: string | null,
  _region?: string | null
): GreeceGuestReportingMode {
  if (!isGreeceCountry(country)) return "none";
  if (!city?.trim()) return "none";
  return "aade";
}

export function requiresAadeCheckIn(
  country: string,
  city: string,
  region?: string | null
): boolean {
  return getGreeceGuestReportingMode(country, city, region) === "aade";
}

export function isGreeceGuestReporting(
  country: string,
  city: string,
  region?: string | null
): boolean {
  return requiresAadeCheckIn(country, city, region);
}

export function getGreeceSystemLabel(locale: "en" | "fr" = "en"): string {
  return locale === "fr" ? "AADE" : "AADE";
}
