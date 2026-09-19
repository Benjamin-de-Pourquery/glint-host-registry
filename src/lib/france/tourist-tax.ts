import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from "date-fns";
import { isFranceCountry } from "@/lib/national-transition";
import {
  countNightsBetween,
  shouldCountStayForNightCap,
  type GuestStayNightInput,
} from "@/lib/france/night-cap";

export const COLLECTION_MODES = [
  "platform_collects",
  "host_collects",
  "mixed",
  "unknown",
] as const;
export type CollectionMode = (typeof COLLECTION_MODES)[number];

export const DECLARATION_CADENCES = [
  "monthly",
  "bimonthly",
  "quarterly",
  "annual",
  "unknown",
] as const;
export type DeclarationCadence = (typeof DECLARATION_CADENCES)[number];

export const CLASSIFICATIONS = [
  "unclassified",
  "1",
  "2",
  "3",
  "4",
  "5",
  "unknown",
] as const;
export type MeubleClassification = (typeof CLASSIFICATIONS)[number];

export const PERIOD_STATUSES = [
  "upcoming",
  "due",
  "declared",
  "overdue",
  "waived",
] as const;
export type TouristTaxPeriodStatus = (typeof PERIOD_STATUSES)[number];

export const DECLARATION_CHANNELS = [
  "host_portal",
  "platform_tiers",
  "other",
] as const;
export type DeclarationChannel = (typeof DECLARATION_CHANNELS)[number];

export const CGCT_TAXE_DE_SEJOUR_URL =
  "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006076939";
export const SERVICE_PUBLIC_TAXE_DE_SEJOUR_URL =
  "https://www.service-public.fr/particuliers/vosdroits/F32963";

export type TouristTaxSettingsInput = {
  enabled: boolean;
  collectionMode: CollectionMode;
  declarationCadence: DeclarationCadence;
  portalUrl?: string | null;
  classification: MeubleClassification;
  attestationOnFile: boolean;
  notes?: string | null;
};

export type TouristTaxPeriodInput = {
  id: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  status: TouristTaxPeriodStatus;
  nightsInPeriod?: number | null;
  declaredAt?: Date | string | null;
  declarationChannel?: string | null;
  amountCents?: number | null;
  notes?: string | null;
};

export type TouristTaxPeriodComputation = TouristTaxPeriodInput & {
  declarationDueDate: Date;
  daysUntilDue: number | null;
  needsAttention: boolean;
};

export type TouristTaxSummary = {
  enabled: boolean;
  collectionMode: CollectionMode;
  declarationCadence: DeclarationCadence;
  attentionCount: number;
  overdueCount: number;
  dueCount: number;
  nextDuePeriod: TouristTaxPeriodComputation | null;
  periods: TouristTaxPeriodComputation[];
};

export function touristTaxApplies(country: string): boolean {
  return isFranceCountry(country);
}

export function buildDefaultTouristTaxSettings(): TouristTaxSettingsInput {
  return {
    enabled: true,
    collectionMode: "unknown",
    declarationCadence: "monthly",
    portalUrl: null,
    classification: "unclassified",
    attestationOnFile: false,
    notes: null,
  };
}

export function countStayNightsInPeriod(
  checkIn: Date | string,
  checkOut: Date | string,
  periodStart: Date,
  periodEnd: Date
): number {
  const inDate = startOfDay(new Date(checkIn));
  const outDate = startOfDay(new Date(checkOut));
  const windowStart = startOfDay(periodStart);
  const windowEndExclusive = startOfDay(addDays(periodEnd, 1));

  const effectiveStart = inDate < windowStart ? windowStart : inDate;
  const effectiveEnd = outDate > windowEndExclusive ? windowEndExclusive : outDate;

  return countNightsBetween(effectiveStart, effectiveEnd);
}

export function countRentalNightsInPeriod(
  stays: GuestStayNightInput[],
  periodStart: Date,
  periodEnd: Date
): number {
  let total = 0;
  for (const stay of stays) {
    if (!shouldCountStayForNightCap(stay.importStatus)) continue;
    total += countStayNightsInPeriod(
      stay.checkInDate,
      stay.checkOutDate,
      periodStart,
      periodEnd
    );
  }
  return total;
}

