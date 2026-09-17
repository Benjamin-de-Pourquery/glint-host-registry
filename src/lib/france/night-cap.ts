import { differenceInCalendarDays, startOfDay } from "date-fns";
import { isFranceCountry } from "@/lib/national-transition";
import type { ResidencyStatus } from "@/lib/playbooks/types";

/** Statutory default under Code du tourisme L324-1-1 (120 nights / calendar year). */
export const STATUTORY_NIGHT_CAP = 120;

/** Commune may lower cap to 90 (e.g. Paris, Lyon, Nice). */
export const COMMUNE_NIGHT_CAP_90 = 90;

export const NIGHT_CAP_SOURCES = ["statutory_120", "commune_90", "custom"] as const;
export type NightCapSource = (typeof NIGHT_CAP_SOURCES)[number];

export const NIGHT_CAP_THRESHOLDS = {
  warning: 0.7,
  critical: 0.9,
} as const;

export type NightCapStatusLevel = "ok" | "warning" | "critical" | "exceeded" | "disabled" | "not_applicable";

export type GuestStayNightInput = {
  checkInDate: Date | string;
  checkOutDate: Date | string;
  importStatus?: string | null;
};

export type NightCapSettingsInput = {
  nightCapEnabled: boolean;
  nightCapLimit: number;
  nightCapYear: number;
  nightCapSource: NightCapSource;
  notes?: string | null;
};

export type NightCapComputation = {
  year: number;
  nightsUsed: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  status: NightCapStatusLevel;
  enabled: boolean;
  source: NightCapSource;
};

export const LEGIFRANCE_L324_1_1_URL =
  "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006076939";
export const SERVICE_PUBLIC_STR_URL =
  "https://www.service-public.fr/particuliers/vosdroits/F2043";

/** Cities where playbooks document a 90-night commune cap for primary residences. */
const COMMUNE_90_CITIES = new Set(["paris", "lyon", "nice"]);

const EXCLUDED_IMPORT_STATUSES = new Set(["cancelled", "removed_from_feed"]);

export function isPrimaryResidence(
  residencyStatus: ResidencyStatus | string | null | undefined
): boolean {
  return residencyStatus === "primary";
}

export function nightCapApplies(
  country: string,
  residencyStatus: ResidencyStatus | string | null | undefined
): boolean {
  return isFranceCountry(country) && isPrimaryResidence(residencyStatus);
}

export function defaultNightCapSourceForCity(city: string): NightCapSource {
  const key = city.trim().toLowerCase();
  return COMMUNE_90_CITIES.has(key) ? "commune_90" : "statutory_120";
}

export function limitForSource(source: NightCapSource, customLimit?: number): number {
  if (source === "commune_90") return COMMUNE_NIGHT_CAP_90;
  if (source === "custom" && customLimit != null && customLimit > 0) return customLimit;
  return STATUTORY_NIGHT_CAP;
}

export function defaultNightCapLimitForCity(city: string): number {
  return limitForSource(defaultNightCapSourceForCity(city));
}

/**
 * Hotel-style night count: check-in inclusive, check-out exclusive.
 * Example: check-in 1 Jan, check-out 3 Jan → 2 nights (1–2 Jan).
 */
export function countNightsBetween(checkIn: Date, checkOut: Date): number {
  const start = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  const nights = differenceInCalendarDays(end, start);
  return nights > 0 ? nights : 0;
}

/**
 * Count nights from a stay that fall within a calendar year [Jan 1, Dec 31],
 * using check-in inclusive / check-out exclusive semantics.
 */
export function countStayNightsInYear(
  checkIn: Date | string,
  checkOut: Date | string,
  year: number
): number {
  const inDate = startOfDay(new Date(checkIn));
  const outDate = startOfDay(new Date(checkOut));
  const yearStart = startOfDay(new Date(year, 0, 1));
  const yearEndExclusive = startOfDay(new Date(year + 1, 0, 1));

  const effectiveStart = inDate < yearStart ? yearStart : inDate;
  const effectiveEnd = outDate > yearEndExclusive ? yearEndExclusive : outDate;

  return countNightsBetween(effectiveStart, effectiveEnd);
}

export function shouldCountStayForNightCap(importStatus?: string | null): boolean {
  if (!importStatus) return true;
  return !EXCLUDED_IMPORT_STATUSES.has(importStatus);
}

