import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";
import {
  getApplicableSteps,
  getPlaybookProgressSummary,
  resolvePlaybook,
} from "@/lib/playbooks";
import type { ResidencyStatus } from "@/lib/playbooks/types";
import { toListingChannelRecord } from "@/lib/listings/channels";
import { isFranceCountry } from "@/lib/national-transition";
import { loadGuestQueueSummaryForProperty } from "./guest-queue-summary";
import { tryLoadListingHealthScore } from "./health-score";
import type {
  EvidencePackLoadedData,
  EvidencePackLocale,
  EvidencePackPlaybookStep,
  EvidencePackStay,
} from "./types";

function inferStayChannel(source: string, calendarFeedId: string | null): string | null {
  if (calendarFeedId) return "iCal";
  if (source === "manual") return "Manual";
  return source || null;
}

function buildPlaybookSteps(
  locale: EvidencePackLocale,
  country: string,
  city: string,
  residencyStatus: string | null,
  progressRows: Array<{ stepKey: string; status: string; completedAt: Date | null }>
): {
  steps: EvidencePackPlaybookStep[];
  summary: { completed: number; total: number; skipped: number } | null;
} {
  const playbook = resolvePlaybook(country, city);
  if (!playbook) {
    return { steps: [], summary: null };
  }

  const progressMap = new Map(
    progressRows.map((row) => [
      row.stepKey,
      {
        status: row.status as "pending" | "done" | "skipped",
        completedAt: row.completedAt?.toISOString() ?? null,
      },
    ])
  );

  const applicable = getApplicableSteps(
    playbook,
    residencyStatus as ResidencyStatus | null
  );

  const steps: EvidencePackPlaybookStep[] = applicable.map((step) => {
    const progress = progressMap.get(step.key);
    return {
      stepKey: step.key,
      title: step.title[locale],
      status: progress?.status ?? "pending",
      completedAt: progress?.completedAt ?? null,
    };
  });

  const summary = getPlaybookProgressSummary(
    playbook,
    progressRows.map((row) => ({ stepKey: row.stepKey, status: row.status })),
    residencyStatus as ResidencyStatus | null
  );

  return { steps, summary };
}

export async function loadEvidencePackData(
  userId: string,
  propertyId: string,
  periodStart: Date,
  periodEnd: Date,
  locale: EvidencePackLocale
): Promise<EvidencePackLoadedData | null> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: {
      registration: true,
      playbookProgress: true,
      listingChannels: true,
      nightCapSettings: true,
      guestStays: {
        where: {
          checkOutDate: { gte: periodStart },
          checkInDate: { lte: periodEnd },
        },
        orderBy: { checkInDate: "asc" },
      },
    },
  });

  if (!property) {
    return null;
  }

  const { steps: playbookSteps, summary: playbookSummary } = buildPlaybookSteps(
    locale,
    property.country,
    property.city,
    property.residencyStatus,
    property.playbookProgress
  );

  const stays: EvidencePackStay[] = property.guestStays.map((stay) => ({
    id: stay.id,
    checkInDate: stay.checkInDate.toISOString(),
    checkOutDate: stay.checkOutDate.toISOString(),
    nights: Math.max(
      0,
      differenceInCalendarDays(stay.checkOutDate, stay.checkInDate)
    ),
    source: stay.source,
    channel: inferStayChannel(stay.source, stay.calendarFeedId),
  }));

  const nightCapResult = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: property.nightCapSettings,
  });

  const channels = property.listingChannels.map(toListingChannelRecord);
  const guestQueue = await loadGuestQueueSummaryForProperty(
    userId,
    property.id,
    property.country
  );
  const healthScore = await tryLoadListingHealthScore(property.id, locale);

  const registration = property.registration;
  const nerMigration =
    registration && isFranceCountry(property.country)
      ? {
          nationalRegistrationNumber: registration.nationalRegistrationNumber,
          nationalTransitionStatus: registration.nationalTransitionStatus,
          nationalRenewalDeadline:
            registration.nationalRenewalDeadline?.toISOString() ?? null,
        }
      : null;

  return {
    property: {
      id: property.id,
      name: property.name,
      address: property.address,
      city: property.city,
      country: property.country,
      propertyType: property.propertyType,
      residencyStatus: property.residencyStatus,
    },
    registration: registration
      ? {
          id: registration.id,
          registrationNumber: registration.registrationNumber,
          issuingAuthority: registration.issuingAuthority,
          status: registration.status,
          issueDate: registration.issueDate,
          expiryDate: registration.expiryDate,
          nationalRegistrationNumber: registration.nationalRegistrationNumber,
          nationalTransitionStatus: registration.nationalTransitionStatus,
          nationalRenewalDeadline: registration.nationalRenewalDeadline,
          cinNumber: registration.cinNumber,
          rnalNumber: registration.rnalNumber,
          amaNumber: registration.amaNumber,
          hrCategorisationNumber: registration.hrCategorisationNumber,
          nlRegistrationNumber: registration.nlRegistrationNumber,
          beRegistrationNumber: registration.beRegistrationNumber,
        }
      : null,
    playbookSteps,
    playbookSummary,
    stays,
    nightCap: nightCapResult.computation,
    guestQueue,
    channels,
    healthScore,
    nerMigration,
  };
}