export function getDeclarationDueDate(periodEnd: Date, cadence: DeclarationCadence): Date {
  const end = startOfDay(periodEnd);
  if (cadence === "annual") {
    return endOfDay(endOfMonth(new Date(end.getFullYear(), 2, 1)));
  }
  if (cadence === "quarterly") {
    const quarterEnd = endOfQuarter(end);
    return endOfDay(endOfMonth(addDays(quarterEnd, 1)));
  }
  if (cadence === "bimonthly") {
    const month = end.getMonth();
    const dueMonth = month % 2 === 0 ? month + 2 : month + 1;
    const dueYear = dueMonth > 11 ? end.getFullYear() + 1 : end.getFullYear();
    const normalizedMonth = dueMonth > 11 ? 0 : dueMonth;
    return endOfDay(endOfMonth(new Date(dueYear, normalizedMonth, 1)));
  }
  return endOfDay(endOfMonth(addDays(end, 1)));
}

export function getPeriodBounds(
  reference: Date,
  cadence: DeclarationCadence
): { periodStart: Date; periodEnd: Date } {
  const ref = startOfDay(reference);
  if (cadence === "annual") {
    return { periodStart: startOfYear(ref), periodEnd: endOfDay(endOfYear(ref)) };
  }
  if (cadence === "quarterly") {
    return { periodStart: startOfQuarter(ref), periodEnd: endOfDay(endOfQuarter(ref)) };
  }
  if (cadence === "bimonthly") {
    const month = ref.getMonth();
    const startMonth = Math.floor(month / 2) * 2;
    const periodStart = startOfMonth(new Date(ref.getFullYear(), startMonth, 1));
    const periodEnd = endOfDay(endOfMonth(new Date(ref.getFullYear(), startMonth + 1, 1)));
    return { periodStart, periodEnd };
  }
  return { periodStart: startOfMonth(ref), periodEnd: endOfDay(endOfMonth(ref)) };
}

export function getPreviousPeriodBounds(
  periodStart: Date,
  cadence: DeclarationCadence
): { periodStart: Date; periodEnd: Date } {
  if (cadence === "annual") {
    const prev = new Date(periodStart.getFullYear() - 1, 0, 1);
    return getPeriodBounds(prev, cadence);
  }
  if (cadence === "quarterly") {
    const prev = subMonths(periodStart, 3);
    return getPeriodBounds(prev, cadence);
  }
  if (cadence === "bimonthly") {
    const prev = subMonths(periodStart, 2);
    return getPeriodBounds(prev, cadence);
  }
  const prev = subMonths(periodStart, 1);
  return getPeriodBounds(prev, cadence);
}

