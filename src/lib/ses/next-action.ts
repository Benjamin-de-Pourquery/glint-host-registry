import type { Playbook, PlaybookStep } from "@/lib/playbooks/types";
import { getNextPendingStep } from "@/lib/playbooks";
import { getEffectiveNextStepForSpainRegistration } from "@/lib/spain/next-action";
import { isSpainCountry, usesSesHospedajes } from "@/lib/spain/regions";

export function getSesStepKey(playbook: Playbook): string | null {
  const step = playbook.steps.find((s) => s.key.endsWith("-ses-hospedajes"));
  return step?.key ?? null;
}

export type SesNextActionContext = {
  country: string;
  city: string;
  hasActiveStayNeedingSes?: boolean;
  hasSesCredentials?: boolean;
  esAutonomousCommunity?: string | null;
  hasEsRegistrationNumber?: boolean;
  isEsDossierPrepared?: boolean;
  isEsLicenseKindSet?: boolean;
  esDisplayedOnListings?: boolean;
};

export function getEffectiveNextStepForSpain(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: "primary" | "secondary" | "other" | null | undefined,
  context: SesNextActionContext
): PlaybookStep | null {
  const registrationNext = getEffectiveNextStepForSpainRegistration(
    playbook,
    progress,
    residencyStatus,
    {
      country: context.country,
      city: context.city,
      esAutonomousCommunity: context.esAutonomousCommunity,
      hasEsRegistrationNumber: context.hasEsRegistrationNumber,
      isDossierPrepared: context.isEsDossierPrepared,
      isLicenseKindSet: context.isEsLicenseKindSet,
      isDisplayedOnListings: context.esDisplayedOnListings,
    }
  );

  const defaultNext =
    registrationNext ?? getNextPendingStep(playbook, progress, residencyStatus);

  if (!isSpainCountry(context.country)) {
    return defaultNext;
  }

  const sesStepKey = getSesStepKey(playbook);
  if (!sesStepKey || !usesSesHospedajes(context.city)) {
    return defaultNext;
  }

  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const sesStep = playbook.steps.find((s) => s.key === sesStepKey);
  const sesStatus = progressMap.get(sesStepKey);

  if (
    context.hasActiveStayNeedingSes &&
    sesStep &&
    (!sesStatus || sesStatus === "pending")
  ) {
    const sesIndex = playbook.steps.findIndex((s) => s.key === sesStepKey);
    const defaultIndex = defaultNext
      ? playbook.steps.findIndex((s) => s.key === defaultNext.key)
      : -1;

    if (defaultIndex === -1 || sesIndex < defaultIndex) {
      return sesStep;
    }
  }

  return defaultNext;
}
