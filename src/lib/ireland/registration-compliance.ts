import { isPast } from "date-fns";
import { isIrelandCountry } from "./regions";
import { computeIrelandReadiness, type ListingChannelDisplayInput } from "./readiness";
import { IE_STL_REGISTRATION_DEADLINE } from "./constants";

export type IrelandRegistration = {
  ieStlNumber?: string | null;
  ieStlStatus?: string | null;
  ieRegisteredAt?: Date | string | null;
  ieRenewalDueAt?: Date | string | null;
  iePlanningStatus?: string | null;
  ieEircode?: string | null;
  ieMaxGuests?: number | null;
  ieBedPlaces?: number | null;
  ieResidenceType?: string | null;
};

export function hasIeStlNumber(
  registration: IrelandRegistration | null | undefined
): boolean {
  return Boolean(registration?.ieStlNumber?.trim());
}

export function isIeRenewalDue(
  registration: IrelandRegistration | null | undefined,
  withinDays = 30
): boolean {
  if (!registration?.ieRenewalDueAt) return false;
  const due = new Date(registration.ieRenewalDueAt);
  if (isPast(due)) return true;
  const now = new Date();
  const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= withinDays;
}

export function needsIrelandRegistrationAttention(
  country: string,
  registration: IrelandRegistration | null | undefined,
  channels: ListingChannelDisplayInput[] = []
): boolean {
  if (!isIrelandCountry(country)) return false;
  if (!registration) return true;

  const readiness = computeIrelandReadiness(registration, channels);
  const status = registration.ieStlStatus ?? "not_started";
  const hasNumber = hasIeStlNumber(registration);

  if (status === "expired") return true;
  if (status === "renewal_due" || isIeRenewalDue(registration)) return true;

  if (!hasNumber) {
    const now = new Date();
    if (now <= IE_STL_REGISTRATION_DEADLINE && !readiness.dataReady) {
      return true;
    }
    if (now <= IE_STL_REGISTRATION_DEADLINE) {
      return true;
    }
    return !readiness.dataReady;
  }

  if (!readiness.checks.find((c) => c.key === "listing_display")?.complete) {
    return true;
  }

  if (status === "not_started" || status === "data_ready") {
    return true;
  }

  return false;
}
