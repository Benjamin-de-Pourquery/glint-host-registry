/**
 * AADE Short-Term Stay Declaration field mapping (manual portal entry).
 * Glint collects guest data for export — does not submit to AADE.
 */

export type AadeCheckInFields = {
  lastName: string;
  firstNames: string;
  dateOfBirth: string;
  placeOfBirth?: string;
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

export type AadeValidationError = {
  field: string;
  message: { en: string; fr: string };
};

export function validateCheckInForAade(
  fields: AadeCheckInFields
): AadeValidationError[] {
  const errors: AadeValidationError[] = [];

  const required: Array<{ key: keyof AadeCheckInFields; en: string; fr: string }> = [
    { key: "lastName", en: "Last name is required", fr: "Le nom est requis" },
    { key: "firstNames", en: "First name(s) required", fr: "Le prénom est requis" },
    { key: "dateOfBirth", en: "Date of birth required", fr: "La date de naissance est requise" },
    { key: "nationality", en: "Nationality required", fr: "La nationalité est requise" },
    { key: "usualAddress", en: "Address required", fr: "L'adresse est requise" },
    { key: "mobile", en: "Mobile required", fr: "Le mobile est requis" },
    { key: "email", en: "Email required", fr: "L'e-mail est requis" },
    { key: "arrivalDate", en: "Arrival date required", fr: "La date d'arrivée est requise" },
    { key: "departureDate", en: "Departure date required", fr: "La date de départ est requise" },
    { key: "documentType", en: "Document type required", fr: "Le type de document est requis" },
    { key: "documentNumber", en: "Document number required", fr: "Le numéro de document est requis" },
    { key: "sex", en: "Sex required", fr: "Le sexe est requis" },
  ];

  for (const req of required) {
    const value = fields[req.key];
    if (!value?.trim()) {
      errors.push({
        field: req.key,
        message: { en: req.en, fr: req.fr },
      });
    }
  }

  return errors;
}
