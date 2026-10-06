import type { PlaybookStep, ResidencyStatus } from "@/lib/playbooks/types";

export type ParisSituation =
  | "primaryWholeDwelling"
  | "nonPrimaryHousing"
  | "commercialPremises"
  | "otherPremises"
  | "singleRoomExempt";

const HABITATION_PROPERTY_TYPES = new Set(["apartment", "house", "studio"]);

export function getParisSituation(
  propertyType: string | null | undefined,
  residencyStatus: ResidencyStatus | null | undefined
): ParisSituation | null {
  const type = (propertyType ?? "").trim();
  const residency = residencyStatus ?? null;

  if (type === "room" && residency === "primary") {
    return "singleRoomExempt";
  }
  if (type === "commercial") {
    return "commercialPremises";
  }
  if (type === "non_habitation") {
    return "otherPremises";
  }
  if (!HABITATION_PROPERTY_TYPES.has(type)) {
    return null;
  }
  if (residency === "primary") {
    return "primaryWholeDwelling";
  }
  if (residency === "secondary" || residency === "other") {
    return "nonPrimaryHousing";
  }
  return null;
}

function situationMatchesAppliesWhen(
  appliesWhen: NonNullable<PlaybookStep["appliesWhen"]>,
  situation: ParisSituation
): boolean {
  switch (appliesWhen) {
    case "always":
      return true;
    case "primaryResidence":
      return situation === "primaryWholeDwelling";
    case "nonPrimary":
      return situation === "nonPrimaryHousing";
    case "commercialPremises":
      return situation === "commercialPremises";
    case "otherPremises":
      return situation === "otherPremises";
    case "singleRoomExempt":
      return situation === "singleRoomExempt";
    case "secondaryResidence":
      return situation === "nonPrimaryHousing";
    default:
      return true;
  }
}

/** Legacy residency-only filter when Paris premises type is not set. */
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
      return residencyStatus === "secondary";
    case "nonPrimary":
      return residencyStatus === "secondary" || residencyStatus === "other";
    case "commercialPremises":
    case "otherPremises":
    case "singleRoomExempt":
      return false;
    default:
      return true;
  }
}

export function stepAppliesForParis(
  step: PlaybookStep,
  residencyStatus: ResidencyStatus | null | undefined,
  propertyType: string | null | undefined
): boolean {
  const appliesWhen = step.appliesWhen ?? "always";
  if (appliesWhen === "always") {
    return true;
  }

  const situation = getParisSituation(propertyType, residencyStatus);
  if (situation) {
    return situationMatchesAppliesWhen(appliesWhen, situation);
  }

  return legacyResidencyApplies(appliesWhen, residencyStatus);
}
