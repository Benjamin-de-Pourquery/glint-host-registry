/** Portugal guest-reporting routing — national SIBA (SSI / UCFE). */

export type PortugalGuestReportingMode = "siba" | "none";

const PORTUGAL_CITY_ALIASES: Record<string, string> = {
  lisboa: "Lisboa",
  lisbon: "Lisboa",
  porto: "Porto",
  oporto: "Porto",
  faro: "Faro",
  algarve: "Faro",
  funchal: "Funchal",
  madeira: "Funchal",
};

export function isPortugalCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return (
    c === "portugal" ||
    c === "pt" ||
    c === "portuguese" ||
    c === "portuguesa" ||
    c === "portugal"
  );
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePortugalCity(city: string): string {
  const key = normalizeKey(city);
  return PORTUGAL_CITY_ALIASES[key] ?? city.trim();
}

/**
 * Portugal uses a single national guest-reporting system (SIBA).
 * City is used for playbook routing only — not for alternate portals.
 */
export function getPortugalGuestReportingMode(
  city: string,
  _region?: string | null
): PortugalGuestReportingMode {
  if (!city.trim()) return "none";
  return "siba";
}

export function requiresSibaCheckIn(city: string, region?: string | null): boolean {
  return getPortugalGuestReportingMode(city, region) === "siba";
}

export function isPortugalGuestReporting(city: string, region?: string | null): boolean {
  return requiresSibaCheckIn(city, region);
}

export function getPortugalSystemLabel(locale: "en" | "fr" = "en"): string {
  return locale === "fr" ? "SIBA" : "SIBA";
}
