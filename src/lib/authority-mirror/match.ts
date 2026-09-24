import { differenceInCalendarDays } from "date-fns";
import { channelsMatch } from "./channels";

const DATE_TOLERANCE_DAYS = 1;

export type MatchableStay = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  source: string;
  channel?: string;
  importStatus?: string | null;
};

export type MatchableReservation = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  channel: string;
  status: string;
};

export function datesWithinTolerance(a: Date, b: Date, toleranceDays = DATE_TOLERANCE_DAYS): boolean {
  return Math.abs(differenceInCalendarDays(a, b)) <= toleranceDays;
}

export function stayChannel(stay: MatchableStay): string {
  return stay.channel ?? stay.source;
}

export function isActiveStay(stay: MatchableStay): boolean {
  if (!stay.importStatus) return true;
  return stay.importStatus === "active";
}

export function isActiveReservation(reservation: MatchableReservation): boolean {
  return reservation.status !== "cancelled" && reservation.status !== "removed";
}

export function reservationsMatchStay(
  reservation: MatchableReservation,
  stay: MatchableStay
): boolean {
  if (!isActiveReservation(reservation) || !isActiveStay(stay)) {
    return false;
  }
  if (!channelsMatch(reservation.channel, stayChannel(stay))) {
    return false;
  }
  return (
    datesWithinTolerance(reservation.checkIn, stay.checkIn) &&
    datesWithinTolerance(reservation.checkOut, stay.checkOut)
  );
}

export function matchReservationsToStays(
  reservations: MatchableReservation[],
  stays: MatchableStay[]
): Map<string, string> {
  const matches = new Map<string, string>();
  const usedStayIds = new Set<string>();

  for (const reservation of reservations) {
    if (!isActiveReservation(reservation)) continue;

    const candidate = stays.find(
      (stay) =>
        !usedStayIds.has(stay.id) &&
        reservationsMatchStay(reservation, stay)
    );

    if (candidate) {
      matches.set(reservation.id, candidate.id);
      usedStayIds.add(candidate.id);
    }
  }

  return matches;
}
