import type { Playbook, PlaybookStep, ResidencyStatus } from "./types";
import {
  getEffectiveNextStep as getFranceEffectiveNextStep,
  type NationalTransitionRegistration,
} from "@/lib/national-transition";
import { getEffectiveNextStepForSpain } from "@/lib/ses/next-action";
import { getEffectiveNextStepForItaly } from "@/lib/italy/next-action";
import { isSpainCountry } from "@/lib/spain/regions";
import { isItalyCountry } from "@/lib/italy/regions";

export type EffectiveNextStepContext = {
  country: string;
  city: string;
  registration?: NationalTransitionRegistration | null;
  hasActiveStayNeedingSes?: boolean;
  hasSesCredentials?: boolean;
  hasCinNumber?: boolean;
  hasActiveStayNeedingAlloggiati?: boolean;
};

export function getEffectiveNextStep(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus: ResidencyStatus | null | undefined,
  context: EffectiveNextStepContext
): PlaybookStep | null {
  if (isSpainCountry(context.country)) {
    return getEffectiveNextStepForSpain(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      hasActiveStayNeedingSes: context.hasActiveStayNeedingSes,
      hasSesCredentials: context.hasSesCredentials,
    });
  }

  if (isItalyCountry(context.country)) {
    return getEffectiveNextStepForItaly(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      hasCinNumber: context.hasCinNumber,
      hasActiveStayNeedingAlloggiati: context.hasActiveStayNeedingAlloggiati,
    });
  }

  return getFranceEffectiveNextStep(
    playbook,
    progress,
    residencyStatus,
    context.country,
    context.registration ?? null
  );
}
