import { isValidEircode, normalizeEircode } from "./eircode";
import type { IrelandRegistration } from "./registration-compliance";

export type ReadinessCheckKey =
  | "planning_status"
  | "eircode"
  | "residence_type"
  | "max_guests"
  | "bed_places"
  | "register_data"
  | "stl_number"
  | "listing_display";

export type ReadinessCheck = {
  key: ReadinessCheckKey;
  complete: boolean;
};

export type ListingChannelDisplayInput = {
  displayStatus: string;
};

export function computeIrelandReadiness(
  registration: IrelandRegistration | null | undefined,
  channels: ListingChannelDisplayInput[] = []
): { checks: ReadinessCheck[]; completeCount: number; total: number; dataReady: boolean } {
  const planningOk =
    Boolean(registration?.iePlanningStatus) &&
    registration?.iePlanningStatus !== "unknown";

  const eircodeOk = isValidEircode(registration?.ieEircode ?? null);
  const residenceOk = Boolean(registration?.ieResidenceType?.trim());
  const maxGuestsOk =
    registration?.ieMaxGuests != null && registration.ieMaxGuests > 0;
  const bedPlacesOk =
    registration?.ieBedPlaces != null && registration.ieBedPlaces > 0;

  const registerDataOk =
    planningOk && eircodeOk && residenceOk && maxGuestsOk && bedPlacesOk;

  const hasNumber = Boolean(registration?.ieStlNumber?.trim());
  const stlNumberOk = hasNumber;

  const activeChannels = channels.filter((c) => c.displayStatus !== "BLOCKED");
  const listingDisplayOk =
    !hasNumber ||
    activeChannels.length === 0 ||
    activeChannels.every((c) => c.displayStatus === "PRESENT");

  const checks: ReadinessCheck[] = [
    { key: "planning_status", complete: planningOk },
    { key: "eircode", complete: eircodeOk },
    { key: "residence_type", complete: residenceOk },
    { key: "max_guests", complete: maxGuestsOk },
    { key: "bed_places", complete: bedPlacesOk },
    { key: "register_data", complete: registerDataOk },
    { key: "stl_number", complete: stlNumberOk },
    { key: "listing_display", complete: listingDisplayOk },
  ];

  const completeCount = checks.filter((c) => c.complete).length;

  return {
    checks,
    completeCount,
    total: checks.length,
    dataReady: registerDataOk,
  };
}

export function trimIrelandStlNumber(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export function formatEircodeForStorage(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return normalizeEircode(value);
}
