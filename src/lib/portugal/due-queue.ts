import { prisma } from "@/lib/prisma";
import {
  getPortugalGuestReportingMode,
  isPortugalCountry,
  isPortugalGuestReporting,
} from "./regions";
import { isForeignGuestForSiba } from "./nationality";
import {
  getSibaDeadline,
  getWorkingDaysRemaining,
  SIBA_WORKING_DAYS_DEADLINE,
} from "./working-days";
import { getSibaPhaseFromNotes, SIBA_PHASE_NOTES } from "./export";

const HOURS_48_MS = 48 * 60 * 60 * 1000;

export type SibaDueQueueStatus =
  | "prep_window"
  | "awaiting_guest_data"
  | "awaiting_submission"
  | "overdue";

export type SibaDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "siba";
  stayId: string;
  phase: "arrival" | "departure";
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  foreignGuestCount: number;
  deadline: string;
  workingDaysRemaining: number;
  latestReportStatus: string | null;
  queueStatus: SibaDueQueueStatus;
};

const COMPLETED_STATUSES = new Set(["submitted", "accepted"]);

function countForeignGuests(guests: Array<{ nationality: string }>): number {
  return guests.filter((g) => isForeignGuestForSiba(g.nationality)).length;
}

function getReportForPhase(
  reports: Array<{ status: string; notes: string | null }>,
  phase: "arrival" | "departure"
): { status: string } | null {
  const match = reports.find((r) => getSibaPhaseFromNotes(r.notes) === phase);
  if (match) return match;
  if (phase === "arrival" && reports.length === 1 && !getSibaPhaseFromNotes(reports[0].notes)) {
    return reports[0];
  }
  return null;
}

function resolveQueueStatus(
  now: Date,
  eventDate: Date,
  foreignGuestCount: number,
  latestStatus: string | null,
  deadline: Date
): SibaDueQueueStatus {
  const isOverdue = now.getTime() > deadline.getTime();

  if (eventDate.getTime() > now.getTime()) {
    return foreignGuestCount === 0 ? "awaiting_guest_data" : "prep_window";
  }

  if (isOverdue) {
    return "overdue";
  }

  if (foreignGuestCount === 0) {
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
  const deadline = getSibaDeadline(eventDate);
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
    guestRecords: Array<{ nationality: string }>;
    regionalGuestReports: Array<{ status: string; notes: string | null }>;
  },
  now: Date,
  prepWindowEnd: Date
): SibaDueItem[] {
  const foreignGuestCount = countForeignGuests(stay.guestRecords);
  const items: SibaDueItem[] = [];

  for (const phase of ["arrival", "departure"] as const) {
    const eventDate = phase === "arrival" ? stay.checkInDate : stay.checkOutDate;
    const report = getReportForPhase(stay.regionalGuestReports, phase);
    const latestStatus = report?.status ?? null;

    if (latestStatus && COMPLETED_STATUSES.has(latestStatus)) continue;
    if (!shouldIncludePhase(phase, stay, now, prepWindowEnd)) continue;

    const deadline = getSibaDeadline(eventDate);
    const workingDaysRemaining = getWorkingDaysRemaining(deadline, now);

    items.push({
      propertyId: property.id,
      propertyName: property.name,
      city: property.city,
      system: "siba",
      stayId: stay.id,
      phase,
      checkInDate: stay.checkInDate.toISOString(),
      checkOutDate: stay.checkOutDate.toISOString(),
      guestLabel: stay.guestLabel,
      foreignGuestCount,
      deadline: deadline.toISOString(),
      workingDaysRemaining,
      latestReportStatus: latestStatus,
      queueStatus: resolveQueueStatus(
        now,
        eventDate,
        foreignGuestCount,
        latestStatus,
        deadline
      ),
    });
  }

  return items;
}

export async function getSibaDueQueueForUser(
  userId: string
): Promise<SibaDueItem[]> {
  const now = new Date();
  const prepWindowEnd = new Date(now.getTime() + HOURS_48_MS);

  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      guestStays: {
        include: {
          guestRecords: true,
          regionalGuestReports: {
            where: { system: "siba" },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const items: SibaDueItem[] = [];

  for (const property of properties) {
    if (!isPortugalCountry(property.country)) continue;
    if (!isPortugalGuestReporting(property.city)) continue;

    const system = getPortugalGuestReportingMode(property.city);
    if (system !== "siba") continue;

    for (const stay of property.guestStays) {
      items.push(...buildDueItemsForStay(property, stay, now, prepWindowEnd));
    }
  }

  return items.sort((a, b) => {
    const statusOrder: Record<SibaDueQueueStatus, number> = {
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

export async function getSibaStaysEnteringSubmissionWindow(): Promise<
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
  const windowEnd = new Date(now.getTime() + HOURS_48_MS);

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
            where: { system: "siba" },
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
    if (!isPortugalCountry(property.country)) continue;
    if (!isPortugalGuestReporting(property.city)) continue;

    for (const stay of property.guestStays) {
      if (countForeignGuests(stay.guestRecords) === 0) continue;

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

export { SIBA_WORKING_DAYS_DEADLINE };
