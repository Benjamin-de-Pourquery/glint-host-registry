/** Spanish autonomous communities with regional guest-reporting systems (not SES). */

const CATALONIA_PROVINCES = new Set([
  "barcelona",
  "tarragona",
  "girona",
  "lleida",
  "lérida",
  "gerone",
]);

const BASQUE_PROVINCES = new Set([
  "álava",
  "alava",
  "araba",
  "bizkaia",
  "vizcaya",
  "guipúzcoa",
  "gipuzkoa",
]);

const CATALONIA_CITIES = new Set([
  "barcelona",
  "tarragona",
  "girona",
  "lleida",
  "lérida",
  "sitges",
  "lloret de mar",
  "salou",
  "reus",
]);

const BASQUE_CITIES = new Set([
  "bilbao",
  "vitoria",
  "vitoria-gasteiz",
  "san sebastián",
  "san sebastian",
  "donostia",
  "donostia-san sebastián",
  "donostia-san sebastian",
  "getxo",
  "barakaldo",
]);

/** Spain guest-reporting mode for a property location. */
export type SpainGuestReportingMode = "ses" | "mossos" | "ertzaintza" | "none";

/** @deprecated Use SpainGuestReportingMode */
export type SpainGuestReportingSystem = SpainGuestReportingMode;

export function isSpainCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return c === "spain" || c === "es" || c === "espagne" || c === "espana" || c === "españa";
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function isCatalonia(cityKey: string, regionKey: string): boolean {
  return (
    CATALONIA_CITIES.has(cityKey) ||
    regionKey.includes("catal") ||
    CATALONIA_PROVINCES.has(cityKey)
  );
}

function isBasqueCountry(cityKey: string, regionKey: string): boolean {
  return (
    BASQUE_CITIES.has(cityKey) ||
    regionKey.includes("euskadi") ||
    regionKey.includes("país vasco") ||
    regionKey.includes("pais vasco") ||
    BASQUE_PROVINCES.has(cityKey)
  );
}

export function getSpainGuestReportingMode(
  city: string,
  region?: string | null
): SpainGuestReportingMode {
  if (!city.trim()) return "none";

  const cityKey = normalizeKey(city);
  const regionKey = normalizeKey(region ?? "");

  if (isCatalonia(cityKey, regionKey)) {
    return "mossos";
  }

  if (isBasqueCountry(cityKey, regionKey)) {
    return "ertzaintza";
  }

  return "ses";
}

/** @deprecated Use getSpainGuestReportingMode */
export function getSpainGuestReportingSystem(
  city: string,
  region?: string | null
): SpainGuestReportingMode {
  return getSpainGuestReportingMode(city, region);
}

export function usesSesHospedajes(city: string, region?: string | null): boolean {
  return getSpainGuestReportingMode(city, region) === "ses";
}

export function isRegionalSpainReporting(city: string, region?: string | null): boolean {
  const mode = getSpainGuestReportingMode(city, region);
  return mode === "mossos" || mode === "ertzaintza";
}

/** Annex I guest check-in fields apply to SES and both regional systems. */
export function requiresAnnexOneCheckIn(city: string, region?: string | null): boolean {
  const mode = getSpainGuestReportingMode(city, region);
  return mode === "ses" || mode === "mossos" || mode === "ertzaintza";
}

export function getRegionalSystemLabel(
  mode: SpainGuestReportingMode,
  locale: "en" | "fr" = "en"
): string {
  switch (mode) {
    case "mossos":
      return locale === "fr" ? "Mossos d'Esquadra" : "Mossos d'Esquadra";
    case "ertzaintza":
      return locale === "fr" ? "Ertzaintza" : "Ertzaintza";
    case "ses":
      return "SES.HOSPEDAJES";
    default:
      return locale === "fr" ? "Aucun" : "None";
  }
}
