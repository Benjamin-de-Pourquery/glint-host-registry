import { differenceInCalendarDays, endOfMonth, startOfMonth } from "date-fns";

export function overlapsPeriod(
  checkIn: Date,
  checkOut: Date,
  periodStart: Date,
  periodEnd: Date
): boolean {
  return checkIn <= periodEnd && checkOut >= periodStart;
}

export function nightsInPeriod(
  checkIn: Date,
  checkOut: Date,
  periodStart: Date,
  periodEnd: Date
): number {
  if (!overlapsPeriod(checkIn, checkOut, periodStart, periodEnd)) {
    return 0;
  }
  const effectiveStart = checkIn < periodStart ? periodStart : checkIn;
  const effectiveEnd = checkOut > periodEnd ? periodEnd : checkOut;
  return Math.max(0, differenceInCalendarDays(effectiveEnd, effectiveStart));
}

export function defaultMonthPeriod(reference: Date = new Date()): { periodStart: Date; periodEnd: Date } {
  return {
    periodStart: startOfMonth(reference),
    periodEnd: endOfMonth(reference),
  };
}

export function parsePeriodParam(value: string | null): { periodStart: Date; periodEnd: Date } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = endOfMonth(periodStart);
  return { periodStart, periodEnd };
}

export function formatPeriodMonth(periodStart: Date): string {
  const y = periodStart.getFullYear();
  const m = String(periodStart.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
