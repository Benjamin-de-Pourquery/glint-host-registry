import { prisma } from "@/lib/prisma";
import {
  getSpainGuestReportingMode,
  isRegionalSpainReporting,
  isSpainCountry,
  type SpainGuestReportingMode,
} from "./regions";

const HOURS_24_MS = 24 * 60 * 60 * 1000;
const HOURS_48_MS = 48 * 60 * 60 * 1000;

export type RegionalDueQueueStatus =
  | "prep_window"
  | "awaiting_guest_data"
  | "awaiting_submission"
  | "overdue";

export type RegionalDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: SpainGuestReportingMode;
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  hoursRemaining: number;
  latestReportStatus: string | null;
  queueStatus: RegionalDueQueueStatus;
};

const COMPLETED_STATUSES = new Set(["submitted", "accepted"]);

function resolveQueueStatus(
  now: Date,
  checkInDate: Date,
  guestCount: number,
  latestStatus: string | null,
  deadline: Date
): RegionalDueQueueStatus {
  const isOverdue = now.getTime() > deadline.getTime();

  if (checkInDate.getTime() > now.getTime()) {
    return guestCount === 0 ? "awaiting_guest_data" : "prep_window";
  }

  if (isOverdue) {
    return "overdue";
  }

  if (guestCount === 0) {
    return "awaiting_guest_data";
  }

  if (latestStatus === "prepared") {
    return "awaiting_submission";
  }

  return "awaiting_submission";
}

export async function getRegionalDueQueueForUser(
  userId: string
): Promise<RegionalDueItem[]> {
  const now = new Date();
  const prepWindowEnd = new Date(now.getTime() + HOURS_48_MS);

  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      guestStays: {
        where: {
          checkInDate: { lte: prepWindowEnd },
        },
        include: {
          guestRecords: true,
          regionalGuestReports: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const items: RegionalDueItem[] = [];

  for (const property of properties) {
    if (!isSpainCountry(property.country)) continue;
    if (!isRegionalSpainReporting(property.city)) continue;

    const system = getSpainGuestReportingMode(property.city);
    if (system !== "mossos" && system !== "ertzaintza") continue;

    for (const stay of property.guestStays) {
      const latestStatus = stay.regionalGuestReports[0]?.status ?? null;
      if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

      const deadline = new Date(stay.checkInDate.getTime() + HOURS_24_MS);
      const isOverdue = now.getTime() > deadline.getTime();
      const isActiveOrUpcoming =
        stay.checkOutDate.getTime() >= now.getTime() ||
        stay.checkInDate.getTime() > now.getTime();

      if (!isOverdue && !isActiveOrUpcoming) continue;

      const guestCount = stay.guestRecords.length;
      const hoursRemaining = Math.max(
        0,
        Math.round((deadline.getTime() - now.getTime()) / (60 * 60 * 1000))
      );

      items.push({
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        system,
        stayId: stay.id,
        checkInDate: stay.checkInDate.toISOString(),
        checkOutDate: stay.checkOutDate.toISOString(),
        guestLabel: stay.guestLabel,
        guestCount,
        deadline: deadline.toISOString(),
        hoursRemaining,
        latestReportStatus: latestStatus,
        queueStatus: resolveQueueStatus(
          now,
          stay.checkInDate,
          guestCount,
          latestStatus,
          deadline
        ),
      });
    }
  }

  return items.sort((a, b) => {
    const statusOrder: Record<RegionalDueQueueStatus, number> = {
      overdue: 0,
      awaiting_guest_data: 1,
      awaiting_submission: 2,
      prep_window: 3,
    };
    const orderDiff = statusOrder[a.queueStatus] - statusOrder[b.queueStatus];
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

/** Stays entering the 24h submission window for regional systems. */
export async function getRegionalStaysEnteringSubmissionWindow(): Promise<
  Array<{
    userId: string;
    propertyId: string;
    propertyName: string;
    city: string;
    system: SpainGuestReportingMode;
    stayId: string;
    checkInDate: Date;
    guestLabel: string | null;
  }>
> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + HOURS_24_MS);

  const properties = await prisma.property.findMany({
    where: { archived: false },
    include: {
      user: { select: { id: true } },
      guestStays: {
        where: {
          checkInDate: { gte: now, lte: windowEnd },
        },
        include: {
          regionalGuestReports: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const results: Array<{
    userId: string;
    propertyId: string;
    propertyName: string;
    city: string;
    system: SpainGuestReportingMode;
    stayId: string;
    checkInDate: Date;
    guestLabel: string | null;
  }> = [];

  for (const property of properties) {
    if (!isSpainCountry(property.country)) continue;
    if (!isRegionalSpainReporting(property.city)) continue;

    const system = getSpainGuestReportingMode(property.city);
    if (system !== "mossos" && system !== "ertzaintza") continue;

    for (const stay of property.guestStays) {
      const latestStatus = stay.regionalGuestReports[0]?.status ?? null;
      if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

      results.push({
        userId: property.userId,
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        system,
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        guestLabel: stay.guestLabel,
      });
    }
  }

  return results;
}
