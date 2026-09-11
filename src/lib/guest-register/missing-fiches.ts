import { addDays, isSameDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export type GuestStayWithRecords = {
  id: string;
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  expectsForeignGuest: boolean;
  guestLabel: string | null;
  notes: string | null;
  guestRecords: {
    id: string;
    arrivalDate: Date;
    requiresPoliceForm: boolean;
    isFrenchNational: boolean;
  }[];
};

export type MissingFicheStay = {
  stayId: string;
  propertyId: string;
  propertyName: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestLabel: string | null;
  daysOverdue: number;
};

function recordMatchesStay(
  record: GuestStayWithRecords["guestRecords"][number],
  stay: GuestStayWithRecords
): boolean {
  if (!record.requiresPoliceForm || record.isFrenchNational) return false;
  return isSameDay(record.arrivalDate, stay.checkInDate);
}

export function stayHasMatchingFiche(stay: GuestStayWithRecords): boolean {
  return stay.guestRecords.some((record) => recordMatchesStay(record, stay));
}

export function getStayFicheDeadline(checkInDate: Date): Date {
  return startOfDay(addDays(checkInDate, 1));
}

export function isStayMissingFiche(
  stay: GuestStayWithRecords,
  now = new Date()
): boolean {
  if (!stay.expectsForeignGuest) return false;
  if (stayHasMatchingFiche(stay)) return false;
  return now >= getStayFicheDeadline(stay.checkInDate);
}

export function toMissingFicheStay(
  stay: GuestStayWithRecords,
  propertyName: string,
  now = new Date()
): MissingFicheStay {
  const deadline = getStayFicheDeadline(stay.checkInDate);
  const daysOverdue = Math.max(
    0,
    Math.floor((startOfDay(now).getTime() - deadline.getTime()) / (24 * 60 * 60 * 1000))
  );

  return {
    stayId: stay.id,
    propertyId: stay.propertyId,
    propertyName,
    checkInDate: stay.checkInDate,
    checkOutDate: stay.checkOutDate,
    guestLabel: stay.guestLabel,
    daysOverdue,
  };
}

export async function getMissingFichesForUser(userId: string): Promise<MissingFicheStay[]> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    select: {
      id: true,
      name: true,
      guestStays: {
        where: {
          expectsForeignGuest: true,
          checkOutDate: { gte: startOfDay(new Date()) },
        },
        include: {
          guestRecords: {
            select: {
              id: true,
              arrivalDate: true,
              requiresPoliceForm: true,
              isFrenchNational: true,
            },
          },
        },
        orderBy: { checkInDate: "asc" },
      },
    },
  });

  const now = new Date();
  const missing: MissingFicheStay[] = [];

  for (const property of properties) {
    for (const stay of property.guestStays) {
      if (isStayMissingFiche(stay, now)) {
        missing.push(toMissingFicheStay(stay, property.name, now));
      }
    }
  }

  return missing;
}

export async function getMissingFicheCountForProperty(
  propertyId: string,
  userId: string
): Promise<number> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId, archived: false },
    select: {
      guestStays: {
        where: {
          expectsForeignGuest: true,
          checkOutDate: { gte: startOfDay(new Date()) },
        },
        include: {
          guestRecords: {
            select: {
              id: true,
              arrivalDate: true,
              requiresPoliceForm: true,
              isFrenchNational: true,
            },
          },
        },
      },
    },
  });

  if (!property) return 0;

  const now = new Date();
  return property.guestStays.filter((stay) => isStayMissingFiche(stay, now)).length;
}

export async function findMatchingStayForRecord(
  propertyId: string,
  arrivalDate: Date,
  requiresPoliceForm: boolean
): Promise<string | null> {
  if (!requiresPoliceForm) return null;

  const stay = await prisma.guestStay.findFirst({
    where: {
      propertyId,
      expectsForeignGuest: true,
      checkInDate: {
        gte: startOfDay(arrivalDate),
        lt: addDays(startOfDay(arrivalDate), 1),
      },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return stay?.id ?? null;
}
