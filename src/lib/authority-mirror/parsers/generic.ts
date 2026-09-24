import type { ColumnMapping, ParsedPlatformReservation } from "../types";
import {
  computeNights,
  normalizeReservationStatus,
  parseAmountCents,
  parseFlexibleDate,
  parseInteger,
  rowsToObjects,
  parseCsvRows,
} from "./csv-utils";

export const GENERIC_COLUMN_FIELDS = [
  "externalRef",
  "listingRef",
  "checkIn",
  "checkOut",
  "nights",
  "guests",
  "status",
  "grossAmount",
] as const;

export function parseGenericCsv(
  content: string,
  mapping: ColumnMapping
): ParsedPlatformReservation[] {
  const rows = parseCsvRows(content);
  const objects = rowsToObjects(rows);
  const results: ParsedPlatformReservation[] = [];

  if (!mapping.externalRef || !mapping.checkIn || !mapping.checkOut) {
    return [];
  }

  for (let index = 0; index < objects.length; index += 1) {
    const row = objects[index];
    const checkIn = parseFlexibleDate(row[mapping.checkIn] ?? "");
    const checkOut = parseFlexibleDate(row[mapping.checkOut] ?? "");
    if (!checkIn || !checkOut) continue;

    const externalRef = (row[mapping.externalRef] ?? "").trim();
    const ref = externalRef || `generic-${checkIn.toISOString().slice(0, 10)}-${index}`;

    const nights = computeNights(
      checkIn,
      checkOut,
      mapping.nights ? parseInteger(row[mapping.nights]) : null
    );

    results.push({
      externalRef: ref,
      listingRef: mapping.listingRef ? row[mapping.listingRef]?.trim() || null : null,
      checkIn,
      checkOut,
      nights,
      guests: mapping.guests ? parseInteger(row[mapping.guests]) : null,
      status: normalizeReservationStatus(mapping.status ? row[mapping.status] : undefined),
      grossAmountCents: mapping.grossAmount
        ? parseAmountCents(row[mapping.grossAmount])
        : null,
    });
  }

  return results.filter((r) => r.status !== "cancelled");
}

export function detectCsvHeaders(content: string): string[] {
  const rows = parseCsvRows(content);
  if (rows.length === 0) return [];
  return rows[0].map((h) => h.trim()).filter(Boolean);
}
