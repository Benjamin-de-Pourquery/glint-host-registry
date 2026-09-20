import { prisma } from "@/lib/prisma";
import {
  getGreeceGuestReportingMode,
  isGreeceCountry,
  isGreeceGuestReporting,
} from "./regions";
import {
  getAadeDeclarationDeadline,
  getDaysUntilDeadline,
  getStayNightCount,
  isShortTermStay,
} from "./stay-duration";
import { AADE_SYSTEM } from "./export";

const DAYS_7_MS = 7 * 24 * 60 * 60 * 1000;

export type AadeDueQueueStatus =
  | "prep_window"
  | "awaiting_guest_data"
  | "awaiting_submission"
  | "overdue";

export type AadeDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "aade_short_term";
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  nightCount: number;
  deadline: string;
  daysRemaining: number;
  latestReportStatus: string | null;
  queueStatus: AadeDueQueueStatus;
};

const COMPLETED_STATUSES = new Set(["submitted", "accepted"]);

function resolveQueueStatus(
  now: Date,
  checkOutDate: Date,
  guestCount: number,
  latestStatus: string | null,
  deadline: Date
): AadeDueQueueStatus {
  const isOverdue = now.getTime() > deadline.getTime();

  if (checkOutDate.getTime() > now.getTime()) {
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

function shouldIncludeInQueue(
  stay: { checkInDate: Date; checkOutDate: Date },
  now: Date,
  windowEnd: Date
): boolean {
  if (!isShortTermStay(stay.checkInDate, stay.checkOutDate)) return false;

  const deadline = getAadeDeclarationDeadline(stay.checkOutDate);
  const isOverdue = now.getTime() > deadline.getTime();
  if (isOverdue) return true;

  if (stay.checkOutDate.getTime() > now.getTime()) {
    return stay.checkOutDate.getTime() <= windowEnd.getTime();
  }

  const daysUntil = getDaysUntilDeadline(deadline, now);
  return daysUntil <= 7;
}

function buildDueItem(
  property: { id: string; name: string; city: string },
  stay: {
    id: string;
    checkInDate: Date;
    checkOutDate: Date;
    guestLabel: string | null;
    guestRecords: Array<{ id: string }>;
    regionalGuestReports: Array<{ status: string }>;
  },
  now: Date
): AadeDueItem | null {
  if (!isShortTermStay(stay.checkInDate, stay.checkOutDate)) return null;

  const latestStatus = stay.regionalGuestReports[0]?.status ?? null;
  if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) return null;

  const windowEnd = new Date(now.getTime() + DAYS_7_MS);
  if (!shouldIncludeInQueue(stay, now, windowEnd)) return null;

  const deadline = getAadeDeclarationDeadline(stay.checkOutDate);
  const guestCount = stay.guestRecords.length;
  const nightCount = getStayNightCount(stay.checkInDate, stay.checkOutDate);

  return {
    propertyId: property.id,
    propertyName: property.name,
    city: property.city,
    system: "aade_short_term",
    stayId: stay.id,
    checkInDate: stay.checkInDate.toISOString(),
    checkOutDate: stay.checkOutDate.toISOString(),
    guestLabel: stay.guestLabel,
    guestCount,
    nightCount,
    deadline: deadline.toISOString(),
    daysRemaining: getDaysUntilDeadline(deadline, now),
    latestReportStatus: latestStatus,
    queueStatus: resolveQueueStatus(now, stay.checkOutDate, guestCount, latestStatus, deadline),
  };
}

export async function getAadeDueQueueForUser(userId: string): Promise<AadeDueItem[]> {
  const now = new Date();

  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      guestStays: {
        include: {
          guestRecords: true,
          regionalGuestReports: {
            where: { system: AADE_SYSTEM },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const items: AadeDueItem[] = [];

  for (const property of properties) {
    if (!isGreeceCountry(property.country)) continue;
    if (!isGreeceGuestReporting(property.country, property.city)) continue;

    const system = getGreeceGuestReportingMode(property.country, property.city);
    if (system !== "aade") continue;

    for (const stay of property.guestStays) {
      const item = buildDueItem(property, stay, now);
      if (item) items.push(item);
    }
  }

  return items.sort((a, b) => {
    const statusOrder: Record<AadeDueQueueStatus, number> = {
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

export async function getAadeStaysEnteringSubmissionWindow(): Promise<
  Array<{
    userId: string;
    propertyId: string;
    propertyName: string;
    city: string;
    stayId: string;
    checkOutDate: Date;
    guestLabel: string | null;
    deadline: Date;
  }>
> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + DAYS_7_MS);

  const properties = await prisma.property.findMany({
    where: { archived: false },
    include: {
      user: { select: { id: true } },
      guestStays: {
        where: {
          checkOutDate: { lte: windowEnd },
        },
        include: {
          guestRecords: true,
          regionalGuestReports: {
            where: { system: AADE_SYSTEM },
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
    checkOutDate: Date;
    guestLabel: string | null;
    deadline: Date;
  }> = [];

  for (const property of properties) {
    if (!isGreeceCountry(property.country)) continue;
    if (!isGreeceGuestReporting(property.country, property.city)) continue;

    for (const stay of property.guestStays) {
      if (!isShortTermStay(stay.checkInDate, stay.checkOutDate)) continue;
      if (stay.guestRecords.length === 0) continue;

      const latestStatus = stay.regionalGuestReports[0]?.status ?? null;
      if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

      const deadline = getAadeDeclarationDeadline(stay.checkOutDate);
      const isOverdue = now.getTime() > deadline.getTime();
      const daysUntil = getDaysUntilDeadline(deadline, now);

      if (!isOverdue && daysUntil > 7) continue;
      if (stay.checkOutDate.getTime() > now.getTime() && stay.checkOutDate > windowEnd) continue;

      results.push({
        userId: property.userId,
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        stayId: stay.id,
        checkOutDate: stay.checkOutDate,
        guestLabel: stay.guestLabel,
        deadline,
      });
    }
  }

  return results;
}
