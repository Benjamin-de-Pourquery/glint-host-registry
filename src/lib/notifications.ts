import { differenceInDays } from "date-fns";
import { prisma } from "@/lib/prisma";

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
