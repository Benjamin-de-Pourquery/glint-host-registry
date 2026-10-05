import { addDays, addWeeks, endOfDay, startOfDay, startOfYear } from "date-fns";
import { countRentalNightsInYear, type GuestStayNightInput } from "@/lib/france/night-cap";
import { IE_PPR_EXEMPT_NIGHT_CAP, IE_STL_REGISTRATION_DEADLINE } from "./constants";
import { CITIZENS_INFO_STL_URL } from "./official-links";

export type IrelandPlanningFormKind = "form_15" | "form_16" | "form_17";

export type PlanningFormDueItem = {
  kind: IrelandPlanningFormKind;
  propertyId: string;
  year: number;
  dueBy: Date;
  sourceUrl: string;
  nightsUsedInYear?: number;
};

export type ExemptPlanningStatus =
  | "exempt_home_sharing"
  | "exempt_ppr_under_90";

export function isExemptPlanningStatus(
  status: string | null | undefined
): status is ExemptPlanningStatus {
  return status === "exempt_home_sharing" || status === "exempt_ppr_under_90";
}

function yearStart(year: number): Date {
  return startOfYear(new Date(year, 0, 15));
}

function form15DeadlineForYear(year: number, firstLetInYear: Date | null): Date {
  const windowEnd = endOfDay(addWeeks(yearStart(year), 4));
  if (!firstLetInYear) {
    return windowEnd;
  }
  const atLeastTwoWeeksBeforeFirstLet = endOfDay(
    addDays(startOfDay(firstLetInYear), -14)
  );
  return atLeastTwoWeeksBeforeFirstLet < windowEnd
    ? atLeastTwoWeeksBeforeFirstLet
    : windowEnd;
}

function earliestCheckInInYear(
  stays: GuestStayNightInput[],
  year: number
): Date | null {
  let earliest: Date | null = null;
  for (const stay of stays) {
    const checkIn = new Date(stay.checkInDate);
    if (checkIn.getFullYear() !== year) continue;
    if (!earliest || checkIn < earliest) {
      earliest = checkIn;
    }
  }
  return earliest;
}

export function getForm15DueBy(
  year: number,
  stays: GuestStayNightInput[],
  now: Date = new Date()
): Date | null {
  if (year !== now.getFullYear()) return null;
  const firstLet = earliestCheckInInYear(stays, year);
  if (!firstLet && stays.length === 0) {
    return form15DeadlineForYear(year, null);
  }
  return form15DeadlineForYear(year, firstLet);
}

export function isForm15Overdue(
  year: number,
  stays: GuestStayNightInput[],
  now: Date = new Date()
): boolean {
  const dueBy = getForm15DueBy(year, stays, now);
  if (!dueBy) return false;
  return now > dueBy;
}

export function getForm16DueBy(
  stays: GuestStayNightInput[],
  year: number
): Date | null {
  const nights = countRentalNightsInYear(stays, year);
  if (nights < IE_PPR_EXEMPT_NIGHT_CAP) return null;

  let running = 0;
  const sorted = [...stays].sort(
    (a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
  );

  for (const stay of sorted) {
    const checkIn = new Date(stay.checkInDate);
    const checkOut = new Date(stay.checkOutDate);
    if (checkOut.getFullYear() < year || checkIn.getFullYear() > year) continue;
    const nightsInStay = Math.max(
      0,
      Math.ceil(
        (Math.min(checkOut.getTime(), endOfDay(new Date(year, 11, 31)).getTime()) -
          Math.max(checkIn.getTime(), yearStart(year).getTime())) /
          (1000 * 60 * 60 * 24)
      )
    );
    const before = running;
    running += nightsInStay;
    if (before < IE_PPR_EXEMPT_NIGHT_CAP && running >= IE_PPR_EXEMPT_NIGHT_CAP) {
      return endOfDay(addDays(checkOut, 14));
    }
  }

  if (nights >= IE_PPR_EXEMPT_NIGHT_CAP) {
    return endOfDay(addDays(new Date(year, 11, 31), 14));
  }
  return null;
}

export function isForm16Overdue(
  stays: GuestStayNightInput[],
  year: number,
  now: Date = new Date()
): boolean {
  const dueBy = getForm16DueBy(stays, year);
  if (!dueBy) return false;
  return now > dueBy;
}

export function getForm17Window(year: number): { from: Date; to: Date } {
  const followingYear = year + 1;
  return {
    from: startOfDay(new Date(followingYear, 0, 1)),
    to: endOfDay(new Date(followingYear, 0, 28)),
  };
}

export function isForm17DueNow(year: number, now: Date = new Date()): boolean {
  const { from, to } = getForm17Window(year);
  return now >= from && now <= to;
}

export function isForm17Overdue(year: number, now: Date = new Date()): boolean {
  const { to } = getForm17Window(year);
  return now > to;
}

export function collectPlanningFormDueItems(
  propertyId: string,
  planningStatus: string | null | undefined,
  stays: GuestStayNightInput[],
  now: Date = new Date()
): PlanningFormDueItem[] {
  if (!isExemptPlanningStatus(planningStatus)) {
    return [];
  }

  const year = now.getFullYear();
  const items: PlanningFormDueItem[] = [];

  const form15Due = getForm15DueBy(year, stays, now);
  if (form15Due && now <= form15Due) {
    items.push({
      kind: "form_15",
      propertyId,
      year,
      dueBy: form15Due,
      sourceUrl: CITIZENS_INFO_STL_URL,
    });
  } else if (form15Due && now > form15Due) {
    items.push({
      kind: "form_15",
      propertyId,
      year,
      dueBy: form15Due,
      sourceUrl: CITIZENS_INFO_STL_URL,
    });
  }

  const nightsUsed = countRentalNightsInYear(stays, year);
  const form16Due = getForm16DueBy(stays, year);
  if (form16Due && nightsUsed >= IE_PPR_EXEMPT_NIGHT_CAP) {
    items.push({
      kind: "form_16",
      propertyId,
      year,
      dueBy: form16Due,
      sourceUrl: CITIZENS_INFO_STL_URL,
      nightsUsedInYear: nightsUsed,
    });
  }

  if (isForm17DueNow(year - 1, now) || isForm17Overdue(year - 1, now)) {
    const { to } = getForm17Window(year - 1);
    items.push({
      kind: "form_17",
      propertyId,
      year: year - 1,
      dueBy: to,
      sourceUrl: CITIZENS_INFO_STL_URL,
    });
  }

  return items;
}

export function daysUntilRegistrationDeadline(now: Date = new Date()): number {
  const ms = IE_STL_REGISTRATION_DEADLINE.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
