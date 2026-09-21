/** Croatia guest-reporting routing — national eVisitor system. */

export type CroatiaGuestReportingMode = "evisitor" | "none";

const CROATIA_CITY_ALIASES: Record<string, string> = {
  zagreb: "Zagreb",
  split: "Split",
  dubrovnik: "Dubrovnik",
  zadar: "Zadar",
  rijeka: "Rijeka",
  pula: "Pula",
  osijek: "Osijek",
  istria: "Pula",
  "split-dalmatia": "Split",
};

export function isCroatiaCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return (
    c === "croatia" ||
    c === "hr" ||
    c === "hrvatska" ||
    c === "croatie" ||
    c === "croazia"
  );
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeCroatiaCity(city: string): string {
  const key = normalizeKey(city);
  return CROATIA_CITY_ALIASES[key] ?? city.trim();
}

/**
 * Croatia uses a single national guest-reporting system (eVisitor).
 * City is used for playbook routing only — not for alternate portals.
 */
export function getCroatiaGuestReportingMode(
  city: string,
  _region?: string | null
): CroatiaGuestReportingMode {
  if (!city.trim()) return "none";
  return "evisitor";
}

export function requiresEvisitorCheckIn(city: string, region?: string | null): boolean {
  return getCroatiaGuestReportingMode(city, region) === "evisitor";
}

export function isCroatiaGuestReporting(city: string, region?: string | null): boolean {
  return requiresEvisitorCheckIn(city, region);
}

export function getCroatiaSystemLabel(locale: "en" | "fr" = "en"): string {
  return locale === "fr" ? "eVisitor" : "eVisitor";
}