export function countRentalNightsInYear(
  stays: GuestStayNightInput[],
  year: number
): number {
  let total = 0;
  for (const stay of stays) {
    if (!shouldCountStayForNightCap(stay.importStatus)) continue;
    total += countStayNightsInYear(stay.checkInDate, stay.checkOutDate, year);
  }
  return total;
}

export function resolveNightCapStatusLevel(
  nightsUsed: number,
  limit: number,
  enabled: boolean
): NightCapStatusLevel {
  if (!enabled) return "disabled";
  if (limit <= 0) return "not_applicable";
  if (nightsUsed > limit) return "exceeded";
  const ratio = nightsUsed / limit;
  if (ratio >= NIGHT_CAP_THRESHOLDS.critical) return "critical";
  if (ratio >= NIGHT_CAP_THRESHOLDS.warning) return "warning";
  return "ok";
}

export function computeNightCapStatus(
  stays: GuestStayNightInput[],
  settings: NightCapSettingsInput,
  year: number = new Date().getFullYear()
): NightCapComputation {
  const trackingYear = settings.nightCapYear || year;
  const limit = settings.nightCapSource === "custom"
    ? settings.nightCapLimit
    : limitForSource(settings.nightCapSource, settings.nightCapLimit);

  const nightsUsed = countRentalNightsInYear(stays, trackingYear);
  const remaining = Math.max(0, limit - nightsUsed);
  const percentUsed = limit > 0 ? Math.round((nightsUsed / limit) * 1000) / 10 : 0;

  return {
    year: trackingYear,
    nightsUsed,
    limit,
    remaining,
    percentUsed,
    status: resolveNightCapStatusLevel(nightsUsed, limit, settings.nightCapEnabled),
    enabled: settings.nightCapEnabled,
    source: settings.nightCapSource,
  };
}

export function nightCapNeedsAttention(status: NightCapStatusLevel): boolean {
  return status === "warning" || status === "critical" || status === "exceeded";
}

export function buildDefaultNightCapSettings(city: string): NightCapSettingsInput {
  const source = defaultNightCapSourceForCity(city);
  return {
    nightCapEnabled: true,
    nightCapLimit: limitForSource(source),
    nightCapYear: new Date().getFullYear(),
    nightCapSource: source,
    notes: null,
  };
}

export type NightCapPriorityAction = {
  level: "warning" | "critical" | "exceeded";
  title: { en: string; fr: string };
  message: { en: string; fr: string };
};

export function getNightCapPriorityAction(
  computation: NightCapComputation
): NightCapPriorityAction | null {
  if (!computation.enabled || !nightCapNeedsAttention(computation.status)) {
    return null;
  }

  const { nightsUsed, limit, status } = computation;

  if (status === "exceeded") {
    return {
      level: "exceeded",
      title: {
        en: "Stop accepting bookings — night cap exceeded",
        fr: "Cesser les réservations — plafond de nuitées dépassé",
      },
      message: {
        en: `Primary residence night cap exceeded: ${nightsUsed}/${limit} nights used in ${computation.year}. Further short-term lets risk civil fines up to €15,000.`,
        fr: `Plafond résidence principale dépassé : ${nightsUsed}/${limit} nuitées utilisées en ${computation.year}. Poursuivre la location expose à une amende civile pouvant atteindre 15 000 €.`,
      },
    };
  }

  if (status === "critical") {
    return {
      level: "critical",
      title: {
        en: "Night cap almost reached — pause new bookings",
        fr: "Plafond de nuitées presque atteint — suspendre les réservations",
      },
      message: {
        en: `Approaching primary residence cap: ${nightsUsed}/${limit} nights used (${computation.remaining} remaining) in ${computation.year}.`,
        fr: `Approche du plafond résidence principale : ${nightsUsed}/${limit} nuitées utilisées (${computation.remaining} restantes) en ${computation.year}.`,
      },
    };
  }

  return {
    level: "warning",
    title: {
      en: "Approaching primary residence night cap",
      fr: "Approche du plafond de nuitées (résidence principale)",
    },
    message: {
      en: `${nightsUsed}/${limit} rental nights used in ${computation.year} (${computation.remaining} remaining). Review upcoming stays in your calendar.`,
      fr: `${nightsUsed}/${limit} nuitées de location utilisées en ${computation.year} (${computation.remaining} restantes). Vérifiez les séjours à venir dans votre calendrier.`,
    },
  };
}
