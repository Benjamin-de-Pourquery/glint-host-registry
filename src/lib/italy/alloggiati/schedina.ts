/**
 * 168-character fixed-width schedina lines per CREAFILE.pdf / MANUALEWS.pdf.
 * @see ALLOGGIATI_CREAFILE_MANUAL_URL
 */

import { differenceInCalendarDays, format } from "date-fns";
import type { AlloggiatiGuestRecord } from "@/lib/italy/export";

export const SCHEDINA_LINE_LENGTH = 168;

/** Ospite Singolo — Tipi_Alloggiato table (MANUALEWS §4). */
export const TIPO_ALLOGGIATO_OSPITE_SINGOLO = "16";

const GLINT_TO_ALLOGGIATI_DOCUMENT: Record<string, string> = {
  PAS: "PASOR",
  CI: "IDENT",
  PAT: "PATEN",
  IDC: "IDENT",
  NIF: "ALTRO",
  NIE: "ALTRO",
  OTH: "ALTRO",
};

export type SchedinaBuildInput = {
  guest: AlloggiatiGuestRecord;
  tipoAlloggiato?: string;
};

function fixedWidth(value: string, length: number): string {
  const trimmed = value.trim();
  if (trimmed.length >= length) {
    return trimmed.slice(0, length);
  }
  return trimmed.padEnd(length, " ");
}

function formatItalianDate(date: Date): string {
  return format(date, "dd/MM/yyyy");
}

function mapSex(sex: string | null): string {
  const normalized = sex?.trim().toUpperCase();
  if (normalized === "F") return "2";
  return "1";
}

function mapDocumentType(documentType: string | null): string {
  const key = documentType?.trim().toUpperCase() ?? "";
  const mapped = GLINT_TO_ALLOGGIATI_DOCUMENT[key] ?? key;
  return fixedWidth(mapped, 5);
}

function daysOfStay(arrival: Date, departure: Date): string {
  const days = Math.max(1, differenceInCalendarDays(departure, arrival));
  return String(Math.min(30, days)).padStart(2, "0");
}

function stateOrMunicipalityCode(
  code: string | null | undefined,
  fallback: string | null | undefined
): string {
  const raw = (code ?? fallback ?? "").trim();
  return fixedWidth(raw, 9);
}

/**
 * Build one 168-char schedina line for Test/Send SOAP (Ospite Singolo default).
 */
export function buildSchedinaLine(input: SchedinaBuildInput): string {
  const { guest, tipoAlloggiato = TIPO_ALLOGGIATO_OSPITE_SINGOLO } = input;

  const line =
    fixedWidth(tipoAlloggiato, 2) +
    fixedWidth(formatItalianDate(guest.arrivalDate), 10) +
    daysOfStay(guest.arrivalDate, guest.departureDate) +
    fixedWidth(guest.lastName, 50) +
    fixedWidth(guest.firstNames, 30) +
    mapSex(guest.sex) +
    fixedWidth(formatItalianDate(guest.dateOfBirth), 10) +
    stateOrMunicipalityCode(guest.municipalityName, guest.placeOfBirth) +
    fixedWidth("", 2) +
    stateOrMunicipalityCode(guest.addressCountryAlpha3, guest.placeOfBirth) +
    stateOrMunicipalityCode(guest.addressCountryAlpha3, guest.nationality) +
    mapDocumentType(guest.documentType) +
    fixedWidth(guest.documentNumber ?? "", 20) +
    stateOrMunicipalityCode(guest.municipalityName, guest.addressCountryAlpha3);

  if (line.length !== SCHEDINA_LINE_LENGTH) {
    throw new Error(`Schedina length ${line.length} !== ${SCHEDINA_LINE_LENGTH}`);
  }

  return line;
}

export function buildSchedineLines(guests: AlloggiatiGuestRecord[]): string[] {
  return guests.map((guest) => buildSchedinaLine({ guest }));
}

export function validateSchedinaLine(line: string): boolean {
  return line.length === SCHEDINA_LINE_LENGTH;
}
