export type GermanyFederalState = "berlin" | "bayern" | "other" | "unknown";

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

export type MunichRentalUnitType = "private_room" | "whole_unit";

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

export const MUNICH_RENTAL_UNIT_TYPES: Array<{ id: MunichRentalUnitType; label: string }> = [
  { id: "private_room", label: "Private room" },
  { id: "whole_unit", label: "Whole apartment / unit" },
];

const DE_COUNTRY_ALIASES = new Set([
  "de",
  "germany",
  "deutschland",
  "allemagne",
  "germania",
]);

const BERLIN_CITY_ALIASES = new Set(["berlin"]);

const MUNICH_CITY_ALIASES = new Set(["munich", "munchen", "muenchen"]);

const BAVARIA_STATE_ALIASES = new Set(["bayern", "bavaria", "baviere"]);

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

export function isMunichCity(city: string): boolean {
  return MUNICH_CITY_ALIASES.has(normalizeKey(city));
}

export function normalizeGermanyCity(city: string): string {
  const key = normalizeKey(city);
  if (BERLIN_CITY_ALIASES.has(key)) return "Berlin";
  if (MUNICH_CITY_ALIASES.has(key)) return "Munich";
  return city.trim();
}

export function getGermanyFederalState(city: string): GermanyFederalState {
  const key = normalizeKey(city);
  if (BERLIN_CITY_ALIASES.has(key)) return "berlin";
  if (MUNICH_CITY_ALIASES.has(key)) return "bayern";
  return "other";
}

export function resolveGermanyFederalStateForProperty(
  city: string,
  storedState?: string | null
): GermanyFederalState {
  if (
    storedState === "berlin" ||
    storedState === "bayern" ||
    storedState === "other"
  ) {
    return storedState;
  }
  return getGermanyFederalState(city);
}

export function isBerlinBezirk(value: string | null | undefined): boolean {
  if (!value) return false;
  return BERLIN_BEZIRKE.some((b) => b.id === value);
}

export function isMunichRentalUnitType(value: string | null | undefined): boolean {
  if (!value) return false;
  return MUNICH_RENTAL_UNIT_TYPES.some((u) => u.id === value);
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

export function resolveMunichUnitTypeForProperty(
  city: string,
  storedUnitType?: string | null
): MunichRentalUnitType | null {
  if (isMunichRentalUnitType(storedUnitType)) {
    return storedUnitType as MunichRentalUnitType;
  }
  if (!isMunichCity(city)) {
    return null;
  }
  return null;
}

/** Optional hint when host sets Bundesland without a Munich city string. */
export function isBavariaFederalStateHint(value: string | null | undefined): boolean {
  if (!value) return false;
  return BAVARIA_STATE_ALIASES.has(normalizeKey(value));
}
