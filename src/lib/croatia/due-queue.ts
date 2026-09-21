import { prisma } from "@/lib/prisma";
import {
  getCroatiaGuestReportingMode,
  isCroatiaCountry,
  isCroatiaGuestReporting,
} from "./regions";
import {
  getEvisitorDeadline,
  getHoursRemaining,
  EVISITOR_HOURS_DEADLINE,
} from "./deadline";
import { getEvisitorPhaseFromNotes, EVISITOR_SYSTEM } from "./export";

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export type EvisitorDueQueueStatus =
  | "prep_window"
  | "awaiting_guest_data"
  | "awaiting_submission"
  | "overdue";

export type EvisitorDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "evisitor";
  stayId: string;
  phase: "arrival" | "departure";
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  hoursRemaining: number;
  latestReportStatus: string | null;
  queueStatus: EvisitorDueQueueStatus;
};

const COMPLETED_STATUSES = new Set(["submitted", "accepted"]);

function getReportForPhase(
  reports: Array<{ status: string; notes: string | null }>,
  phase: "arrival" | "departure"
): { status: string } | null {
  const match = reports.find((r) => getEvisitorPhaseFromNotes(r.notes) === phase);
  if (match) return match;
  if (phase === "arrival" && reports.length === 1 && !getEvisitorPhaseFromNotes(reports[0].notes)) {
    return reports[0];
  }
  return null;
}

function resolveQueueStatus(
  now: Date,
  eventDate: Date,
  guestCount: number,
  latestStatus: string | null,
  deadline: Date
): EvisitorDueQueueStatus {
  const isOverdue = now.getTime() > deadline.getTime();

  if (eventDate.getTime() > now.getTime()) {
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

function shouldIncludePhase(
  phase: "arrival" | "departure",
  stay: { checkInDate: Date; checkOutDate: Date },
  now: Date,
  prepWindowEnd: Date
): boolean {
  const eventDate = phase === "arrival" ? stay.checkInDate : stay.checkOutDate;
  const deadline = getEvisitorDeadline(eventDate);
  const isOverdue = now.getTime() > deadline.getTime();

  if (isOverdue) return true;

  if (phase === "arrival") {
    return eventDate.getTime() <= prepWindowEnd.getTime();
  }

  return eventDate.getTime() <= prepWindowEnd.getTime() && stay.checkInDate.getTime() <= now.getTime();
}

function buildDueItemsForStay(
  property: { id: string; name: string; city: string },
  stay: {
    id: string;
    checkInDate: Date;
    checkOutDate: Date;
    guestLabel: string | null;
    guestRecords: Array<{ id: string }>;
    regionalGuestReports: Array<{ status: string; notes: string | null }>;
  },
  now: Date,
  prepWindowEnd: Date
): EvisitorDueItem[] {
  const guestCount = stay.guestRecords.length;
  const items: EvisitorDueItem[] = [];

  for (const phase of ["arrival", "departure"] as const) {
    const eventDate = phase === "arrival" ? stay.checkInDate : stay.checkOutDate;
    const report = getReportForPhase(stay.regionalGuestReports, phase);
    const latestStatus = report?.status ?? null;

    if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;
    if (!shouldIncludePhase(phase, stay, now, prepWindowEnd)) continue;

    const deadline = getEvisitorDeadline(eventDate);
    const hoursRemaining = getHoursRemaining(deadline, now);

    items.push({
      propertyId: property.id,
      propertyName: property.name,
      city: property.city,
      system: "evisitor",
      stayId: stay.id,
      phase,
      checkInDate: stay.checkInDate.toISOString(),
      checkOutDate: stay.checkOutDate.toISOString(),
      guestLabel: stay.guestLabel,
      guestCount,
      deadline: deadline.toISOString(),
      hoursRemaining,
      latestReportStatus: latestStatus,
      queueStatus: resolveQueueStatus(
        now,
        eventDate,
        guestCount,
        latestStatus,
        deadline
      ),
    });
  }

  return items;
}

export async function getEvisitorDueQueueForUser(
  userId: string
): Promise<EvisitorDueItem[]> {
  const now = new Date();
  const prepWindowEnd = new Date(now.getTime() + HOURS_24_MS);

  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      guestStays: {
        include: {
          guestRecords: true,
          regionalGuestReports: {
            where: { system: EVISITOR_SYSTEM },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const items: EvisitorDueItem[] = [];

  for (const property of properties) {
    if (!isCroatiaCountry(property.country)) continue;
    if (!isCroatiaGuestReporting(property.city)) continue;

    const system = getCroatiaGuestReportingMode(property.city);
    if (system !== "evisitor") continue;

    for (const stay of property.guestStays) {
      items.push(...buildDueItemsForStay(property, stay, now, prepWindowEnd));
    }
  }

  return items.sort((a, b) => {
    const statusOrder: Record<EvisitorDueQueueStatus, number> = {
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

export async function getEvisitorStaysEnteringSubmissionWindow(): Promise<
  Array<{
    userId: string;
    propertyId: string;
    propertyName: string;
    city: string;
    stayId: string;
    phase: "arrival" | "departure";
    eventDate: Date;
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
          OR: [
            { checkInDate: { gte: now, lte: windowEnd } },
            { checkOutDate: { gte: now, lte: windowEnd } },
          ],
        },
        include: {
          guestRecords: true,
          regionalGuestReports: {
            where: { system: EVISITOR_SYSTEM },
            orderBy: { createdAt: "desc" },
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
    phase: "arrival" | "departure";
    eventDate: Date;
    guestLabel: string | null;
  }> = [];

  for (const property of properties) {
    if (!isCroatiaCountry(property.country)) continue;
    if (!isCroatiaGuestReporting(property.city)) continue;

    for (const stay of property.guestStays) {
      if (stay.guestRecords.length === 0) continue;

      const phases: Array<{ phase: "arrival" | "departure"; eventDate: Date }> = [];
      if (stay.checkInDate >= now && stay.checkInDate <= windowEnd) {
        phases.push({ phase: "arrival", eventDate: stay.checkInDate });
      }
      if (stay.checkOutDate >= now && stay.checkOutDate <= windowEnd) {
        phases.push({ phase: "departure", eventDate: stay.checkOutDate });
      }

      for (const { phase, eventDate } of phases) {
        const report = getReportForPhase(stay.regionalGuestReports, phase);
        const latestStatus = report?.status ?? null;
        if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;

        results.push({
          userId: property.userId,
          propertyId: property.id,
          propertyName: property.name,
          city: property.city,
          stayId: stay.id,
          phase,
          eventDate,
          guestLabel: stay.guestLabel,
        });
      }
    }
  }

  return results;
}

export { EVISITOR_HOURS_DEADLINE };
