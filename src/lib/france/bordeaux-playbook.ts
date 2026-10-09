import type { PlaybookStep, ResidencyStatus } from "@/lib/playbooks/types";

export type BordeauxCompensationSector = "a" | "b" | "c";

export type BordeauxSituation =
  | "primaryResidence"
  | "nonPrimaryChangeOfUse"
  | "socialHousingProhibited";

const HABITATION_PROPERTY_TYPES = new Set(["apartment", "house", "studio", "room", "other"]);

export type BordeauxPlaybookInput = {
  address?: string | null;
  postalCode?: string | null;
  notes?: string | null;
};

function notesText(notes: string | null | undefined): string {
  return (notes ?? "").toLowerCase();
}

export function notesMatchBordeauxTag(
  notes: string | null | undefined,
  tag: string
): boolean {
  return notesText(notes).includes(tag.toLowerCase());
}

export function hasBordeauxRoomInPrimaryNote(notes: string | null | undefined): boolean {
  const text = notesText(notes);
  return (
    /bordeaux:room-in-primary/.test(text) ||
    /room in primary/.test(text) ||
    /chambre.*résidence principale/.test(text)
  );
}

export function hasBordeauxChambreHoteNote(notes: string | null | undefined): boolean {
  const text = notesText(notes);
  return /bordeaux:chambre-hote/.test(text) || /\bchambre d'hôte\b/.test(text);
}

export function getBordeauxCompensationSector(
  input: BordeauxPlaybookInput | null | undefined
): BordeauxCompensationSector | null {
  const text = notesText(input?.notes);
  if (/bordeaux:secteur-a/.test(text) || /secteur\s*a\b/.test(text)) return "a";
  if (/bordeaux:secteur-b/.test(text)) return "b";
  if (/bordeaux:secteur-c/.test(text)) return "c";
  return null;
}

export function bordeauxSectorKnown(input: BordeauxPlaybookInput | null | undefined): boolean {
  return getBordeauxCompensationSector(input) !== null;
}

export function getBordeauxSituation(
  propertyType: string | null | undefined,
  residencyStatus: ResidencyStatus | null | undefined,
  input: BordeauxPlaybookInput | null | undefined
): BordeauxSituation | null {
  const type = (propertyType ?? "").trim();
  if (!HABITATION_PROPERTY_TYPES.has(type)) {
    return null;
  }

  const notes = input?.notes ?? null;
  if (
    notesMatchBordeauxTag(notes, "bordeaux:social-housing") ||
    /logement social/.test(notesText(notes)) ||
    /\bhlm\b/.test(notesText(notes))
  ) {
    return "socialHousingProhibited";
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
  situation: BordeauxSituation,
  input: BordeauxPlaybookInput | null | undefined
): boolean {
  switch (appliesWhen) {
    case "always":
      return true;
    case "bordeauxPrimaryResidence":
      return situation === "primaryResidence";
    case "bordeauxNonPrimaryChangeOfUse":
      return situation === "nonPrimaryChangeOfUse";
    case "bordeauxSocialHousing":
      return situation === "socialHousingProhibited";
    case "bordeauxNotSocialHousing":
      return situation !== "socialHousingProhibited";
    case "bordeauxSecteurA":
      return (
        situation === "nonPrimaryChangeOfUse" &&
        getBordeauxCompensationSector(input) === "a"
      );
    case "bordeauxSecteurPending":
      return situation === "nonPrimaryChangeOfUse" && !bordeauxSectorKnown(input);
    case "bordeauxSecteurKnown":
      return situation === "nonPrimaryChangeOfUse" && bordeauxSectorKnown(input);
    case "bordeauxRoomInPrimary":
      return hasBordeauxRoomInPrimaryNote(input?.notes);
    case "bordeauxChambreHote":
      return hasBordeauxChambreHoteNote(input?.notes);
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
  input: BordeauxPlaybookInput | null | undefined
): boolean {
  if (appliesWhen === "always") return true;
  if (!residencyStatus) return true;

  switch (appliesWhen) {
    case "primaryResidence":
    case "bordeauxPrimaryResidence":
      return residencyStatus === "primary";
    case "secondaryResidence":
      return residencyStatus === "secondary";
    case "nonPrimary":
    case "bordeauxNonPrimaryChangeOfUse":
      return residencyStatus === "secondary" || residencyStatus === "other";
    case "bordeauxSocialHousing":
    case "bordeauxNotSocialHousing":
    case "bordeauxSecteurA":
    case "bordeauxSecteurPending":
    case "bordeauxSecteurKnown":
      return false;
    case "bordeauxRoomInPrimary":
      return hasBordeauxRoomInPrimaryNote(input?.notes);
    case "bordeauxChambreHote":
      return hasBordeauxChambreHoteNote(input?.notes);
    default:
      return true;
  }
}

export function stepAppliesForBordeaux(
  step: PlaybookStep,
  residencyStatus: ResidencyStatus | null | undefined,
  propertyType: string | null | undefined,
  input: BordeauxPlaybookInput | null | undefined
): boolean {
  const appliesWhen = step.appliesWhen ?? "always";
  const situation = getBordeauxSituation(propertyType, residencyStatus, input);

  if (situation) {
    return situationMatchesAppliesWhen(appliesWhen, situation, input);
  }

  return legacyResidencyApplies(appliesWhen, residencyStatus, input);
}

export function bordeauxInputFromProperty(property: {
  address: string;
  postalCode?: string | null;
  notes?: string | null;
}): BordeauxPlaybookInput {
  return {
    address: property.address,
    postalCode: property.postalCode ?? null,
    notes: property.notes ?? null,
  };
}
