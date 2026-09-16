import { prisma } from "@/lib/prisma";
import {
  getItalyGuestReportingMode,
  isItalyCountry,
  isItalyGuestReporting,
} from "./regions";

const HOURS_24_MS = 24 * 60 * 60 * 1000;
const HOURS_48_MS = 48 * 60 * 60 * 1000;

export type AlloggiatiDueQueueStatus =
  | "prep_window"
  | "awaiting_guest_data"
  | "awaiting_submission"
  | "overdue";

export type AlloggiatiDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "alloggiati";
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  hoursRemaining: number;
  latestReportStatus: string | null;
  queueStatus: AlloggiatiDueQueueStatus;
};

const COMPLETED_STATUSES = new Set(["submitted", "accepted"]);

function resolveQueueStatus(
  now: Date,
  checkInDate: Date,
  guestCount: number,
  latestStatus: string | null,
  deadline: Date
): AlloggiatiDueQueueStatus {
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

export async function getAlloggiatiDueQueueForUser(
  userId: string
): Promise<AlloggiatiDueItem[]> {
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
            where: { system: "alloggiati" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const items: AlloggiatiDueItem[] = [];

  for (const property of properties) {
    if (!isItalyCountry(property.country)) continue;
    if (!isItalyGuestReporting(property.city)) continue;

    const system = getItalyGuestReportingMode(property.city);
    if (system !== "alloggiati") continue;

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
        system: "alloggiati",
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
    const statusOrder: Record<AlloggiatiDueQueueStatus, number> = {
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

export async function getAlloggiatiStaysEnteringSubmissionWindow(): Promise<
  Array<{
    userId: string;
    propertyId: string;
    propertyName: string;
    city: string;
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
            where: { system: "alloggiati" },
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
    stayId: string;
    checkInDate: Date;
    guestLabel: string | null;
  }> = [];

  for (const property of properties) {
    if (!isItalyCountry(property.country)) continue;
    if (!isItalyGuestReporting(property.city)) continue;

    for (const stay of property.guestStays) {
      const latestStatus = stay.regionalGuestReports[0]?.status ?? null;
      if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

      results.push({
        userId: property.userId,
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        guestLabel: stay.guestLabel,
      });
    }
  }

  return results;
}
