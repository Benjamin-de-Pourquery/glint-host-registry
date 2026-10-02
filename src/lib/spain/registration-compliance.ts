import {
  getSpainAutonomousCommunity,
  isLikelyEsRegistrationNumberForCommunity,
  isSpainCountry,
  resolveSpainAutonomousCommunityForProperty,
  supportsSpainStrRegistrationCompliance,
  type SpainAutonomousCommunity,
} from "./regions";

const SUPPORTED_ES_STR_COMMUNITIES: SpainAutonomousCommunity[] = [
  "catalonia",
  "madrid",
  "valencian",
];

export type SpainRegistration = {
  esRegistrationNumber?: string | null;
  esRegistrationStatus?: string | null;
  esRegistrationDisplayedOnListings?: boolean;
  esAutonomousCommunity?: string | null;
  esLicenseKind?: string | null;
  esDossierPreparedAt?: Date | string | null;
};

export function hasEsRegistrationNumber(
  registration: SpainRegistration | null | undefined
): boolean {
  return Boolean(registration?.esRegistrationNumber?.trim());
}

export function isEsDossierPrepared(
  registration: SpainRegistration | null | undefined
): boolean {
  return Boolean(registration?.esDossierPreparedAt);
}

export function isEsLicenseKindSet(
  registration: SpainRegistration | null | undefined
): boolean {
  return Boolean(registration?.esLicenseKind?.trim());
}

export function isEsCommunityConfirmed(
  registration: SpainRegistration | null | undefined,
  city?: string
): boolean {
  const inferred = getSpainAutonomousCommunity(city ?? "");
  const stored = registration?.esAutonomousCommunity;
  if (!stored || !SUPPORTED_ES_STR_COMMUNITIES.includes(stored as SpainAutonomousCommunity)) {
    return false;
  }
  if (
    inferred === "catalonia" ||
    inferred === "madrid" ||
    inferred === "valencian"
  ) {
    return stored === inferred;
  }
  return SUPPORTED_ES_STR_COMMUNITIES.includes(stored as SpainAutonomousCommunity);
}

export function shouldRequireListingDisplay(
  registration: SpainRegistration | null | undefined
): boolean {
  const hasNumber = hasEsRegistrationNumber(registration);
  const active =
    registration?.esRegistrationStatus === "active" ||
    (hasNumber && registration?.esRegistrationStatus !== "expired");
  return active && hasNumber;
}

export function needsSpainRegistrationAttention(
  country: string,
  registration: SpainRegistration | null | undefined,
  city?: string
): boolean {
  if (!supportsSpainStrRegistrationCompliance(country, city ?? "", registration?.esAutonomousCommunity)) {
    return false;
  }
  if (!registration) return true;

  const community: SpainAutonomousCommunity = resolveSpainAutonomousCommunityForProperty(
    city ?? "",
    registration.esAutonomousCommunity
  );
  if (!SUPPORTED_ES_STR_COMMUNITIES.includes(community)) return true;

  if (!isEsCommunityConfirmed(registration, city)) return true;
  if (!isEsLicenseKindSet(registration)) return true;
  if (!isEsDossierPrepared(registration)) return true;

  const hasNumber = hasEsRegistrationNumber(registration);
  const registrationActive =
    registration.esRegistrationStatus === "active" || hasNumber;

  if (!registrationActive) return true;
  if (registration.esRegistrationStatus === "expired") return true;

  const expectedLicense =
    community === "catalonia"
      ? "hut"
      : community === "madrid" || community === "valencian"
        ? "vut"
        : null;
  if (expectedLicense && registration.esLicenseKind !== expectedLicense) return true;

  if (
    hasNumber &&
    !isLikelyEsRegistrationNumberForCommunity(community, registration.esRegistrationNumber)
  ) {
    return true;
  }

  if (shouldRequireListingDisplay(registration) && !registration.esRegistrationDisplayedOnListings) {
    return true;
  }

  if (registration.esRegistrationStatus === "dossier_in_progress") {
    return true;
  }

  return false;
}
