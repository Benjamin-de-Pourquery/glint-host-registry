import type { Playbook, PlaybookStep, ResidencyStatus } from "./types";
import {
  getEffectiveNextStep as getFranceEffectiveNextStep,
  type NationalTransitionRegistration,
} from "@/lib/national-transition";
import { getEffectiveNextStepForSpain } from "@/lib/ses/next-action";
import { getEffectiveNextStepForItaly } from "@/lib/italy/next-action";
import { getEffectiveNextStepForPortugal } from "@/lib/portugal/next-action";
import { getEffectiveNextStepForGreece } from "@/lib/greece/next-action";
import { getEffectiveNextStepForCroatia } from "@/lib/croatia/next-action";
import { getEffectiveNextStepForNetherlands } from "@/lib/netherlands/next-action";
import { getEffectiveNextStepForBelgium } from "@/lib/belgium/next-action";
import { isSpainCountry } from "@/lib/spain/regions";
import { isItalyCountry } from "@/lib/italy/regions";
import { isPortugalCountry } from "@/lib/portugal/regions";
import { isGreeceCountry } from "@/lib/greece/regions";
import { isCroatiaCountry } from "@/lib/croatia/regions";
import { isNetherlandsCountry } from "@/lib/netherlands/regions";
import { isBelgiumCountry } from "@/lib/belgium/regions";
import type { NightCapComputation } from "@/lib/france/night-cap";
import type { TouristTaxSummary } from "@/lib/france/tourist-tax";

export type EffectiveNextStepContext = {
  country: string;
  city: string;
  registration?: NationalTransitionRegistration | null;
  hasActiveStayNeedingSes?: boolean;
  hasSesCredentials?: boolean;
  hasCinNumber?: boolean;
  hasActiveStayNeedingAlloggiati?: boolean;
  hasRnalNumber?: boolean;
  hasActiveStayNeedingSiba?: boolean;
  hasAmaNumber?: boolean;
  amaDisplayedOnListings?: boolean;
  hasActiveStayNeedingAade?: boolean;
  hasCategorisationNumber?: boolean;
  hasEvisitorObjectId?: boolean;
  hasActiveStayNeedingEvisitor?: boolean;
  hasNlRegistrationNumber?: boolean;
  hasNlHolidayPermit?: boolean;
  hasActiveStayNeedingNotification?: boolean;
  beRegion?: string | null;
  hasBeRegistrationNumber?: boolean;
  isBeDossierComplete?: boolean;
  beDisplayedOnListings?: boolean;
  nightCapComputation?: NightCapComputation | null;
  touristTaxSummary?: TouristTaxSummary | null;
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

  if (isPortugalCountry(context.country)) {
    return getEffectiveNextStepForPortugal(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      hasRnalNumber: context.hasRnalNumber,
      hasActiveStayNeedingSiba: context.hasActiveStayNeedingSiba,
    });
  }

  if (isGreeceCountry(context.country)) {
    return getEffectiveNextStepForGreece(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      hasAmaNumber: context.hasAmaNumber,
      amaDisplayedOnListings: context.amaDisplayedOnListings,
      hasActiveStayNeedingAade: context.hasActiveStayNeedingAade,
    });
  }

  if (isCroatiaCountry(context.country)) {
    return getEffectiveNextStepForCroatia(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      hasCategorisationNumber: context.hasCategorisationNumber,
      hasEvisitorObjectId: context.hasEvisitorObjectId,
      hasActiveStayNeedingEvisitor: context.hasActiveStayNeedingEvisitor,
    });
  }

  if (isNetherlandsCountry(context.country)) {
    return getEffectiveNextStepForNetherlands(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      hasNlRegistrationNumber: context.hasNlRegistrationNumber,
      hasNlHolidayPermit: context.hasNlHolidayPermit,
      hasActiveStayNeedingNotification: context.hasActiveStayNeedingNotification,
    });
  }

  if (isBelgiumCountry(context.country)) {
    return getEffectiveNextStepForBelgium(playbook, progress, residencyStatus, {
      country: context.country,
      city: context.city,
      beRegion: context.beRegion,
      hasBeRegistrationNumber: context.hasBeRegistrationNumber,
      isDossierComplete: context.isBeDossierComplete,
      isDisplayedOnListings: context.beDisplayedOnListings,
    });
  }

  return getFranceEffectiveNextStep(
    playbook,
    progress,
    residencyStatus,
    context.country,
    context.registration ?? null,
    context.nightCapComputation ?? null,
    context.touristTaxSummary ?? null
  );
}
