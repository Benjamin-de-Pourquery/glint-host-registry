import {
  getGermanyFederalState,
  isBerlinBezirk,
  isGermanyCountry,
  isMunichCity,
  isMunichRentalUnitType,
  resolveGermanyFederalStateForProperty,
  type GermanyFederalState,
} from "./regions";

export type GermanyRegistration = {
  deRegistrationNumber?: string | null;
  deRegistrationStatus?: string | null;
  deRegistrationDisplayedOnListings?: boolean;
  deFederalState?: string | null;
  deCityOrDistrict?: string | null;
  deOperatorCategory?: string | null;
  dePermitType?: string | null;
  deDossierPreparedAt?: Date | string | null;
  deTransitionDeadline?: Date | string | null;
  deRegistrationHolderName?: string | null;
  deRegistrationHolderType?: string | null;
  deHostChangeFlagged?: boolean;
  deMonteurKitChecklistJson?: string | null;
  deCompanyAgreementChecklistJson?: string | null;
};

export function hasDeRegistrationNumber(
  registration: GermanyRegistration | null | undefined
): boolean {
  return Boolean(registration?.deRegistrationNumber?.trim());
}

export function isDeDossierPrepared(
  registration: GermanyRegistration | null | undefined
): boolean {
  return Boolean(registration?.deDossierPreparedAt);
}

export function isDeLocationComplete(
  registration: GermanyRegistration | null | undefined,
  city?: string
): boolean {
  const state: GermanyFederalState =
    (registration?.deFederalState as GermanyFederalState | null | undefined) ??
    (city ? getGermanyFederalState(city) : "unknown");

  if (!state || state === "unknown") return false;
  if (state === "berlin") {
    return isBerlinBezirk(registration?.deCityOrDistrict);
  }
  if (state === "bayern") {
    const munichContext = city ? isMunichCity(city) : false;
    if (munichContext) {
      return isMunichRentalUnitType(registration?.deCityOrDistrict);
    }
    return true;
  }
  return true;
}

export function isDeOperatorProfileComplete(
  registration: GermanyRegistration | null | undefined
): boolean {
  return Boolean(
    registration?.deOperatorCategory?.trim() && registration?.dePermitType?.trim()
  );
}

export function needsGermanyRegistrationAttention(
  country: string,
  registration: GermanyRegistration | null | undefined,
  city?: string
): boolean {
  if (!isGermanyCountry(country)) return false;
  if (!registration) return true;

  const state = resolveGermanyFederalStateForProperty(
    city ?? "",
    registration.deFederalState
  );

  if (!state || state === "unknown") return true;
  if (!isDeLocationComplete(registration, city)) return true;
  if (!isDeOperatorProfileComplete(registration)) return true;
  if (!isDeDossierPrepared(registration)) return true;

  const hasNumber = hasDeRegistrationNumber(registration);
  let registrationActive =
    registration.deRegistrationStatus === "active" || hasNumber;

  if (
    registration.deRegistrationStatus === "awaiting_registration_portal" &&
    !hasNumber
  ) {
    registrationActive = false;
  }
  if (registration.deRegistrationStatus === "expired") {
    registrationActive = false;
  }

  if (!registrationActive) return true;

  if (!registration.deRegistrationDisplayedOnListings) return true;

  if (
    registration.deRegistrationStatus === "expired" ||
    registration.deRegistrationStatus === "dossier_in_progress"
  ) {
    return true;
  }

  return false;
}
