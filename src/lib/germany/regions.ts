export type GermanyFederalState = "berlin" | "other" | "unknown";

export type BerlinBezirk =
  | "mitte"
  | "friedrichshain_kreuzberg"
  | "pankow"
  | "charlottenburg_wilmersdorf"
  | "spandau"
  | "steglitz_zehlendorf"
  | "tempelhof_schoeneberg"
  | "neukoelln"
  | "treptow_koepenick"
  | "marzahn_hellersdorf"
  | "lichtenberg"
  | "reinickendorf";

export const BERLIN_BEZIRKE: Array<{ id: BerlinBezirk; label: string }> = [
  { id: "mitte", label: "Mitte" },
  { id: "friedrichshain_kreuzberg", label: "Friedrichshain-Kreuzberg" },
  { id: "pankow", label: "Pankow" },
  { id: "charlottenburg_wilmersdorf", label: "Charlottenburg-Wilmersdorf" },
  { id: "spandau", label: "Spandau" },
  { id: "steglitz_zehlendorf", label: "Steglitz-Zehlendorf" },
  { id: "tempelhof_schoeneberg", label: "Tempelhof-Schöneberg" },
  { id: "neukoelln", label: "Neukölln" },
  { id: "treptow_koepenick", label: "Treptow-Köpenick" },
  { id: "marzahn_hellersdorf", label: "Marzahn-Hellersdorf" },
  { id: "lichtenberg", label: "Lichtenberg" },
  { id: "reinickendorf", label: "Reinickendorf" },
];

const DE_COUNTRY_ALIASES = new Set([
  "de",
  "germany",
  "deutschland",
  "allemagne",
  "germania",
]);

const BERLIN_CITY_ALIASES = new Set(["berlin"]);

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isGermanyCountry(country: string): boolean {
  return DE_COUNTRY_ALIASES.has(normalizeKey(country));
}

export function normalizeGermanyCity(city: string): string {
  const key = normalizeKey(city);
  if (BERLIN_CITY_ALIASES.has(key)) return "Berlin";
  return city.trim();
}

export function getGermanyFederalState(city: string): GermanyFederalState {
  const key = normalizeKey(city);
  if (BERLIN_CITY_ALIASES.has(key)) return "berlin";
  return "other";
}

export function resolveGermanyFederalStateForProperty(
  city: string,
  storedState?: string | null
): GermanyFederalState {
  if (storedState === "berlin" || storedState === "other") {
    return storedState;
  }
  return getGermanyFederalState(city);
}

export function isBerlinBezirk(value: string | null | undefined): boolean {
  if (!value) return false;
  return BERLIN_BEZIRKE.some((b) => b.id === value);
}

export function resolveBerlinBezirkForProperty(
  city: string,
  storedBezirk?: string | null
): BerlinBezirk | null {
  if (isBerlinBezirk(storedBezirk)) {
    return storedBezirk as BerlinBezirk;
  }
  if (getGermanyFederalState(city) !== "berlin") {
    return null;
  }
  return null;
}
