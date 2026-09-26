import { resolvePlaybook } from "@/lib/playbooks";

export type RegistrationFields = {
  registrationNumber?: string | null;
  nationalRegistrationNumber?: string | null;
  cinNumber?: string | null;
  rnalNumber?: string | null;
  amaNumber?: string | null;
  greeceRegistrationKind?: string | null;
  greeceAlternateLicenseNumber?: string | null;
  nlRegistrationNumber?: string | null;
  beRegistrationNumber?: string | null;
  atRegistrationNumber?: string | null;
  nlHolidayPermitExpiry?: Date | null;
  expiryDate?: Date | null;
};

/** Mirrors listing truth card priority in PropertyListingsForm. */
export function resolvePrimaryRegistrationNumber(
  registration: RegistrationFields | null | undefined
): string | null {
  if (!registration) return null;

  const greeceNer =
    registration.greeceRegistrationKind === "esl" ||
    registration.greeceRegistrationKind === "unique_notification"
      ? registration.greeceAlternateLicenseNumber?.trim()
      : registration.amaNumber?.trim();

  const value =
    registration.nationalRegistrationNumber?.trim() ||
    registration.nlRegistrationNumber?.trim() ||
    registration.beRegistrationNumber?.trim() ||
    registration.atRegistrationNumber?.trim() ||
    greeceNer ||
    registration.rnalNumber?.trim() ||
    registration.cinNumber?.trim() ||
    registration.registrationNumber?.trim() ||
    "";

  return value || null;
}

/** Local playbook presence implies a registration number is expected for this unit. */
export function isRegistrationRequiredByPlaybook(country: string, city: string): boolean {
  return resolvePlaybook(country, city) !== null;
}

export function resolveEffectiveExpiryDate(
  registration: RegistrationFields | null | undefined
): Date | null {
  if (!registration) return null;
  if (registration.expiryDate) return registration.expiryDate;
  if (registration.nlHolidayPermitExpiry) return registration.nlHolidayPermitExpiry;
  return null;
}
