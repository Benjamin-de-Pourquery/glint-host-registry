import { isCroatiaCountry } from "./regions";

export type CroatiaCategorisationRegistration = {
  hrCategorisationNumber?: string | null;
  hrObjectId?: string | null;
  hrCategorisationStatus?: string | null;
  hrCategorisationDisplayedOnListings?: boolean;
};

export function hasCroatiaCategorisationNumber(
  registration: CroatiaCategorisationRegistration | null | undefined
): boolean {
  return Boolean(registration?.hrCategorisationNumber?.trim());
}

export function hasCroatiaEvisitorObjectId(
  registration: CroatiaCategorisationRegistration | null | undefined
): boolean {
  return Boolean(registration?.hrObjectId?.trim());
}

export function needsCroatiaEvisitorAttention(
  country: string,
  registration: CroatiaCategorisationRegistration | null | undefined
): boolean {
  if (!isCroatiaCountry(country)) return false;
  if (!registration) return true;

  const hasCategorisation = Boolean(registration.hrCategorisationNumber?.trim());
  const hasObjectId = Boolean(registration.hrObjectId?.trim());
  const obtained =
    registration.hrCategorisationStatus === "active" ||
    registration.hrCategorisationStatus === "displayed" ||
    hasCategorisation;

  return !obtained || !registration.hrCategorisationDisplayedOnListings || !hasObjectId;
}
