import { toAlpha3Nationality } from "./nationality";

const VALID_DOC_TYPES = new Set(["NIF", "NIE", "PAS", "OTRO", "CIF"]);
const VALID_SEX = new Set(["H", "M", "O"]);
const VALID_KINSHIP = new Set(["AB", "BA", "HI", "OT", "CY", "SG", "OTR"]);

export type CheckInSesInput = {
  lastName: string;
  firstNames: string;
  dateOfBirth: string;
  nationality: string;
  usualAddress: string;
  mobile: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  documentType?: string;
  documentNumber?: string;
  documentSupport?: string;
  sex?: string;
  kinship?: string;
  postalCode?: string;
  municipalityCode?: string;
  municipalityName?: string;
  addressCountryAlpha3?: string;
};

export type CheckInValidationError = {
  field: string;
  message: { en: string; fr: string };
};

function err(field: string, en: string, fr: string): CheckInValidationError {
  return { field, message: { en, fr } };
}

function ageFromDob(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 18;
  return (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

function requiresDocumentSupport(documentType: string): boolean {
  const type = documentType.trim().toUpperCase();
  return type === "NIF" || type === "NIE";
}

/** Validates Annex I fields for Spain SES check-in (mirrors validateGuestForSes rules). */
export function validateCheckInForSes(input: CheckInSesInput): CheckInValidationError[] {
  const errors: CheckInValidationError[] = [];

  if (!input.lastName?.trim()) {
    errors.push(err("lastName", "Last name is required", "Le nom est obligatoire"));
  }
  if (!input.firstNames?.trim()) {
    errors.push(err("firstNames", "First name is required", "Le prénom est obligatoire"));
  }
  if (!input.dateOfBirth?.trim()) {
    errors.push(err("dateOfBirth", "Date of birth is required", "La date de naissance est obligatoire"));
  }
  if (!toAlpha3Nationality(input.nationality)) {
    errors.push(
      err(
        "nationality",
        "Nationality must be a recognized country name or ISO code",
        "La nationalité doit être un nom de pays ou un code ISO reconnu"
      )
    );
  }
  if (!input.usualAddress?.trim()) {
    errors.push(err("usualAddress", "Address is required", "L'adresse est obligatoire"));
  }
  if (!input.mobile?.trim() && !input.email?.trim()) {
    errors.push(
      err("contact", "Phone or email is required", "Le téléphone ou l'e-mail est obligatoire")
    );
  }
  if (!input.arrivalDate?.trim() || !input.departureDate?.trim()) {
    errors.push(
      err(
        "dates",
        "Arrival and departure dates are required",
        "Les dates d'arrivée et de départ sont obligatoires"
      )
    );
  }

  const age = ageFromDob(input.dateOfBirth);
  const isAdult = age >= 18;

  if (isAdult) {
    const docType = input.documentType?.trim().toUpperCase() ?? "";
    if (!docType) {
      errors.push(
        err(
          "documentType",
          "Document type is required (NIF, NIE, PAS, OTRO)",
          "Le type de document est obligatoire (NIF, NIE, PAS, OTRO)"
        )
      );
    } else if (!VALID_DOC_TYPES.has(docType)) {
      errors.push(err("documentType", "Invalid document type", "Type de document invalide"));
    }

    if (!input.documentNumber?.trim()) {
      errors.push(
        err(
          "documentNumber",
          "Document number is required",
          "Le numéro de document est obligatoire"
        )
      );
    }

    if (docType && requiresDocumentSupport(docType) && !input.documentSupport?.trim()) {
      errors.push(
        err(
          "documentSupport",
          "Document support number is required for NIF/NIE",
          "Le numéro de support est obligatoire pour NIF/NIE"
        )
      );
    }

    if (!input.sex?.trim()) {
      errors.push(err("sex", "Sex is required (H/M/O)", "Le sexe est obligatoire (H/M/O)"));
    } else if (!VALID_SEX.has(input.sex.trim().toUpperCase())) {
      errors.push(err("sex", "Sex must be H, M, or O", "Le sexe doit être H, M ou O"));
    }
  } else if (input.kinship?.trim() && !VALID_KINSHIP.has(input.kinship.trim().toUpperCase())) {
    errors.push(err("kinship", "Invalid kinship code", "Code de parenté invalide"));
  }

  if (!input.postalCode?.trim()) {
    errors.push(
      err(
        "postalCode",
        "Postal code is required",
        "Le code postal est obligatoire"
      )
    );
  }

  const countryAlpha3 =
    input.addressCountryAlpha3?.trim().toUpperCase() ||
    toAlpha3Nationality(input.nationality);

  if (!countryAlpha3) {
    errors.push(
      err(
        "addressCountryAlpha3",
        "Country of residence is required (ISO alpha-3 or nationality)",
        "Le pays de résidence est obligatoire (code ISO alpha-3 ou nationalité)"
      )
    );
  }

  if (countryAlpha3 === "ESP" && !input.municipalityCode?.trim() && !input.municipalityName?.trim()) {
    errors.push(
      err(
        "municipality",
        "Municipality code (Spain) or name (abroad) is required",
        "Le code municipal (Espagne) ou le nom de la commune (étranger) est obligatoire"
      )
    );
  }

  return errors;
}
