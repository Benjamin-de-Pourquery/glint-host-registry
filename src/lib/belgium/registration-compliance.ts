import { isBelgiumCountry, type BelgiumRegion } from "./regions";

export type BelgiumRegistration = {
  beRegistrationNumber?: string | null;
  beRegistrationStatus?: string | null;
  beRegistrationDisplayedOnListings?: boolean;
  beRegion?: string | null;
  beOperatorCategory?: string | null;
  beFireSafetyStatus?: string | null;
  beInsuranceStatus?: string | null;
  beUrbanPlanningStatus?: string | null;
  beDossierSubmittedAt?: Date | string | null;
};

export function hasBeRegistrationNumber(
  registration: BelgiumRegistration | null | undefined
): boolean {
  return Boolean(registration?.beRegistrationNumber?.trim());
}

export function isBeDossierComplete(
  registration: BelgiumRegistration | null | undefined,
  region?: BelgiumRegion | null
): boolean {
  if (!registration) return false;

  const effectiveRegion = region ?? (registration.beRegion as BelgiumRegion | null);
  if (!effectiveRegion || effectiveRegion === "unknown") return false;

  const fireOk =
    registration.beFireSafetyStatus === "valid" ||
    registration.beFireSafetyStatus === "pending";
  const insuranceOk =
    registration.beInsuranceStatus === "valid" ||
    registration.beInsuranceStatus === "pending";
  const planningOk =
    effectiveRegion !== "brussels" ||
    registration.beUrbanPlanningStatus === "valid" ||
    registration.beUrbanPlanningStatus === "pending";

  return fireOk && insuranceOk && planningOk;
}

export function needsBelgiumRegistrationAttention(
  country: string,
  registration: BelgiumRegistration | null | undefined,
  city?: string
): boolean {
  if (!isBelgiumCountry(country)) return false;
  if (!registration) return true;

  const region = registration.beRegion as BelgiumRegion | null | undefined;
  if (!region || region === "unknown") return true;

  const hasNumber = hasBeRegistrationNumber(registration);
  const registrationActive =
    registration.beRegistrationStatus === "active" || hasNumber;

  if (!registrationActive) return true;

  if (!isBeDossierComplete(registration, region)) return true;

  if (!registration.beRegistrationDisplayedOnListings) return true;

  if (
    registration.beRegistrationStatus === "expired" ||
    registration.beRegistrationStatus === "dossier_in_progress"
  ) {
    return true;
  }

  return false;
}

export function getBelgiumDossierProgress(
  registration: BelgiumRegistration | null | undefined,
  region?: BelgiumRegion | null
): { completed: number; total: number } {
  const effectiveRegion = region ?? (registration?.beRegion as BelgiumRegion | null);
  if (!effectiveRegion || effectiveRegion === "unknown") {
    return { completed: 0, total: 1 };
  }

  const checks = [
    Boolean(registration?.beOperatorCategory),
    registration?.beFireSafetyStatus === "valid" ||
      registration?.beFireSafetyStatus === "pending",
    registration?.beInsuranceStatus === "valid" ||
      registration?.beInsuranceStatus === "pending",
  ];

  if (effectiveRegion === "brussels") {
    checks.push(
      registration?.beUrbanPlanningStatus === "valid" ||
        registration?.beUrbanPlanningStatus === "pending"
    );
  }

  const completed = checks.filter(Boolean).length;
  return { completed, total: checks.length };
}
