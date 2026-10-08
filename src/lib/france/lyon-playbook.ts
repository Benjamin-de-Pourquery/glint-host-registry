import type { PlaybookStep, ResidencyStatus } from "@/lib/playbooks/types";

export type LyonSituation =
  | "primaryResidence"
  | "nonPrimaryHypercentre"
  | "nonPrimaryOutsideUnder35NaturalConfirm"
  | "nonPrimaryCompensationRequired";

const HABITATION_PROPERTY_TYPES = new Set(["apartment", "house", "studio"]);

export type LyonPlaybookInput = {
  inHypercentre?: boolean | null;
  habitableSurfaceM2?: number | null;
  ownerIsLegalEntity?: boolean | null;
};

const LYON_POSTAL_RE = /^6900[1-9]$/;

export function normalizeLyonPostalCode(postalCode: string | null | undefined): string | null {
  const trimmed = (postalCode ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isLyonMunicipality(
  city: string | null | undefined,
  postalCode?: string | null
): boolean {
  const c = (city ?? "").trim().toLowerCase();
  if (c !== "lyon") {
    return false;
  }
  const postal = normalizeLyonPostalCode(postalCode);
  if (!postal) {
    return true;
  }
  return LYON_POSTAL_RE.test(postal);
}

export function getLyonSituation(
  propertyType: string | null | undefined,
  residencyStatus: ResidencyStatus | null | undefined,
  lyon: LyonPlaybookInput | null | undefined
): LyonSituation | null {
  const type = (propertyType ?? "").trim();
  const residency = residencyStatus ?? null;

  if (!HABITATION_PROPERTY_TYPES.has(type)) {
    return null;
  }

  if (residency === "primary") {
    return "primaryResidence";
  }

  if (residency !== "secondary" && residency !== "other") {
    return null;
  }

  const inHypercentre = lyon?.inHypercentre;
  const surface = lyon?.habitableSurfaceM2;
  const legalEntity = lyon?.ownerIsLegalEntity;

  if (inHypercentre === true) {
    return "nonPrimaryHypercentre";
  }

  if (inHypercentre === false && typeof surface === "number" && surface > 0) {
    if (surface >= 35 || legalEntity === true) {
      return "nonPrimaryCompensationRequired";
    }
    if (legalEntity === false) {
      return "nonPrimaryOutsideUnder35NaturalConfirm";
    }
  }

  if (inHypercentre === false && legalEntity === true) {
    return "nonPrimaryCompensationRequired";
  }

  if (inHypercentre === false && typeof surface === "number" && surface >= 35) {
    return "nonPrimaryCompensationRequired";
  }

  return null;
}

export function lyonSituationRequiresServiceHabitatConfirmation(
  situation: LyonSituation | null
): boolean {
  return situation === "nonPrimaryOutsideUnder35NaturalConfirm";
}

function situationMatchesAppliesWhen(
  appliesWhen: NonNullable<PlaybookStep["appliesWhen"]>,
  situation: LyonSituation
): boolean {
  switch (appliesWhen) {
    case "always":
      return true;
    case "primaryResidence":
      return situation === "primaryResidence";
    case "nonPrimary":
      return situation !== "primaryResidence";
    case "lyonNonPrimaryHypercentre":
      return situation === "nonPrimaryHypercentre";
    case "lyonOutsideUnder35NaturalConfirm":
      return situation === "nonPrimaryOutsideUnder35NaturalConfirm";
    case "lyonNonPrimaryCompensationRequired":
      return situation === "nonPrimaryCompensationRequired";
    case "lyonNonPrimaryDetailsPending":
      return false;
    case "secondaryResidence":
      return situation !== "primaryResidence";
    default:
      return true;
  }
}

function legacyResidencyApplies(
  appliesWhen: NonNullable<PlaybookStep["appliesWhen"]>,
  residencyStatus: ResidencyStatus | null | undefined
): boolean {
  if (appliesWhen === "always") return true;
  if (!residencyStatus) return true;

  switch (appliesWhen) {
    case "primaryResidence":
      return residencyStatus === "primary";
    case "secondaryResidence":
    case "nonPrimary":
      return residencyStatus === "secondary" || residencyStatus === "other";
    case "lyonNonPrimaryHypercentre":
    case "lyonOutsideUnder35NaturalConfirm":
    case "lyonNonPrimaryCompensationRequired":
    case "lyonNonPrimaryDetailsPending":
      return residencyStatus === "secondary" || residencyStatus === "other";
    default:
      return true;
  }
}

export function stepAppliesForLyon(
  step: PlaybookStep,
  residencyStatus: ResidencyStatus | null | undefined,
  propertyType: string | null | undefined,
  lyon: LyonPlaybookInput | null | undefined
): boolean {
  const appliesWhen = step.appliesWhen ?? "always";
  if (appliesWhen === "always") {
    return true;
  }

  const situation = getLyonSituation(propertyType, residencyStatus, lyon);
  if (situation) {
    return situationMatchesAppliesWhen(appliesWhen, situation);
  }

  return legacyResidencyApplies(appliesWhen, residencyStatus);
}
