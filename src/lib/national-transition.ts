import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import {
  getEffectiveNextStepForFranceWithNightCap,
  type FranceNightCapNextActionContext,
} from "@/lib/france/next-action";
import type { NightCapComputation } from "@/lib/france/night-cap";
import type { TouristTaxSummary } from "@/lib/france/tourist-tax";
import { promoteNerMigrationStepIfNeeded } from "@/lib/fr-ner-migration/next-action";
import type { FrNerMigrationRecord } from "@/lib/fr-ner-migration/types";

export const NATIONAL_TRANSITION_STATUSES = [
  "not_applicable",
  "awaiting_portal",
  "ready_to_renew",
  "renewed",
  "expired_local",
] as const;

export type NationalTransitionStatus = (typeof NATIONAL_TRANSITION_STATUSES)[number];

export type NationalTransitionRegistration = {
  registrationNumber?: string | null;
  nationalRegistrationNumber?: string | null;
  nationalTransitionStatus?: string | null;
  nationalRenewalDeadline?: Date | string | null;
};

export function isFranceCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return c === "france" || c === "fr" || c === "frança" || c === "francaise";
}

export function defaultNationalTransitionStatus(country: string): NationalTransitionStatus {
  return isFranceCountry(country) ? "awaiting_portal" : "not_applicable";
}

export function isNationalTransitionStatus(value: string): value is NationalTransitionStatus {
  return NATIONAL_TRANSITION_STATUSES.includes(value as NationalTransitionStatus);
}

export function getNationalStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith("-prepare-national-portal"));
  return step?.key ?? null;
}

export function canEditNationalNumber(status: NationalTransitionStatus | string | null | undefined): boolean {
  if (!status || status === "not_applicable") return false;
  return status === "ready_to_renew" || status === "renewed" || status === "awaiting_portal";
}

export function needsNationalTransitionAttention(
  country: string,
  registration: NationalTransitionRegistration | null | undefined
): boolean {
  if (!isFranceCountry(country)) return false;
  if (!registration) return true;

  const hasMunicipal = Boolean(registration.registrationNumber?.trim());
  const status = registration.nationalTransitionStatus ?? "awaiting_portal";

  if (!hasMunicipal) return true;
  if (status === "awaiting_portal" || status === "ready_to_renew") return true;

  return false;
}

export function getEffectiveNextStep(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  country: string,
  registration: NationalTransitionRegistration | null | undefined,
  nightCapComputation?: NightCapComputation | null,
  touristTaxSummary?: TouristTaxSummary | null,
  frNerMigration?: FrNerMigrationRecord | null
): PlaybookStep | null {
  const nationalStepKey = getNationalStepKey(playbook);
  const nationalStep = nationalStepKey
    ? playbook.steps.find((s) => s.key === nationalStepKey) ?? null
    : null;

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const defaultNext = getNextPendingStep(playbook, progress, residencyStatus);

  if (!isFranceCountry(country) || !nationalStep) {
    return defaultNext;
  }

  const transitionStatus = (registration?.nationalTransitionStatus ??
    "awaiting_portal") as NationalTransitionStatus;
  const hasMunicipal = Boolean(registration?.registrationNumber?.trim());
  const nationalPending =
    !progressMap.get(nationalStep.key) || progressMap.get(nationalStep.key) === "pending";

  if (transitionStatus === "ready_to_renew" && nationalPending) {
    return nationalStep;
  }

  if (
    hasMunicipal &&
    (transitionStatus === "awaiting_portal" || transitionStatus === "ready_to_renew") &&
    nationalPending &&
    defaultNext &&
    defaultNext.key !== nationalStep.key
  ) {
    const nationalIndex = playbook.steps.findIndex((s) => s.key === nationalStep.key);
    const defaultIndex = playbook.steps.findIndex((s) => s.key === defaultNext.key);

    if (defaultIndex > nationalIndex) {
      return nationalStep;
    }
  }

  const nerMigrationStep = promoteNerMigrationStepIfNeeded(
    playbook,
    progress,
    frNerMigration,
    defaultNext
  );
  if (nerMigrationStep) {
    return nerMigrationStep;
  }

  const nightCapContext: FranceNightCapNextActionContext = {
    country,
    residencyStatus,
    nightCapComputation: nightCapComputation ?? null,
    touristTaxSummary: touristTaxSummary ?? null,
  };

  return getEffectiveNextStepForFranceWithNightCap(
    playbook,
    progress,
    residencyStatus,
    nightCapContext,
    defaultNext
  );
}

export const NATIONAL_PORTAL_PRIMARY_URL =
  "https://www.apimeubles.finances.gouv.fr/comprendre-le-dispositif";
