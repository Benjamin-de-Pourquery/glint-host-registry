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

export type SpainGuestReportingSystem = "ses" | "catalonia" | "basque";

export function isSpainCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return c === "spain" || c === "es" || c === "espagne" || c === "espana" || c === "españa";
}

export function getSpainGuestReportingSystem(
  city: string,
  region?: string | null
): SpainGuestReportingSystem {
  const cityKey = city.trim().toLowerCase();
  const regionKey = (region ?? "").trim().toLowerCase();

  if (
    cityKey === "barcelona" ||
    regionKey.includes("catal") ||
    CATALONIA_PROVINCES.has(cityKey)
  ) {
    return "catalonia";
  }

  if (
    ["bilbao", "vitoria", "san sebastián", "donostia"].includes(cityKey) ||
    regionKey.includes("euskadi") ||
    regionKey.includes("país vasco") ||
    regionKey.includes("pais vasco") ||
    BASQUE_PROVINCES.has(cityKey)
  ) {
    return "basque";
  }

  return "ses";
}

export function usesSesHospedajes(city: string, region?: string | null): boolean {
  return getSpainGuestReportingSystem(city, region) === "ses";
}
