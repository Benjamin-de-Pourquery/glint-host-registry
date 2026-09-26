export type AustriaFederalState = "vienna" | "other" | "unknown";

export type AustriaOpsMode = "registration" | "none";

const AT_COUNTRY_ALIASES = new Set([
  "at",
  "austria",
  "österreich",
  "osterreich",
  "autriche",
]);

const VIENNA_CITY_ALIASES = new Set([
  "vienna",
  "wien",
  "vienne",
  "wiener",
]);

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isAustriaCountry(country: string): boolean {
  return AT_COUNTRY_ALIASES.has(normalizeKey(country));
}

export function normalizeAustriaCity(city: string): string {
  const key = normalizeKey(city);
  if (VIENNA_CITY_ALIASES.has(key)) return "Vienna";
  return city.trim();
}

export function getAustriaFederalState(city: string): AustriaFederalState {
  const key = normalizeKey(city);
  if (VIENNA_CITY_ALIASES.has(key)) return "vienna";
  return "other";
}

export function getAustriaMode(city?: string): AustriaOpsMode {
  if (!city) return "registration";
  const state = getAustriaFederalState(city);
  return state === "vienna" || state === "other" ? "registration" : "none";
}

export function resolveAustriaFederalStateForProperty(
  city: string,
  storedState?: string | null
): AustriaFederalState {
  if (storedState === "vienna" || storedState === "other") {
    return storedState;
  }
  return getAustriaFederalState(city);
}
