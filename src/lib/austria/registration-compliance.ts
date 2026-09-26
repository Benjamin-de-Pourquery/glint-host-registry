import {
  getAustriaFederalState,
  isAustriaCountry,
  type AustriaFederalState,
} from "./regions";

export type AustriaRegistration = {
  atRegistrationNumber?: string | null;
  atRegistrationStatus?: string | null;
  atRegistrationDisplayedOnListings?: boolean;
  atFederalState?: string | null;
  atOperatorCategory?: string | null;
  atDossierPreparedAt?: Date | string | null;
  atTransitionDeadline?: Date | string | null;
};

export function hasAtRegistrationNumber(
  registration: AustriaRegistration | null | undefined
): boolean {
  return Boolean(registration?.atRegistrationNumber?.trim());
}

export function isAtDossierPrepared(
  registration: AustriaRegistration | null | undefined
): boolean {
  return Boolean(registration?.atDossierPreparedAt);
}

export function needsAustriaRegistrationAttention(
  country: string,
  registration: AustriaRegistration | null | undefined,
  city?: string
): boolean {
  if (!isAustriaCountry(country)) return false;
  if (!registration) return true;

  const state: AustriaFederalState =
    (registration.atFederalState as AustriaFederalState | null | undefined) ??
    (city ? getAustriaFederalState(city) : "unknown");

  if (!state || state === "unknown") return true;

  if (!isAtDossierPrepared(registration)) return true;

  const hasNumber = hasAtRegistrationNumber(registration);
  const registrationActive =
    registration.atRegistrationStatus === "active" || hasNumber;

  if (!registrationActive) return true;

  if (!registration.atRegistrationDisplayedOnListings) return true;

  if (
    registration.atRegistrationStatus === "expired" ||
    registration.atRegistrationStatus === "dossier_in_progress"
  ) {
    return true;
  }

  return false;
}
