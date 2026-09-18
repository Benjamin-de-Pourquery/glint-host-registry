/**
 * SIBA Boletim de Alojamento field validation.
 *
 * Field mapping (Glint GuestRecord → SIBA boletim):
 * - lastName → Apelido
 * - firstNames → Nome(s)
 * - sex → Sexo (M/F)
 * - dateOfBirth → Data de nascimento
 * - placeOfBirth → Local de nascimento
 * - nationality → Nacionalidade (not PT — Portuguese nationals are not reported to SIBA)
 * - documentType → Tipo de documento (PAS, BI, CC, OUT)
 * - documentNumber → Número do documento
 * - arrivalDate → Data de entrada
 * - departureDate → Data de saída prevista
 * - usualAddress → Morada habitual (optional on portal but collected for ops)
 * - mobile → Telefone (optional)
 *
 * Glint does not submit to SIBA — validation prepares manual portal entry.
 * Portuguese nationals: SIBA fields not required (optional ops log only).
 */

import { isPortugueseNationality } from "./nationality";

export type SibaCheckInInput = {
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

const VALID_DOCUMENT_TYPES = new Set(["PAS", "BI", "CC", "IDC", "OUT", "OTH"]);

const VALID_SEX = new Set(["M", "F"]);

export type SibaValidationError = {
  field: string;
  message: { en: string; fr: string };
};

export function validateCheckInForSiba(
  input: SibaCheckInInput
): SibaValidationError[] {
  if (isPortugueseNationality(input.nationality)) {
    return [];
  }

  const errors: SibaValidationError[] = [];

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
        en: "Place of birth required",
        fr: "Lieu de naissance obligatoire",
      },
    });
  }

  if (!input.nationality.trim()) {
    errors.push({
      field: "nationality",
      message: { en: "Nationality required", fr: "Nationalité obligatoire" },
    });
  } else if (isPortugueseNationality(input.nationality)) {
    errors.push({
      field: "nationality",
      message: {
        en: "Portuguese nationals are not reported to SIBA",
        fr: "Les ressortissants portugais ne sont pas déclarés au SIBA",
      },
    });
  }

  if (!input.documentType?.trim()) {
    errors.push({
      field: "documentType",
      message: {
        en: "Document type required (e.g. PAS, BI)",
        fr: "Type de document obligatoire (ex. PAS, BI)",
      },
    });
  } else if (!VALID_DOCUMENT_TYPES.has(input.documentType.trim().toUpperCase())) {
    errors.push({
      field: "documentType",
      message: {
        en: "Invalid document type — use PAS, BI, CC, IDC, or OUT",
        fr: "Type de document invalide — utilisez PAS, BI, CC, IDC ou OUT",
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
      message: { en: "Sex (M/F) required for SIBA", fr: "Sexe (M/F) obligatoire pour SIBA" },
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
        en: "Planned departure date required",
        fr: "Date de départ prévue obligatoire",
      },
    });
  }

  return errors;
}
