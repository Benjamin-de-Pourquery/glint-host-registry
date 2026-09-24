import type { ParsedPlatformReservation } from "../types";
import {
  computeNights,
  findHeaderKey,
  normalizeReservationStatus,
  parseFlexibleDate,
  parseInteger,
  rowsToObjects,
  parseCsvRows,
} from "./csv-utils";

const CONFIRMATION_HEADERS = [
  "Confirmation Code",
  "Confirmation code",
  "Code de confirmation",
  "Reservation ID",
  "Reservation code",
];
const CHECK_IN_HEADERS = ["Start Date", "Check-in", "Check in", "Arrival", "Date d'arrivée", "Arrivée"];
const CHECK_OUT_HEADERS = ["End Date", "Check-out", "Check out", "Departure", "Date de départ", "Départ"];
const NIGHTS_HEADERS = ["Nights", "Nombre de nuits", "Number of nights"];
const GUESTS_HEADERS = ["Guests", "Number of guests", "Nombre de voyageurs", "Guest count"];
const STATUS_HEADERS = ["Status", "Statut", "Reservation status"];
const LISTING_HEADERS = ["Listing", "Listing name", "Annonce", "Property name"];
const AMOUNT_HEADERS = ["Earnings", "Gross earnings", "Amount", "Montant", "Payout"];

export function parseAirbnbCsv(content: string): ParsedPlatformReservation[] {
  const rows = parseCsvRows(content);
  const objects = rowsToObjects(rows);
  const results: ParsedPlatformReservation[] = [];

  for (const row of objects) {
    const confirmationKey = findHeaderKey(row, CONFIRMATION_HEADERS);
    const checkInKey = findHeaderKey(row, CHECK_IN_HEADERS);
    const checkOutKey = findHeaderKey(row, CHECK_OUT_HEADERS);
    if (!confirmationKey || !checkInKey || !checkOutKey) continue;

    const checkIn = parseFlexibleDate(row[checkInKey] ?? "");
    const checkOut = parseFlexibleDate(row[checkOutKey] ?? "");
    if (!checkIn || !checkOut) continue;

    const nightsKey = findHeaderKey(row, NIGHTS_HEADERS);
    const guestsKey = findHeaderKey(row, GUESTS_HEADERS);
    const statusKey = findHeaderKey(row, STATUS_HEADERS);
    const listingKey = findHeaderKey(row, LISTING_HEADERS);
    const amountKey = findHeaderKey(row, AMOUNT_HEADERS);

    const externalRef = (row[confirmationKey] ?? "").trim();
    if (!externalRef) continue;

    const nights = computeNights(
      checkIn,
      checkOut,
      nightsKey ? parseInteger(row[nightsKey]) : null
    );

    results.push({
      externalRef,
      listingRef: listingKey ? row[listingKey]?.trim() || null : null,
      checkIn,
      checkOut,
      nights,
      guests: guestsKey ? parseInteger(row[guestsKey]) : null,
      status: normalizeReservationStatus(statusKey ? row[statusKey] : undefined),
      grossAmountCents: null,
    });
  }

  return results.filter((r) => r.status !== "cancelled");
}
