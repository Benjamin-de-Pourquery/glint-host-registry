import { differenceInCalendarDays } from "date-fns";

/** Hotel semantics: check-in inclusive, check-out exclusive. */
export function getStayNightCount(checkInDate: Date, checkOutDate: Date): number {
  return differenceInCalendarDays(checkOutDate, checkInDate);
}

/** Short-term rental: up to 59 nights per agreement. */
export function isShortTermStay(checkInDate: Date, checkOutDate: Date): boolean {
  return getStayNightCount(checkInDate, checkOutDate) <= 59;
}

/** Long-term lease path: 60+ nights — use AADE long-term declaration instead. */
export function isLongTermStay(checkInDate: Date, checkOutDate: Date): boolean {
  return getStayNightCount(checkInDate, checkOutDate) >= 60;
}

/**
 * AADE short-term stay declaration due by the 20th of the month following guest departure.
 * e.g. checkout 15 Jul → declare by 20 Aug.
 */
export function getAadeDeclarationDeadline(checkOutDate: Date): Date {
  const year = checkOutDate.getFullYear();
  const month = checkOutDate.getMonth();
  const deadlineMonth = month + 1;
  const deadlineYear = deadlineMonth > 11 ? year + 1 : year;
  const normalizedMonth = deadlineMonth % 12;
  return new Date(deadlineYear, normalizedMonth, 20, 23, 59, 59, 999);
}

export function getDaysUntilDeadline(deadline: Date, now: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((deadline.getTime() - now.getTime()) / msPerDay);
}
