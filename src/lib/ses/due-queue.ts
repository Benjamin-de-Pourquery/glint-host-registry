import { prisma } from "@/lib/prisma";
import { isSpainCountry, usesSesHospedajes } from "@/lib/spain/regions";

const HOURS_24_MS = 24 * 60 * 60 * 1000;
const HOURS_48_MS = 48 * 60 * 60 * 1000;

export type SesDueQueueStatus =
  | "prep_window"
  | "awaiting_guest_data"
  | "awaiting_submission"
  | "validation_needed"
  | "overdue";

export type SesDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  hoursRemaining: number;
  hasCredentials: boolean;
  latestSubmissionStatus: string | null;
  queueStatus: SesDueQueueStatus;
};

const COMPLETED_STATUSES = new Set(["accepted", "sent"]);

function resolveQueueStatus(
  now: Date,
  checkInDate: Date,
  guestCount: number,
  latestStatus: string | null,
  deadline: Date
): SesDueQueueStatus {
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

  if (latestStatus === "rejected" || latestStatus === "dry_run") {
    return "validation_needed";
  }

  return "awaiting_submission";
}

export async function getSesDueQueueForUser(userId: string): Promise<SesDueItem[]> {
  const now = new Date();
  const prepWindowEnd = new Date(now.getTime() + HOURS_48_MS);

  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      sesCredential: true,
      guestStays: {
        where: {
          checkInDate: { lte: prepWindowEnd },
        },
        include: {
          guestRecords: true,
          sesSubmissions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const items: SesDueItem[] = [];

  for (const property of properties) {
    if (!isSpainCountry(property.country)) continue;
    if (!usesSesHospedajes(property.city)) continue;

    for (const stay of property.guestStays) {
      const latestStatus = stay.sesSubmissions[0]?.status ?? null;
      if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

      const deadline = new Date(stay.checkInDate.getTime() + HOURS_24_MS);
      const isOverdue = now.getTime() > deadline.getTime();
      const isActiveOrUpcoming =
        stay.checkOutDate.getTime() >= now.getTime() || stay.checkInDate.getTime() > now.getTime();

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
        stayId: stay.id,
        checkInDate: stay.checkInDate.toISOString(),
        checkOutDate: stay.checkOutDate.toISOString(),
        guestLabel: stay.guestLabel,
        guestCount,
        deadline: deadline.toISOString(),
        hoursRemaining,
        hasCredentials: Boolean(property.sesCredential),
        latestSubmissionStatus: latestStatus,
        queueStatus: resolveQueueStatus(now, stay.checkInDate, guestCount, latestStatus, deadline),
      });
    }
  }

  return items.sort((a, b) => {
    const statusOrder: Record<SesDueQueueStatus, number> = {
      overdue: 0,
      awaiting_guest_data: 1,
      validation_needed: 2,
      awaiting_submission: 3,
      prep_window: 4,
    };
    const orderDiff = statusOrder[a.queueStatus] - statusOrder[b.queueStatus];
    if (orderDiff !== 0) return orderDiff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

/** Stays entering the 24h submission window (check-in within next 24h, not yet notified). */
export async function getSesStaysEnteringSubmissionWindow(): Promise<
  Array<{
    userId: string;
    propertyId: string;
    propertyName: string;
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
          sesSubmissions: {
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
    stayId: string;
    checkInDate: Date;
    guestLabel: string | null;
  }> = [];

  for (const property of properties) {
    if (!isSpainCountry(property.country)) continue;
    if (!usesSesHospedajes(property.city)) continue;

    for (const stay of property.guestStays) {
      const latestStatus = stay.sesSubmissions[0]?.status ?? null;
      if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

      results.push({
        userId: property.userId,
        propertyId: property.id,
        propertyName: property.name,
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        guestLabel: stay.guestLabel,
      });
    }
  }

  return results;
}
