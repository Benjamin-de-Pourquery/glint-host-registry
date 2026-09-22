import { isPast } from "date-fns";
import { isNetherlandsCountry } from "./regions";

export type NetherlandsRegistration = {
  nlRegistrationNumber?: string | null;
  nlRegistrationStatus?: string | null;
  nlRegistrationDisplayedOnListings?: boolean;
  nlHolidayPermitStatus?: string | null;
  nlHolidayPermitExpiry?: Date | string | null;
  nlPermitNumber?: string | null;
  nlNeighborhood?: string | null;
  nlNightCapSource?: string | null;
};

export function hasNlRegistrationNumber(
  registration: NetherlandsRegistration | null | undefined
): boolean {
  return Boolean(registration?.nlRegistrationNumber?.trim());
}

export function isNlPermitExpired(
  registration: NetherlandsRegistration | null | undefined
): boolean {
  if (!registration?.nlHolidayPermitExpiry) return false;
  const expiry = new Date(registration.nlHolidayPermitExpiry);
  return isPast(expiry);
}

export function isNlPermitExpiringSoon(
  registration: NetherlandsRegistration | null | undefined,
  withinDays = 30
): boolean {
  if (!registration?.nlHolidayPermitExpiry) return false;
  const expiry = new Date(registration.nlHolidayPermitExpiry);
  const now = new Date();
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= withinDays;
}

export function needsNlRegistrationAttention(
  country: string,
  registration: NetherlandsRegistration | null | undefined
): boolean {
  if (!isNetherlandsCountry(country)) return false;
  if (!registration) return true;

  const hasNumber = hasNlRegistrationNumber(registration);
  const registrationActive =
    registration.nlRegistrationStatus === "active" || hasNumber;

  if (!registrationActive || !registration.nlRegistrationDisplayedOnListings) {
    return true;
  }

  const permitStatus = registration.nlHolidayPermitStatus ?? "not_started";
  if (
    permitStatus === "not_started" ||
    permitStatus === "pending" ||
    permitStatus === "expired"
  ) {
    return true;
  }

  if (isNlPermitExpired(registration) || isNlPermitExpiringSoon(registration)) {
    return true;
  }

  return false;
}
