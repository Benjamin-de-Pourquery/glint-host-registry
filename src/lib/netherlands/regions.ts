/** Amsterdam wijken with 15-night cap from 1 April 2026 (Eerste aanwijzingsbesluit / Gemeenteblad 2026, 151001). */
export const AMSTERDAM_15_NIGHT_WIJKEN = [
  "burgwallen-nieuwe-zijde",
  "de-weteringschans",
  "grachtengordel-west",
  "grachtengordel-zuid",
  "haarlemmerbuurt",
  "jordaan",
  "nieuwmarkt-lastage",
  "oude-pijp",
] as const;

export type AmsterdamWijkKey = (typeof AMSTERDAM_15_NIGHT_WIJKEN)[number];

export const AMSTERDAM_WIJK_LABELS: Record<AmsterdamWijkKey, { en: string; fr: string }> = {
  "burgwallen-nieuwe-zijde": {
    en: "Burgwallen-Nieuwe Zijde",
    fr: "Burgwallen-Nieuwe Zijde",
  },
  "de-weteringschans": {
    en: "De Weteringschans",
    fr: "De Weteringschans",
  },
  "grachtengordel-west": {
    en: "Grachtengordel-West",
    fr: "Grachtengordel-West",
  },
  "grachtengordel-zuid": {
    en: "Grachtengordel-Zuid",
    fr: "Grachtengordel-Zuid",
  },
  "haarlemmerbuurt": {
    en: "Haarlemmerbuurt",
    fr: "Haarlemmerbuurt",
  },
  jordaan: {
    en: "Jordaan",
    fr: "Jordaan",
  },
  "nieuwmarkt-lastage": {
    en: "Nieuwmarkt/Lastage",
    fr: "Nieuwmarkt/Lastage",
  },
  "oude-pijp": {
    en: "Oude Pijp",
    fr: "Oude Pijp",
  },
};

export type NetherlandsOpsMode = "stay_notify" | "none";

export type NlNightCapSource =
  | "amsterdam_30"
  | "amsterdam_15"
  | "nl_municipal"
  | "none";

const NL_COUNTRY_ALIASES = new Set([
  "nl",
  "netherlands",
  "nederland",
  "pays-bas",
  "holland",
]);

const AMSTERDAM_CITY_ALIASES = new Set([
  "amsterdam",
  "ams",
]);

const ROTTERDAM_CITY_ALIASES = new Set(["rotterdam"]);
const DEN_HAAG_CITY_ALIASES = new Set([
  "den haag",
  "the hague",
  "'s-gravenhage",
  "s-gravenhage",
  "gravenhage",
]);
const UTRECHT_CITY_ALIASES = new Set(["utrecht"]);

export function isNetherlandsCountry(country: string): boolean {
  return NL_COUNTRY_ALIASES.has(country.trim().toLowerCase());
}

export function normalizeNetherlandsCity(city: string): string {
  const key = city.trim().toLowerCase();
  if (AMSTERDAM_CITY_ALIASES.has(key)) return "Amsterdam";
  if (ROTTERDAM_CITY_ALIASES.has(key)) return "Rotterdam";
  if (DEN_HAAG_CITY_ALIASES.has(key)) return "Den Haag";
  if (UTRECHT_CITY_ALIASES.has(key)) return "Utrecht";
  return city.trim();
}

export function isAmsterdamCity(city: string): boolean {
  return AMSTERDAM_CITY_ALIASES.has(city.trim().toLowerCase());
}

export function isAmsterdam15NightWijk(wijkKey: string | null | undefined): boolean {
  if (!wijkKey) return false;
  return (AMSTERDAM_15_NIGHT_WIJKEN as readonly string[]).includes(wijkKey);
}

/**
 * Resolve night-cap source from city + wijk.
 * Amsterdam default 30; auto 15 when wijk is in the 8 designated zones.
 */
export function resolveNlNightCapSource(
  city: string,
  wijkKey: string | null | undefined
): NlNightCapSource {
  if (!isAmsterdamCity(city)) {
    return "nl_municipal";
  }
  if (isAmsterdam15NightWijk(wijkKey)) {
    return "amsterdam_15";
  }
  return "amsterdam_30";
}

export function nightCapLimitForNlSource(source: NlNightCapSource): number | null {
  switch (source) {
    case "amsterdam_30":
      return 30;
    case "amsterdam_15":
      return 15;
    case "nl_municipal":
      return null;
    case "none":
      return null;
    default:
      return null;
  }
}

/** NL ops mode — municipal stay notification (not police guest fiche). */
export function getNetherlandsMode(city: string): NetherlandsOpsMode {
  const normalized = normalizeNetherlandsCity(city);
  if (
    normalized === "Amsterdam" ||
    normalized === "Rotterdam" ||
    normalized === "Den Haag" ||
    normalized === "Utrecht"
  ) {
    return "stay_notify";
  }
  return "stay_notify";
}

export function requiresNlStayNotification(city: string): boolean {
  return getNetherlandsMode(city) === "stay_notify";
}
