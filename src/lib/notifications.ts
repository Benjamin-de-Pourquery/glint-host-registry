import { differenceInDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getMissingFichesForUser } from "@/lib/guest-register/missing-fiches";

export async function syncExpiryNotifications(userId: string) {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: { registration: true },
  });

  const thresholds = [30, 14, 7];

  for (const property of properties) {
    const expiry = property.registration?.expiryDate;
    if (!expiry) continue;

    const daysLeft = differenceInDays(expiry, new Date());
    if (!thresholds.includes(daysLeft) && daysLeft >= 0) continue;

    const title =
      daysLeft < 0
        ? `Registration expired: ${property.name}`
        : `Registration expiring in ${daysLeft} days: ${property.name}`;

    const message =
      daysLeft < 0
        ? `The registration for ${property.name} in ${property.city} has expired. Renew immediately to avoid platform delisting.`
        : `Registration for ${property.name} in ${property.city} expires on ${expiry.toLocaleDateString()}.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        propertyId: property.id,
        title,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          propertyId: property.id,
          title,
          message,
          type: daysLeft < 0 ? "expired" : "expiry_warning",
        },
      });
    }
  }
}

export async function syncMissingFicheNotifications(userId: string) {
  const missing = await getMissingFichesForUser(userId);

  for (const item of missing) {
    const title = `Missing police form: ${item.propertyName}`;
    const guestRef = item.guestLabel ? ` (${item.guestLabel})` : "";
    const message =
      item.daysOverdue === 0
        ? `A foreign guest was expected on ${format(item.checkInDate, "dd/MM/yyyy")}${guestRef} at ${item.propertyName}, but no police form has been submitted yet.`
        : `Police form overdue for stay starting ${format(item.checkInDate, "dd/MM/yyyy")}${guestRef} at ${item.propertyName} (${item.daysOverdue} day(s) past deadline).`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        propertyId: item.propertyId,
        type: "missing_fiche",
        title,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          propertyId: item.propertyId,
          title,
          message,
          type: "missing_fiche",
        },
      });
    }
  }
}

export async function syncAllNotifications(userId: string) {
  await syncExpiryNotifications(userId);
  await syncMissingFicheNotifications(userId);
}
