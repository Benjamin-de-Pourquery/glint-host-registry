import { isGreeceCountry } from "./regions";

export type GreeceRegistrationKind = "ama" | "esl" | "unique_notification";

export type GreeceAmaRegistration = {
  amaNumber?: string | null;
  amaStatus?: string | null;
  amaDisplayedOnListings?: boolean;
  greeceRegistrationKind?: string | null;
  greeceAlternateLicenseNumber?: string | null;
};

export function getEffectiveGreeceRegistrationNumber(
  registration: GreeceAmaRegistration | null | undefined
): string | null {
  if (!registration) return null;
  const kind = registration.greeceRegistrationKind ?? "ama";
  if (kind === "esl" || kind === "unique_notification") {
    return registration.greeceAlternateLicenseNumber?.trim() || null;
  }
  return registration.amaNumber?.trim() || null;
}

export function hasGreeceRegistrationNumber(
  registration: GreeceAmaRegistration | null | undefined
): boolean {
  return Boolean(getEffectiveGreeceRegistrationNumber(registration));
}

export function needsGreeceAmaAttention(
  country: string,
  registration: GreeceAmaRegistration | null | undefined
): boolean {
  if (!isGreeceCountry(country)) return false;
  if (!registration) return true;

  const kind = (registration.greeceRegistrationKind ?? "ama") as GreeceRegistrationKind;
  if (kind === "esl" || kind === "unique_notification") {
    const hasLicense = Boolean(registration.greeceAlternateLicenseNumber?.trim());
    return !hasLicense || !registration.amaDisplayedOnListings;
  }

  const hasAma = Boolean(registration.amaNumber?.trim());
  const obtained =
    registration.amaStatus === "obtained" ||
    registration.amaStatus === "displayed" ||
    hasAma;

  return !obtained || !registration.amaDisplayedOnListings;
}
