/**
 * eVisitor guest registration field validation.
 *
 * Field mapping (Glint GuestRecord → eVisitor):
 * - lastName → Prezime
 * - firstNames → Ime
 * - sex → Spol (M/F)
 * - dateOfBirth → Datum rođenja
 * - nationality → Državljanstvo
 * - documentType → Vrsta isprave
 * - documentNumber → Broj isprave
 * - arrivalDate → Datum dolaska
 * - departureDate → Datum odlaska
 *
 * All guests must be registered in eVisitor within 24h of arrival
 * and deregistered within 24h of departure.
 * Glint does not submit to eVisitor — validation prepares manual portal entry.
 */

export type EvisitorCheckInInput = {
  lastName: string;
  firstNames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  usualAddress: string;
  mobile: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  documentType?: string;
  documentNumber?: string;
  sex?: string;
};

const VALID_DOCUMENT_TYPES = new Set([
  "PAS",
  "IDC",
  "OTH",
  "OUT",
  "BI",
  "CC",
  "PUT",
  "VIZ",
]);

const VALID_SEX = new Set(["M", "F"]);

export type EvisitorValidationError = {
  field: string;
  message: { en: string; fr: string };
};

export function validateCheckInForEvisitor(
  input: EvisitorCheckInInput
): EvisitorValidationError[] {
  const errors: EvisitorValidationError[] = [];

  if (!input.lastName.trim()) {
    errors.push({
      field: "lastName",
      message: { en: "Last name is required", fr: "Le nom est obligatoire" },
    });
  }

  if (!input.firstNames.trim()) {
    errors.push({
      field: "firstNames",
      message: { en: "First name(s) required", fr: "Le prénom est obligatoire" },
    });
  }

  if (!input.dateOfBirth) {
    errors.push({
      field: "dateOfBirth",
      message: { en: "Date of birth required", fr: "Date de naissance obligatoire" },
    });
  }

  if (!input.nationality.trim()) {
    errors.push({
      field: "nationality",
      message: { en: "Nationality required", fr: "Nationalité obligatoire" },
    });
  }

  if (!input.documentType?.trim()) {
    errors.push({
      field: "documentType",
      message: {
        en: "Document type required (e.g. PAS, IDC)",
        fr: "Type de document obligatoire (ex. PAS, IDC)",
      },
    });
  } else if (!VALID_DOCUMENT_TYPES.has(input.documentType.trim().toUpperCase())) {
    errors.push({
      field: "documentType",
      message: {
        en: "Invalid document type — use PAS, IDC, BI, CC, or OTH",
        fr: "Type de document invalide — utilisez PAS, IDC, BI, CC ou OTH",
      },
    });
  }

  if (!input.documentNumber?.trim()) {
    errors.push({
      field: "documentNumber",
      message: { en: "Document number required", fr: "Numéro de document obligatoire" },
    });
  }

  if (!input.sex?.trim()) {
    errors.push({
      field: "sex",
      message: {
        en: "Sex (M/F) required for eVisitor",
        fr: "Sexe (M/F) obligatoire pour eVisitor",
      },
    });
  } else if (!VALID_SEX.has(input.sex.trim().toUpperCase())) {
    errors.push({
      field: "sex",
      message: { en: "Sex must be M or F", fr: "Le sexe doit être M ou F" },
    });
  }

  if (!input.arrivalDate) {
    errors.push({
      field: "arrivalDate",
      message: { en: "Arrival date required", fr: "Date d'arrivée obligatoire" },
    });
  }

  if (!input.departureDate) {
    errors.push({
      field: "departureDate",
      message: {
        en: "Departure date required",
        fr: "Date de départ obligatoire",
      },
    });
  }

  return errors;
}
