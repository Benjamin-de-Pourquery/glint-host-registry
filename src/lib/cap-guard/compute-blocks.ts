import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
} from "date-fns";
import {
  countStayNightsInYear,
  shouldCountStayForNightCap,
  type GuestStayNightInput,
  type NightCapComputation,
} from "@/lib/france/night-cap";
import type {
  BudgetWindow,
  CapGuardBlockResult,
  CapGuardComputeInput,
  CapGuardForecast,
  CapGuardMode,
  CapGuardPolicyInput,
  DateRange,
} from "./types";

function dateKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) {
    return startOfDay(value);
  }
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

function parseDateKey(key: string): Date {
  return parseLocalDate(key);
}

export function parseBudgetWindows(json: string): BudgetWindow[] {
  try {
    const parsed = JSON.parse(json) as BudgetWindow[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (window) =>
        typeof window.start === "string" &&
        typeof window.end === "string" &&
        typeof window.allocatedNights === "number" &&
        window.allocatedNights >= 0
    );
  } catch {
    return [];
  }
}

export function serializeBudgetWindows(windows: BudgetWindow[]): string {
  return JSON.stringify(windows);
}

function getBookedNightKeys(
  stays: GuestStayNightInput[],
  year: number
): Set<string> {
  const keys = new Set<string>();
  for (const stay of stays) {
    if (!shouldCountStayForNightCap(stay.importStatus)) continue;
    const checkIn = startOfDay(new Date(stay.checkInDate));
    const checkOut = startOfDay(new Date(stay.checkOutDate));
    let cursor = checkIn;
    while (cursor < checkOut) {
      if (cursor.getFullYear() === year) {
        keys.add(dateKey(cursor));
      }
      cursor = addDays(cursor, 1);
    }
  }
  return keys;
}

function yearEnd(year: number): Date {
  return startOfDay(new Date(year, 11, 31));
}

function isDateInWindow(day: Date, window: BudgetWindow): boolean {
  const start = parseLocalDate(window.start);
  const end = parseLocalDate(window.end);
  const value = startOfDay(day);
  return value >= start && value <= end;
}

function countBookedNightsInWindow(
  stays: GuestStayNightInput[],
  window: BudgetWindow,
  year: number
): number {
  const start = parseLocalDate(window.start);
  const end = parseLocalDate(window.end);
  let total = 0;
  for (const stay of stays) {
    if (!shouldCountStayForNightCap(stay.importStatus)) continue;
    const checkIn = startOfDay(new Date(stay.checkInDate));
    const checkOut = startOfDay(new Date(stay.checkOutDate));
    const effectiveStart = checkIn < start ? start : checkIn;
    const effectiveEnd = checkOut > addDays(end, 1) ? addDays(end, 1) : checkOut;
    if (effectiveEnd <= effectiveStart) continue;
    total += countStayNightsInYear(effectiveStart, effectiveEnd, year);
  }
  return total;
}

function mergeDateRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  const merged: DateRange[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    const lastEndExclusive = addDays(last.end, 1);
    if (current.start.getTime() <= lastEndExclusive.getTime()) {
      if (current.end > last.end) {
        last.end = current.end;
      }
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

function keysToRanges(keys: string[]): DateRange[] {
  if (keys.length === 0) return [];
  const sorted = [...keys].sort();
  const ranges: DateRange[] = [];
  let rangeStart = parseDateKey(sorted[0]);
  let rangeEnd = rangeStart;

  for (let i = 1; i < sorted.length; i++) {
    const day = parseDateKey(sorted[i]);
    const expectedNext = addDays(rangeEnd, 1);
    if (day.getTime() === expectedNext.getTime()) {
      rangeEnd = day;
      continue;
    }
    ranges.push({ start: rangeStart, end: rangeEnd });
    rangeStart = day;
    rangeEnd = day;
  }
  ranges.push({ start: rangeStart, end: rangeEnd });
  return ranges;
}

function shouldCloseForMode(
  mode: CapGuardMode,
  remaining: number,
  bufferNights: number
): boolean {
  if (mode === "HARD_STOP") return remaining <= 0;
  if (mode === "BUFFER") return remaining < bufferNights;
  return true;
}

function shouldCloseBudgetDay(
  day: Date,
  stays: GuestStayNightInput[],
  windows: BudgetWindow[],
  year: number
): boolean {
  const matchingWindows = windows.filter((window) => isDateInWindow(day, window));
  if (matchingWindows.length === 0) {
    return true;
  }
  return matchingWindows.every((window) => {
    const booked = countBookedNightsInWindow(stays, window, year);
    return booked >= window.allocatedNights;
  });
}

function collectClosedKeys(input: CapGuardComputeInput): {
  keys: Set<string>;
  triggerReason: CapGuardBlockResult["triggerReason"];
} {
  const { stays, capComputation, policy, today, registrationExpiry } = input;
  const closed = new Set<string>();
  let triggerReason: CapGuardBlockResult["triggerReason"] = "none";

  if (!policy.enabled || !capComputation.enabled) {
    return { keys: closed, triggerReason };
  }

  const year = capComputation.year;
  const booked = getBookedNightKeys(stays, year);
  const from = startOfDay(today);
  const to = yearEnd(year);
  const modeActive = shouldCloseForMode(
    policy.mode,
    capComputation.remaining,
    policy.bufferNights
  );

  if (modeActive && policy.mode !== "BUDGET") {
    triggerReason = policy.mode === "HARD_STOP" ? "hard_stop" : "buffer";
  } else if (policy.mode === "BUDGET") {
    triggerReason = "budget";
  }

  let cursor = from;
  while (cursor <= to) {
    const key = dateKey(cursor);
    if (booked.has(key)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    let close = false;

    if (
      policy.registrationGate &&
      registrationExpiry &&
      cursor > startOfDay(registrationExpiry)
    ) {
      close = true;
      triggerReason = "registration";
    } else if (policy.mode === "BUDGET" && modeActive) {
      close = shouldCloseBudgetDay(cursor, stays, policy.budgetWindows, year);
    } else if (modeActive) {
      close = true;
    }

    if (close) {
      closed.add(key);
    }
    cursor = addDays(cursor, 1);
  }

  return { keys: closed, triggerReason };
}

export function computeGuardBlocks(
  stays: GuestStayNightInput[],
  capComputation: NightCapComputation,
  policy: CapGuardPolicyInput,
  today: Date = new Date(),
  registrationExpiry?: Date | null
): DateRange[] {
  const { keys } = collectClosedKeys({
    stays,
    capComputation,
    policy,
    today,
    registrationExpiry,
  });
  return keysToRanges([...keys]);
}

export function computeGuardBlockResult(
  input: CapGuardComputeInput
): CapGuardBlockResult {
  const blocks = computeGuardBlocks(
    input.stays,
    input.capComputation,
    input.policy,
    input.today,
    input.registrationExpiry
  );
  const { triggerReason } = collectClosedKeys(input);
  return {
    blocks,
    shouldPublish: input.policy.enabled && blocks.length > 0,
    triggerReason,
  };
}

export function countFutureBookedNights(
  stays: GuestStayNightInput[],
  year: number,
  today: Date = new Date()
): number {
  const todayStart = startOfDay(today);
  let total = 0;
  for (const stay of stays) {
    if (!shouldCountStayForNightCap(stay.importStatus)) continue;
    const checkIn = startOfDay(new Date(stay.checkInDate));
    const checkOut = startOfDay(new Date(stay.checkOutDate));
    if (checkOut <= todayStart) continue;
    const effectiveStart = checkIn < todayStart ? todayStart : checkIn;
    total += countStayNightsInYear(effectiveStart, checkOut, year);
  }
  return total;
}

export function computeCapGuardForecast(
  stays: GuestStayNightInput[],
  capComputation: NightCapComputation,
  today: Date = new Date()
): CapGuardForecast {
  const bookedAhead = countFutureBookedNights(
    stays,
    capComputation.year,
    today
  );
  const dayOfYear =
    differenceInCalendarDays(startOfDay(today), startOfDay(new Date(capComputation.year, 0, 1))) +
    1;
  const pace = dayOfYear > 0 ? capComputation.nightsUsed / dayOfYear : 0;
  let projectedCapDate: string | null = null;

  if (pace > 0 && capComputation.remaining > 0) {
    const daysUntilCap = Math.ceil(capComputation.remaining / pace);
    projectedCapDate = format(addDays(startOfDay(today), daysUntilCap), "yyyy-MM-dd");
  } else if (capComputation.remaining <= 0) {
    projectedCapDate = format(startOfDay(today), "yyyy-MM-dd");
  }

  return {
    nightsUsed: capComputation.nightsUsed,
    bookedAhead,
    remaining: capComputation.remaining,
    projectedCapDate,
  };
}

export function suggestBufferNights(channelCount: number): number {
  const typicalStayLength = 3;
  const channels = Math.max(1, channelCount);
  return typicalStayLength * channels;
}