export function listPeriodBoundsToEnsure(
  cadence: DeclarationCadence,
  now: Date = new Date()
): Array<{ periodStart: Date; periodEnd: Date }> {
  const effectiveCadence = cadence === "unknown" ? "monthly" : cadence;
  const current = getPeriodBounds(now, effectiveCadence);
  const previous = getPreviousPeriodBounds(current.periodStart, effectiveCadence);
  const periods = [previous, current];

  if (effectiveCadence === "monthly") {
    const twoBack = getPreviousPeriodBounds(previous.periodStart, effectiveCadence);
    periods.unshift(twoBack);
  }

  const seen = new Set<string>();
  return periods.filter((p) => {
    const key = p.periodStart.toISOString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resolvePeriodStatus(
  periodStart: Date,
  periodEnd: Date,
  storedStatus: TouristTaxPeriodStatus,
  cadence: DeclarationCadence,
  now: Date = new Date()
): TouristTaxPeriodStatus {
  if (storedStatus === "declared" || storedStatus === "waived") {
    return storedStatus;
  }

  const today = startOfDay(now);
  const start = startOfDay(periodStart);
  const end = startOfDay(periodEnd);
  const dueDate = startOfDay(getDeclarationDueDate(periodEnd, cadence));

  if (today < start) return "upcoming";
  if (today > dueDate) return "overdue";
  if (today > end) return "due";
  return "upcoming";
}

export function periodNeedsAttention(
  status: TouristTaxPeriodStatus,
  declarationDueDate: Date,
  now: Date = new Date()
): boolean {
  if (status === "declared" || status === "waived" || status === "upcoming") {
    return false;
  }
  if (status === "overdue") return true;
  if (status === "due") {
    const days = differenceInCalendarDays(startOfDay(declarationDueDate), startOfDay(now));
    return days <= 7;
  }
  return false;
}

export function enrichPeriod(
  period: TouristTaxPeriodInput,
  settings: TouristTaxSettingsInput,
  now: Date = new Date()
): TouristTaxPeriodComputation {
  const periodStart = new Date(period.periodStart);
  const periodEnd = new Date(period.periodEnd);
  const status = resolvePeriodStatus(
    periodStart,
    periodEnd,
    period.status,
    settings.declarationCadence,
    now
  );
  const declarationDueDate = getDeclarationDueDate(periodEnd, settings.declarationCadence);
  const daysUntilDue =
    status === "declared" || status === "waived"
      ? null
      : differenceInCalendarDays(startOfDay(declarationDueDate), startOfDay(now));

  return {
    ...period,
    status,
    declarationDueDate,
    daysUntilDue,
    needsAttention: periodNeedsAttention(status, declarationDueDate, now),
  };
}

export function computeTouristTaxSummary(
  settings: TouristTaxSettingsInput,
  periods: TouristTaxPeriodInput[],
  stays: GuestStayNightInput[],
  now: Date = new Date()
): TouristTaxSummary {
  if (!settings.enabled) {
    return {
      enabled: false,
      collectionMode: settings.collectionMode,
      declarationCadence: settings.declarationCadence,
      attentionCount: 0,
      overdueCount: 0,
      dueCount: 0,
      nextDuePeriod: null,
      periods: [],
    };
  }

  const enriched = periods
    .map((period) => {
      const periodStart = new Date(period.periodStart);
      const periodEnd = new Date(period.periodEnd);
      const nights =
        period.nightsInPeriod ??
        countRentalNightsInPeriod(stays, periodStart, periodEnd);
      return enrichPeriod({ ...period, nightsInPeriod: nights }, settings, now);
    })
    .sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime());

  const attention = enriched.filter((p) => p.needsAttention);
  const overdueCount = attention.filter((p) => p.status === "overdue").length;
  const dueCount = attention.filter((p) => p.status === "due").length;
  const nextDuePeriod =
    attention.sort(
      (a, b) => a.declarationDueDate.getTime() - b.declarationDueDate.getTime()
    )[0] ?? null;

  return {
    enabled: true,
    collectionMode: settings.collectionMode,
    declarationCadence: settings.declarationCadence,
    attentionCount: attention.length,
    overdueCount,
    dueCount,
    nextDuePeriod,
    periods: enriched,
  };
}

export type TouristTaxPriorityAction = {
  level: "warning" | "critical";
  title: { en: string; fr: string };
  message: { en: string; fr: string };
};

export function getTouristTaxPriorityAction(
  summary: TouristTaxSummary
): TouristTaxPriorityAction | null {
  if (!summary.enabled || summary.attentionCount === 0 || !summary.nextDuePeriod) {
    return null;
  }

  const period = summary.nextDuePeriod;
  const periodLabel = formatPeriodLabel(period.periodStart, period.periodEnd);
  const nights = period.nightsInPeriod ?? 0;

  if (period.status === "overdue") {
    return {
      level: "critical",
      title: {
        en: "Tourist tax declaration overdue",
        fr: "Déclaration taxe de séjour en retard",
      },
      message: {
        en: `Period ${periodLabel} is overdue on your commune/EPCI portal. Declare even if €0 or collected by the platform (${nights} taxable nights tracked).`,
        fr: `La période ${periodLabel} est en retard sur le portail commune/EPCI. Déclarez même à 0 € ou « via tiers collecteur » (${nights} nuitées suivies).`,
      },
    };
  }

  const days = period.daysUntilDue ?? 0;
  return {
    level: "warning",
    title: {
      en: "Tourist tax declaration due soon",
      fr: "Déclaration taxe de séjour à faire",
    },
    message: {
      en: `Declare taxe de séjour for ${periodLabel} within ${days} day(s). Platform collection does not replace your host declaration (${nights} nights).`,
      fr: `Déclarez la taxe de séjour pour ${periodLabel} sous ${days} jour(s). La collecte plateforme ne remplace pas votre déclaration hôte (${nights} nuitées).`,
    },
  };
}

export function formatPeriodLabel(
  periodStart: Date | string,
  periodEnd: Date | string,
  locale: "en" | "fr" = "en"
): string {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const loc = locale === "fr" ? "fr-FR" : "en-GB";
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return start.toLocaleDateString(loc, { month: "short", year: "numeric" });
  }
  const startStr = start.toLocaleDateString(loc, { month: "short", year: "numeric" });
  const endStr = end.toLocaleDateString(loc, { month: "short", year: "numeric" });
  return `${startStr} – ${endStr}`;
}

export function touristTaxNeedsAttention(summary: TouristTaxSummary): boolean {
  return summary.enabled && summary.attentionCount > 0;
}
