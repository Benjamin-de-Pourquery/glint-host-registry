import type { PlaybookStep, ResidencyStatus } from "@/lib/playbooks/types";

export type NiceSituation = "primaryResidence" | "nonPrimaryChangeOfUse";

const HABITATION_PROPERTY_TYPES = new Set(["apartment", "house", "studio", "room", "other"]);

export type NicePlaybookInput = {
  address?: string | null;
  notes?: string | null;
  ownerIsLegalEntity?: boolean | null;
};

function notesText(notes: string | null | undefined): string {
  return (notes ?? "").toLowerCase();
}

export function notesMatchNiceTag(notes: string | null | undefined, tag: string): boolean {
  return notesText(notes).includes(tag.toLowerCase());
}

export function hasNiceLocationMixteNote(notes: string | null | undefined): boolean {
  const text = notesText(notes);
  return (
    /nice:location-mixte/.test(text) ||
    /location mixte/.test(text) ||
    /mixte étudiant/.test(text)
  );
}

export function hasNiceQuotaZoneNote(notes: string | null | undefined): boolean {
  const text = notesText(notes);
  return (
    /nice:quota-zone/.test(text) ||
    /zone[s]?\s*(à|a)\s*quota/.test(text) ||
    /vieux-nice|centre-ville.*quota/.test(text)
  );
}

export function niceCompensationBranchRequired(
  input: NicePlaybookInput | null | undefined,
  situation: NiceSituation
): boolean {
  if (situation !== "nonPrimaryChangeOfUse") {
    return false;
  }
  if (hasNiceLocationMixteNote(input?.notes)) {
    return false;
  }
  if (input?.ownerIsLegalEntity) {
    return true;
  }
  const text = notesText(input?.notes);
  if (/nice:second-meuble/.test(text) || /nice:compensation/.test(text) || /2[eè]me meubl/.test(text)) {
    return true;
  }
  return false;
}

export function getNiceSituation(
  propertyType: string | null | undefined,
  residencyStatus: ResidencyStatus | null | undefined,
  _input: NicePlaybookInput | null | undefined
): NiceSituation | null {
  const type = (propertyType ?? "").trim();
  if (!HABITATION_PROPERTY_TYPES.has(type)) {
    return null;
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

function situationMatchesAppliesWhen(
  appliesWhen: NonNullable<PlaybookStep["appliesWhen"]>,
  situation: NiceSituation,
  input: NicePlaybookInput | null | undefined
): boolean {
  switch (appliesWhen) {
    case "always":
      return true;
    case "nicePrimaryResidence":
      return situation === "primaryResidence";
    case "niceNonPrimaryChangeOfUse":
      return situation === "nonPrimaryChangeOfUse";
    case "niceLegalEntityNonPrimary":
      return (
        situation === "nonPrimaryChangeOfUse" && Boolean(input?.ownerIsLegalEntity)
      );
    case "niceCompensationRequired":
      return niceCompensationBranchRequired(input, situation);
    case "niceLocationMixte":
      return hasNiceLocationMixteNote(input?.notes);
    case "niceQuotaZone":
      return hasNiceQuotaZoneNote(input?.notes);
    case "niceNotPrimary":
      return situation === "nonPrimaryChangeOfUse";
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
  residencyStatus: ResidencyStatus | null | undefined,
  input: NicePlaybookInput | null | undefined
): boolean {
  if (appliesWhen === "always") return true;
  if (!residencyStatus) return true;

  switch (appliesWhen) {
    case "primaryResidence":
    case "nicePrimaryResidence":
      return residencyStatus === "primary";
    case "secondaryResidence":
      return residencyStatus === "secondary";
    case "nonPrimary":
    case "niceNonPrimaryChangeOfUse":
    case "niceNotPrimary":
      return residencyStatus === "secondary" || residencyStatus === "other";
    case "niceLegalEntityNonPrimary":
      return (
        (residencyStatus === "secondary" || residencyStatus === "other") &&
        Boolean(input?.ownerIsLegalEntity)
      );
    case "niceCompensationRequired":
      return (
        (residencyStatus === "secondary" || residencyStatus === "other") &&
        niceCompensationBranchRequired(input, "nonPrimaryChangeOfUse")
      );
    case "niceLocationMixte":
      return hasNiceLocationMixteNote(input?.notes);
    case "niceQuotaZone":
      return hasNiceQuotaZoneNote(input?.notes);
    default:
      return true;
  }
}

export function stepAppliesForNice(
  step: PlaybookStep,
  residencyStatus: ResidencyStatus | null | undefined,
  propertyType: string | null | undefined,
  input: NicePlaybookInput | null | undefined
): boolean {
  const appliesWhen = step.appliesWhen ?? "always";
  const situation = getNiceSituation(propertyType, residencyStatus, input);

  if (situation) {
    return situationMatchesAppliesWhen(appliesWhen, situation, input);
  }

  return legacyResidencyApplies(appliesWhen, residencyStatus, input);
}

export function niceInputFromProperty(property: {
  address: string;
  notes?: string | null;
  ownerIsLegalEntity?: boolean | null;
}): NicePlaybookInput {
  return {
    address: property.address,
    notes: property.notes ?? null,
    ownerIsLegalEntity: property.ownerIsLegalEntity ?? null,
  };
}
