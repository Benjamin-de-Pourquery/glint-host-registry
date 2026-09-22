import {
  countRentalNightsInYear,
  getNightCapPriorityAction,
  nightCapNeedsAttention,
  resolveNightCapStatusLevel,
  type GuestStayNightInput,
  type NightCapComputation,
  type NightCapSettingsInput,
} from "@/lib/france/night-cap";
import {
  isAmsterdamCity,
  isNetherlandsCountry,
  nightCapLimitForNlSource,
  resolveNlNightCapSource,
  type NlNightCapSource,
} from "./regions";

export const NL_NIGHT_CAP_SOURCES = [
  "amsterdam_30",
  "amsterdam_15",
  "nl_municipal",
  "none",
] as const;

export function nlNightCapApplies(
  country: string,
  residencyStatus: string | null | undefined,
  city: string
): boolean {
  if (!isNetherlandsCountry(country)) return false;
  if (residencyStatus !== "primary") return false;
  return isAmsterdamCity(city);
}

export function buildDefaultNlNightCapSettings(
  city: string,
  wijkKey: string | null | undefined
): NightCapSettingsInput & { nlSource: NlNightCapSource } {
  const nlSource = resolveNlNightCapSource(city, wijkKey);
  const limit = nightCapLimitForNlSource(nlSource) ?? 30;

  return {
    nightCapEnabled: nlSource !== "none",
    nightCapLimit: limit,
    nightCapYear: new Date().getFullYear(),
    nightCapSource: "custom",
    notes: null,
    nlSource,
  };
}

export function computeNlNightCapStatus(
  stays: GuestStayNightInput[],
  city: string,
  wijkKey: string | null | undefined,
  settings?: Partial<NightCapSettingsInput>
): NightCapComputation | null {
  const defaults = buildDefaultNlNightCapSettings(city, wijkKey);
  const limit = settings?.nightCapLimit ?? defaults.nightCapLimit;
  const enabled = settings?.nightCapEnabled ?? defaults.nightCapEnabled;
  const year = settings?.nightCapYear ?? defaults.nightCapYear;

  if (!enabled || limit <= 0) {
    return {
      year,
      nightsUsed: countRentalNightsInYear(stays, year),
      limit,
      remaining: 0,
      percentUsed: 0,
      status: "not_applicable",
      enabled: false,
      source: "custom",
    };
  }

  const nightsUsed = countRentalNightsInYear(stays, year);
  const remaining = Math.max(0, limit - nightsUsed);
  const percentUsed = limit > 0 ? Math.round((nightsUsed / limit) * 1000) / 10 : 0;

  return {
    year,
    nightsUsed,
    limit,
    remaining,
    percentUsed,
    status: resolveNightCapStatusLevel(nightsUsed, limit, enabled),
    enabled,
    source: "custom",
  };
}

export function getNlNightCapPriorityAction(
  computation: NightCapComputation,
  nlSource: NlNightCapSource
): ReturnType<typeof getNightCapPriorityAction> {
  const base = getNightCapPriorityAction(computation);
  if (!base) return null;

  const capLabel = nlSource === "amsterdam_15" ? "15" : "30";

  if (base.level === "exceeded") {
    return {
      ...base,
      title: {
        en: `Stop accepting bookings — Amsterdam ${capLabel}-night cap exceeded`,
        fr: `Cesser les réservations — plafond Amsterdam ${capLabel} nuitées dépassé`,
      },
    };
  }

  return base;
}

export { nightCapNeedsAttention };
