import type { PlaybookStep, ResidencyStatus } from "@/lib/playbooks/types";

export type MarseilleSituation =
  | "primaryResidence"
  | "nonPrimaryChangeOfUse"
  | "socialHousingProhibited"
  | "legacy2021Temporary";

export type MarseilleArrondissementGroup =
  | "group1to3"
  | "group4to6"
  | "group7to9"
  | "group10to12"
  | "group13to16";

const HABITATION_PROPERTY_TYPES = new Set(["apartment", "house", "studio", "room", "other"]);

const MARSEILLE_POSTAL_RE = /^130(?:0[1-9]|1[0-6])$/;

export type MarseillePlaybookInput = {
  address?: string | null;
  notes?: string | null;
};

export function parseMarseillePostalCode(
  address: string | null | undefined
): string | null {
  const text = (address ?? "").trim();
  if (!text) return null;
  const match = text.match(/\b(130(?:0[1-9]|1[0-6]))\b/);
  return match?.[1] ?? null;
}

export function getMarseilleArrondissementGroup(
  postalCode: string | null | undefined
): MarseilleArrondissementGroup | null {
  const postal = (postalCode ?? "").trim();
  if (!MARSEILLE_POSTAL_RE.test(postal)) {
    return null;
  }
  const arr = Number.parseInt(postal.slice(-2), 10);
  if (arr >= 1 && arr <= 3) return "group1to3";
  if (arr >= 4 && arr <= 6) return "group4to6";
  if (arr >= 7 && arr <= 9) return "group7to9";
  if (arr >= 10 && arr <= 12) return "group10to12";
  if (arr >= 13 && arr <= 16) return "group13to16";
  return null;
}

function notesMatch(notes: string | null | undefined, patterns: RegExp[]): boolean {
  const text = (notes ?? "").toLowerCase();
  return patterns.some((pattern) => pattern.test(text));
}

export function getMarseilleSituation(
  propertyType: string | null | undefined,
  residencyStatus: ResidencyStatus | null | undefined,
  input: MarseillePlaybookInput | null | undefined
): MarseilleSituation | null {
  const type = (propertyType ?? "").trim();
  if (!HABITATION_PROPERTY_TYPES.has(type)) {
    return null;
  }

  const notes = input?.notes ?? null;
  if (
    notesMatch(notes, [
      /marseille:social-housing/,
      /logement social/,
      /social housing/,
      /\bhlm\b/,
    ])
  ) {
    return "socialHousingProhibited";
  }

  if (
    notesMatch(notes, [
      /marseille:legacy-2021/,
      /autorisation temporaire.*2021/,
      /2021.*autorisation temporaire/,
      /temporary authori[sz]ation.*2021/,
    ])
  ) {
    return "legacy2021Temporary";
  }

  const residency = residencyStatus ?? null;
  if (residency === "primary") {
    return "primaryResidence";
  }
  if (residency === "secondary" || residency === "other") {
    return "nonPrimaryChangeOfUse";
  }

  return null;
}

export function marseilleArrondissementGroupKnown(
  input: MarseillePlaybookInput | null | undefined
): boolean {
  return getMarseilleArrondissementGroup(parseMarseillePostalCode(input?.address)) !== null;
}

function situationMatchesAppliesWhen(
  appliesWhen: NonNullable<PlaybookStep["appliesWhen"]>,
  situation: MarseilleSituation,
  input: MarseillePlaybookInput | null | undefined
): boolean {
  switch (appliesWhen) {
    case "always":
      return true;
    case "marseillePrimaryResidence":
      return situation === "primaryResidence";
    case "marseilleNonPrimaryChangeOfUse":
      return situation === "nonPrimaryChangeOfUse";
    case "marseilleSocialHousing":
      return situation === "socialHousingProhibited";
    case "marseilleLegacy2021":
      return situation === "legacy2021Temporary";
    case "marseilleArrondissementPending":
      return (
        situation === "nonPrimaryChangeOfUse" && !marseilleArrondissementGroupKnown(input)
      );
    case "marseilleNonPrimaryWithArrondissement":
      return (
        situation === "nonPrimaryChangeOfUse" && marseilleArrondissementGroupKnown(input)
      );
    case "marseilleNotSocialHousing":
      return situation !== "socialHousingProhibited";
    case "primaryResidence":
      return situation === "primaryResidence";
    case "nonPrimary":
      return situation === "nonPrimaryChangeOfUse";
    case "secondaryResidence":
      return situation !== "primaryResidence";
    default:
      return false;
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
    case "marseillePrimaryResidence":
      return residencyStatus === "primary";
    case "secondaryResidence":
      return residencyStatus === "secondary";
    case "nonPrimary":
    case "marseilleNonPrimaryChangeOfUse":
      return residencyStatus === "secondary" || residencyStatus === "other";
    case "marseilleSocialHousing":
    case "marseilleLegacy2021":
    case "marseilleArrondissementPending":
    case "marseilleNonPrimaryWithArrondissement":
    case "marseilleNotSocialHousing":
      return false;
    default:
      return true;
  }
}

export function stepAppliesForMarseille(
  step: PlaybookStep,
  residencyStatus: ResidencyStatus | null | undefined,
  propertyType: string | null | undefined,
  input: MarseillePlaybookInput | null | undefined
): boolean {
  const appliesWhen = step.appliesWhen ?? "always";
  const situation = getMarseilleSituation(propertyType, residencyStatus, input);

  if (situation) {
    return situationMatchesAppliesWhen(appliesWhen, situation, input);
  }

  return legacyResidencyApplies(appliesWhen, residencyStatus);
}

export function marseilleInputFromProperty(property: {
  address: string;
  notes?: string | null;
}): MarseillePlaybookInput {
  return {
    address: property.address,
    notes: property.notes ?? null,
  };
}
