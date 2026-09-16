/** Italy guest-reporting routing — national Alloggiati Web (TULPS art. 109). */

export type ItalyGuestReportingMode = "alloggiati" | "none";

const ITALY_CITY_ALIASES: Record<string, string> = {
  roma: "Roma",
  rome: "Roma",
  milano: "Milano",
  milan: "Milano",
  firenze: "Firenze",
  florence: "Firenze",
  venezia: "Venezia",
  venice: "Venezia",
  napoli: "Napoli",
  naples: "Napoli",
  torino: "Torino",
  turin: "Torino",
  bologna: "Bologna",
  palermo: "Palermo",
};

export function isItalyCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return (
    c === "italy" ||
    c === "it" ||
    c === "italie" ||
    c === "italia" ||
    c === "italian"
  );
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeItalyCity(city: string): string {
  const key = normalizeKey(city);
  return ITALY_CITY_ALIASES[key] ?? city.trim();
}

/**
 * Italy uses a single national guest-reporting system (Alloggiati Web).
 * City is used for playbook routing only — not for alternate police portals.
 */
export function getItalyGuestReportingMode(
  city: string,
  _region?: string | null
): ItalyGuestReportingMode {
  if (!city.trim()) return "none";
  return "alloggiati";
}

export function requiresAlloggiatiCheckIn(city: string, region?: string | null): boolean {
  return getItalyGuestReportingMode(city, region) === "alloggiati";
}

export function isItalyGuestReporting(city: string, region?: string | null): boolean {
  return requiresAlloggiatiCheckIn(city, region);
}

export function getItalySystemLabel(locale: "en" | "fr" = "en"): string {
  return locale === "fr" ? "Alloggiati Web" : "Alloggiati Web";
}
