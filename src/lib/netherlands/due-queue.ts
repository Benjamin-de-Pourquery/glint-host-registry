import { prisma } from "@/lib/prisma";
import {
  isNetherlandsCountry,
  requiresNlStayNotification,
} from "./regions";
import { STAY_NOTIFY_SYSTEM } from "./export";
import { getStayNotificationPortalUrl } from "./official-links";
import { hasNlRegistrationNumber } from "./registration-compliance";

export type StayNotifyQueueStatus =
  | "upcoming"
  | "awaiting_notification"
  | "notified"
  | "overdue";

export type StayNotifyDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "amsterdam_stay_notify";
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  latestReportStatus: string | null;
  queueStatus: StayNotifyQueueStatus;
  portalUrl: string;
};

const COMPLETED_STATUSES = new Set(["submitted", "accepted"]);

function resolveQueueStatus(
  now: Date,
  checkInDate: Date,
  latestStatus: string | null
): StayNotifyQueueStatus {
  if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) {
    return "notified";
  }

  const checkInMs = checkInDate.getTime();
  const nowMs = now.getTime();

  if (checkInMs > nowMs) {
    return latestStatus === "prepared" ? "awaiting_notification" : "upcoming";
  }

  if (!latestStatus || latestStatus === "prepared") {
    return "overdue";
  }

  return "awaiting_notification";
}

export async function getStayNotifyDueQueueForUser(
  userId: string
): Promise<StayNotifyDueItem[]> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      registration: true,
      guestStays: {
        where: {
          checkOutDate: { gte: new Date() },
        },
        include: {
          guestRecords: { select: { id: true } },
          regionalGuestReports: {
            where: { system: STAY_NOTIFY_SYSTEM },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { checkInDate: "asc" },
      },
    },
  });

  const now = new Date();
  const items: StayNotifyDueItem[] = [];

  for (const property of properties) {
    if (!isNetherlandsCountry(property.country)) continue;
    if (!requiresNlStayNotification(property.city)) continue;
    if (!hasNlRegistrationNumber(property.registration)) continue;

    const portalUrl = getStayNotificationPortalUrl(property.city);

    for (const stay of property.guestStays) {
      const latestReport = stay.regionalGuestReports[0] ?? null;
      const latestStatus = latestReport?.status ?? null;
      const queueStatus = resolveQueueStatus(now, stay.checkInDate, latestStatus);

      if (queueStatus === "notified") continue;

      items.push({
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        system: "amsterdam_stay_notify",
        stayId: stay.id,
        checkInDate: stay.checkInDate.toISOString(),
        checkOutDate: stay.checkOutDate.toISOString(),
        guestLabel: stay.guestLabel,
        guestCount: stay.guestRecords.length,
        deadline: stay.checkInDate.toISOString(),
        latestReportStatus: latestStatus,
        queueStatus,
        portalUrl,
      });
    }
  }

  items.sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
  return items;
}

const NOTIFY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type StayNotifyCronItem = {
  userId: string;
  propertyId: string;
  propertyName: string;
  city: string;
  stayId: string;
  checkInDate: Date;
  guestLabel: string | null;
};

/** Stays with check-in within the next 7 days needing municipal notification. */
export async function getStayNotifyStaysEnteringWindow(): Promise<StayNotifyCronItem[]> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + NOTIFY_WINDOW_MS);

  const properties = await prisma.property.findMany({
    where: { archived: false },
    include: {
      user: { select: { id: true } },
      registration: true,
      guestStays: {
        where: {
          checkInDate: { gte: now, lte: windowEnd },
        },
        include: {
          regionalGuestReports: {
            where: { system: STAY_NOTIFY_SYSTEM },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const results: StayNotifyCronItem[] = [];

  for (const property of properties) {
    if (!isNetherlandsCountry(property.country)) continue;
    if (!requiresNlStayNotification(property.city)) continue;
    if (!hasNlRegistrationNumber(property.registration)) continue;

    for (const stay of property.guestStays) {
      const latest = stay.regionalGuestReports[0];
      if (latest && COMPLETED_STATUSES.has(latest.status)) continue;

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

export async function getStayNotifyDueQueueForProperty(
  propertyId: string
): Promise<StayNotifyDueItem[]> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      registration: true,
      guestStays: {
        where: { checkOutDate: { gte: new Date() } },
        include: {
          guestRecords: { select: { id: true } },
          regionalGuestReports: {
            where: { system: STAY_NOTIFY_SYSTEM },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { checkInDate: "asc" },
      },
    },
  });

  if (!property || !isNetherlandsCountry(property.country)) return [];

  const all = await getStayNotifyDueQueueForUser(property.userId);
  return all.filter((item) => item.propertyId === propertyId);
}
