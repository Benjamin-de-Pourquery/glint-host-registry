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

const RESERVATION_HEADERS = [
  "Reservation number",
  "Reservation Number",
  "Booking number",
  "Numéro de réservation",
  "Reservation ID",
];
const CHECK_IN_HEADERS = ["Arrival", "Check-in", "Check in", "Arrivée", "Date d'arrivée"];
const CHECK_OUT_HEADERS = ["Departure", "Check-out", "Check out", "Départ", "Date de départ"];
const NIGHTS_HEADERS = ["Nights", "Length of stay", "Nombre de nuits"];
const GUESTS_HEADERS = ["Guests", "Number of guests", "Nombre de personnes", "Adults"];
const STATUS_HEADERS = ["Status", "Statut", "Reservation status"];
const LISTING_HEADERS = ["Property name", "Room name", "Listing", "Nom de la propriété"];
const AMOUNT_HEADERS = ["Price", "Total price", "Amount", "Montant", "Commission"];

export function parseBookingCsv(content: string): ParsedPlatformReservation[] {
  const rows = parseCsvRows(content);
  const objects = rowsToObjects(rows);
  return mapBookingRows(objects);
}

export function parseBookingSheetRows(rows: string[][]): ParsedPlatformReservation[] {
  return mapBookingRows(rowsToObjects(rows));
}

function mapBookingRows(objects: Array<Record<string, string>>): ParsedPlatformReservation[] {
  const results: ParsedPlatformReservation[] = [];

  for (const row of objects) {
    const reservationKey = findHeaderKey(row, RESERVATION_HEADERS);
    const checkInKey = findHeaderKey(row, CHECK_IN_HEADERS);
    const checkOutKey = findHeaderKey(row, CHECK_OUT_HEADERS);
    if (!reservationKey || !checkInKey || !checkOutKey) continue;

    const checkIn = parseFlexibleDate(row[checkInKey] ?? "");
    const checkOut = parseFlexibleDate(row[checkOutKey] ?? "");
    if (!checkIn || !checkOut) continue;

    const nightsKey = findHeaderKey(row, NIGHTS_HEADERS);
    const guestsKey = findHeaderKey(row, GUESTS_HEADERS);
    const statusKey = findHeaderKey(row, STATUS_HEADERS);
    const listingKey = findHeaderKey(row, LISTING_HEADERS);

    const externalRef = (row[reservationKey] ?? "").trim();
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
