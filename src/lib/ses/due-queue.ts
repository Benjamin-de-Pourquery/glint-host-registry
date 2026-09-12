import { prisma } from "@/lib/prisma";
import { isSpainCountry, usesSesHospedajes } from "@/lib/spain/regions";

const HOURS_24_MS = 24 * 60 * 60 * 1000;

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
};

export async function getSesDueQueueForUser(userId: string): Promise<SesDueItem[]> {
  const now = new Date();
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      sesCredential: true,
      guestStays: {
        where: {
          checkInDate: { lte: now },
          checkOutDate: { gte: now },
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
      if (!stay.guestRecords.length) continue;

      const latestStatus = stay.sesSubmissions[0]?.status ?? null;
      if (latestStatus === "accepted" || latestStatus === "sent") continue;

      const deadline = new Date(stay.checkInDate.getTime() + HOURS_24_MS);
      if (now > deadline) {
        // Still show overdue items
      }

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
        guestCount: stay.guestRecords.length,
        deadline: deadline.toISOString(),
        hoursRemaining,
        hasCredentials: Boolean(property.sesCredential),
        latestSubmissionStatus: latestStatus,
      });
    }
  }

  return items.sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
}
