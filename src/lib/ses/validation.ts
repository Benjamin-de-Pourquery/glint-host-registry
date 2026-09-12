import type { SesGuestInput, SesStayInput, SesValidationError } from "./types";
import { toAlpha3Nationality } from "./nationality";

const VALID_DOC_TYPES = new Set(["NIF", "NIE", "PAS", "OTRO", "CIF"]);
const VALID_SEX = new Set(["H", "M", "O"]);

function err(
  field: string,
  en: string,
  fr: string,
  recordId?: string
): SesValidationError {
  return { field, message: { en, fr }, recordId };
}

export function validateGuestForSes(guest: SesGuestInput): SesValidationError[] {
  const errors: SesValidationError[] = [];

  if (!guest.lastName?.trim()) {
    errors.push(err("lastName", "Last name is required", "Le nom est obligatoire", guest.recordId));
  }
  if (!guest.firstNames?.trim()) {
    errors.push(err("firstNames", "First name is required", "Le prénom est obligatoire", guest.recordId));
  }
  if (!guest.dateOfBirth) {
    errors.push(err("dateOfBirth", "Date of birth is required", "La date de naissance est obligatoire", guest.recordId));
  }
  if (!toAlpha3Nationality(guest.nationality, guest.nationalityAlpha3)) {
    errors.push(
      err(
        "nationality",
        "Nationality must be a valid ISO 3166-1 alpha-3 code or recognized country name",
        "La nationalité doit être un code ISO 3166-1 alpha-3 ou un nom de pays reconnu",
        guest.recordId
      )
    );
  }
  if (!guest.usualAddress?.trim()) {
    errors.push(err("usualAddress", "Address is required", "L'adresse est obligatoire", guest.recordId));
  }
  if (!guest.mobile?.trim() && !guest.email?.trim()) {
    errors.push(
      err(
        "contact",
        "Phone or email is required",
        "Le téléphone ou l'e-mail est obligatoire",
        guest.recordId
      )
    );
  }
  if (!guest.arrivalDate || !guest.departureDate) {
    errors.push(
      err(
        "dates",
        "Arrival and departure dates are required",
        "Les dates d'arrivée et de départ sont obligatoires",
        guest.recordId
      )
    );
  }

  const age = guest.dateOfBirth
    ? (Date.now() - guest.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    : 18;
  const isAdult = age >= 18;

  if (isAdult) {
    if (!guest.documentType?.trim()) {
      errors.push(
        err(
          "documentType",
          "Document type is required for adults (NIF, NIE, PAS, OTRO)",
          "Le type de document est obligatoire pour les adultes (NIF, NIE, PAS, OTRO)",
          guest.recordId
        )
      );
    } else if (!VALID_DOC_TYPES.has(guest.documentType.trim().toUpperCase())) {
      errors.push(
        err(
          "documentType",
          "Invalid document type",
          "Type de document invalide",
          guest.recordId
        )
      );
    }
    if (!guest.documentNumber?.trim()) {
      errors.push(
        err(
          "documentNumber",
          "Document number is required for adults",
          "Le numéro de document est obligatoire pour les adultes",
          guest.recordId
        )
      );
    }
  }

  if (guest.sex?.trim() && !VALID_SEX.has(guest.sex.trim().toUpperCase())) {
    errors.push(err("sex", "Sex must be H, M, or O", "Le sexe doit être H, M ou O", guest.recordId));
  }

  if (!guest.postalCode?.trim()) {
    errors.push(
      err(
        "postalCode",
        "Postal code is required for SES address",
        "Le code postal est obligatoire pour l'adresse SES",
        guest.recordId
      )
    );
  }

  const countryAlpha3 =
    guest.addressCountryAlpha3?.trim().toUpperCase() ||
    toAlpha3Nationality(guest.nationality, guest.nationalityAlpha3);
  if (countryAlpha3 === "ESP" && !guest.municipalityCode?.trim() && !guest.municipalityName?.trim()) {
    errors.push(
      err(
        "municipality",
        "Municipality code (Spain) or name (abroad) is required",
        "Le code municipal (Espagne) ou le nom de la commune (étranger) est obligatoire",
        guest.recordId
      )
    );
  }

  return errors;
}

export function validateStayForSes(stay: SesStayInput): SesValidationError[] {
  const errors: SesValidationError[] = [];

  if (!stay.guests.length) {
    errors.push(err("guests", "At least one guest is required", "Au moins un voyageur est requis"));
  }
  if (!stay.contractReference?.trim()) {
    errors.push(err("contractReference", "Contract reference is required", "La référence du contrat est obligatoire"));
  }

  for (const guest of stay.guests) {
    errors.push(...validateGuestForSes(guest));
  }

  return errors;
}
