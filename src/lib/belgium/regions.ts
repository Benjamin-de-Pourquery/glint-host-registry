export type BelgiumRegion = "brussels" | "flanders" | "wallonia" | "unknown";

export type BelgiumOpsMode = "registration" | "none";

const BE_COUNTRY_ALIASES = new Set([
  "be",
  "belgium",
  "belgique",
  "belgië",
  "belgie",
]);

const BRUSSELS_CITY_ALIASES = new Set([
  "brussels",
  "bruxelles",
  "brussel",
  "brussels-capital",
  "region de bruxelles-capitale",
  "brussels hoofdstedelijk gewest",
]);

const FLANDERS_CITY_ALIASES = new Set([
  "antwerp",
  "antwerpen",
  "anvers",
  "ghent",
  "gent",
  "gand",
  "bruges",
  "brugge",
  "bruges",
  "leuven",
  "louvain",
  "mechelen",
  "malines",
  "bruges",
]);

const WALLONIA_CITY_ALIASES = new Set([
  "liège",
  "liege",
  "luik",
  "namur",
  "namen",
  "charleroi",
  "mons",
  "bergen",
  "tournai",
  "doornik",
]);

const FLANDERS_REGION_HINTS = new Set([
  "flanders",
  "vlaanderen",
  "flandre",
  "vl",
  "antwerp",
  "east flanders",
  "west flanders",
  "flemish brabant",
  "limburg",
]);

const WALLONIA_REGION_HINTS = new Set([
  "wallonia",
  "wallonie",
  "wa",
  "hainaut",
  "liège",
  "liege",
  "luxembourg",
  "namur",
  "walloon brabant",
]);

const BRUSSELS_REGION_HINTS = new Set([
  "brussels",
  "bruxelles",
  "brussel",
  "brussels-capital",
  "bxl",
]);

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isBelgiumCountry(country: string): boolean {
  return BE_COUNTRY_ALIASES.has(normalizeKey(country));
}

export function normalizeBelgiumCity(city: string): string {
  const key = normalizeKey(city);
  if (BRUSSELS_CITY_ALIASES.has(key)) return "Brussels";
  if (key === "antwerp" || key === "antwerpen" || key === "anvers") return "Antwerp";
  if (key === "ghent" || key === "gent" || key === "gand") return "Ghent";
  if (key === "bruges" || key === "brugge") return "Bruges";
  if (key === "leuven" || key === "louvain") return "Leuven";
  if (key === "mechelen" || key === "malines") return "Mechelen";
  if (key === "liège" || key === "liege" || key === "luik") return "Liège";
  if (key === "namur" || key === "namen") return "Namur";
  if (key === "charleroi") return "Charleroi";
  if (key === "mons" || key === "bergen") return "Mons";
  if (key === "tournai" || key === "doornik") return "Tournai";
  return city.trim();
}

function regionFromHint(regionHint?: string | null): BelgiumRegion | null {
  if (!regionHint?.trim()) return null;
  const key = normalizeKey(regionHint);
  if (BRUSSELS_REGION_HINTS.has(key)) return "brussels";
  if (FLANDERS_REGION_HINTS.has(key)) return "flanders";
  if (WALLONIA_REGION_HINTS.has(key)) return "wallonia";
  return null;
}

function regionFromPostal(postal?: string | null): BelgiumRegion | null {
  if (!postal?.trim()) return null;
  const digits = postal.trim().replace(/\D/g, "");
  if (digits.length < 4) return null;
  const prefix = parseInt(digits.slice(0, 4), 10);
  if (prefix >= 1000 && prefix <= 1299) return "brussels";
  if (prefix >= 1300 && prefix <= 1499) return "wallonia";
  if (
    (prefix >= 1500 && prefix <= 3999) ||
    (prefix >= 8000 && prefix <= 9999)
  ) {
    return "flanders";
  }
  if (prefix >= 4000 && prefix <= 7999) return "wallonia";
  return null;
}

/**
 * Resolve Belgium region from city and optional postal/region hint.
 * Belgium has no single national STR registration — routing is tri-regional.
 */
export function getBelgiumRegion(
  city: string,
  regionHint?: string | null,
  postal?: string | null
): BelgiumRegion {
  const fromHint = regionFromHint(regionHint);
  if (fromHint) return fromHint;

  const key = normalizeKey(city);
  if (BRUSSELS_CITY_ALIASES.has(key)) return "brussels";
  if (FLANDERS_CITY_ALIASES.has(key)) return "flanders";
  if (WALLONIA_CITY_ALIASES.has(key)) return "wallonia";

  const fromPostal = regionFromPostal(postal);
  if (fromPostal) return fromPostal;

  return "unknown";
}

/** Belgium ops mode — registration-focused (no police guest-reporting API). */
export function getBelgiumMode(_city?: string): BelgiumOpsMode {
  return "registration";
}

export function resolveBelgiumRegionForProperty(
  city: string,
  storedRegion?: string | null,
  regionHint?: string | null,
  postal?: string | null
): BelgiumRegion {
  if (
    storedRegion === "brussels" ||
    storedRegion === "flanders" ||
    storedRegion === "wallonia"
  ) {
    return storedRegion;
  }
  return getBelgiumRegion(city, regionHint, postal);
}
