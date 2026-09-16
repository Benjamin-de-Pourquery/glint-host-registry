/**
 * Alloggiati Web guest schedule field validation.
 *
 * Field mapping (Glint GuestRecord → Alloggiati Web schedina):
 * - lastName → Cognome
 * - firstNames → Nome
 * - sex → Sesso (M/F)
 * - dateOfBirth → Data nascita (dd/mm/yyyy on portal)
 * - placeOfBirth → Comune/Stato nascita
 * - nationality → Cittadinanza (ISO alpha-3 or country name)
 * - documentType → Tipo documento (PAS=passport, CI=identity card, PAT=driving licence, etc.)
 * - documentNumber → Numero documento
 * - arrivalDate → Data arrivo
 * - departureDate → Data partenza (optional on some forms; collected for ops)
 * - usualAddress + postalCode + municipalityName → Domicilio abituale
 * - mobile → Telefono (optional on portal but useful for host records)
 *
 * Glint does not submit to Alloggiati Web — validation prepares manual portal entry.
 */

export type AlloggiatiCheckInInput = {
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
  postalCode?: string;
  municipalityName?: string;
  addressCountryAlpha3?: string;
};

const VALID_DOCUMENT_TYPES = new Set([
  "PAS",
  "CI",
  "PAT",
  "NIF",
  "NIE",
  "IDC",
  "OTH",
]);

const VALID_SEX = new Set(["M", "F"]);

export type AlloggiatiValidationError = {
  field: string;
  message: { en: string; fr: string };
};

export function validateCheckInForAlloggiati(
  input: AlloggiatiCheckInInput
): AlloggiatiValidationError[] {
  const errors: AlloggiatiValidationError[] = [];

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

  if (!input.placeOfBirth.trim()) {
    errors.push({
      field: "placeOfBirth",
      message: {
        en: "Place of birth required (comune or country)",
        fr: "Lieu de naissance obligatoire",
      },
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
        en: "Document type required (e.g. PAS, CI)",
        fr: "Type de document obligatoire (ex. PAS, CI)",
      },
    });
  } else if (!VALID_DOCUMENT_TYPES.has(input.documentType.trim().toUpperCase())) {
    errors.push({
      field: "documentType",
      message: {
        en: "Invalid document type — use PAS, CI, PAT, IDC, or OTH",
        fr: "Type de document invalide — utilisez PAS, CI, PAT, IDC ou OTH",
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
      message: { en: "Sex (M/F) required for Alloggiati", fr: "Sexe (M/F) obligatoire pour Alloggiati" },
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

  if (!input.usualAddress.trim()) {
    errors.push({
      field: "usualAddress",
      message: { en: "Usual address required", fr: "Adresse habituelle obligatoire" },
    });
  }

  return errors;
}
