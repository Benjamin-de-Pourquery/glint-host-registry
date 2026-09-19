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

export async function syncSesDueNotifications(userId: string) {
  const { getSesDueQueueForUser } = await import("@/lib/ses/due-queue");
  const dueItems = await getSesDueQueueForUser(userId);

  for (const item of dueItems) {
    if (item.queueStatus !== "overdue" && item.queueStatus !== "awaiting_submission") {
      continue;
    }

    const guestRef = item.guestLabel ? ` (${item.guestLabel})` : "";
    const title =
      item.queueStatus === "overdue"
        ? `SES overdue: ${item.propertyName}`
        : `SES submission needed: ${item.propertyName}`;
    const message =
      item.queueStatus === "overdue"
        ? `The 24-hour SES deadline has passed for stay starting ${format(new Date(item.checkInDate), "dd/MM/yyyy")}${guestRef} at ${item.propertyName}. Submit or validate the parte de viajeros.`
        : `Guest stay at ${item.propertyName} requires SES submission${guestRef}. Deadline: ${format(new Date(item.deadline), "dd/MM/yyyy HH:mm")}.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        propertyId: item.propertyId,
        type: "ses_due",
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
          type: "ses_due",
        },
      });
    }
  }
}

export async function syncNightCapNotifications(userId: string) {
  const { getNightCapAttentionForUser } = await import("@/lib/france/night-cap-service");
  const attentionItems = await getNightCapAttentionForUser(userId);

  for (const item of attentionItems) {
    const { computation } = item;
    const title =
      computation.status === "exceeded"
        ? `Night cap exceeded: ${item.propertyName}`
        : computation.status === "critical"
          ? `Night cap critical: ${item.propertyName}`
          : `Night cap warning: ${item.propertyName}`;

    const message =
      computation.status === "exceeded"
        ? `Primary residence night cap exceeded (${computation.nightsUsed}/${computation.limit} nights in ${computation.year}). Stop accepting new bookings to avoid civil fines.`
        : `Primary residence night cap at ${computation.nightsUsed}/${computation.limit} nights in ${computation.year} (${computation.remaining} remaining). Review upcoming stays.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        propertyId: item.propertyId,
        type: "night_cap",
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
          type: "night_cap",
        },
      });
    }
  }
}

export async function syncTouristTaxNotifications(userId: string) {
  const { getTouristTaxAttentionForUser } = await import("@/lib/france/tourist-tax-service");
  const attentionItems = await getTouristTaxAttentionForUser(userId);

  for (const item of attentionItems) {
    const overdue = item.summary.overdueCount > 0;
    const title = overdue
      ? `Tourist tax overdue: ${item.propertyName}`
      : `Tourist tax declaration due: ${item.propertyName}`;
    const message = overdue
      ? `A taxe de séjour period is overdue for ${item.propertyName}. Declare on your commune/EPCI portal even if collected by the platform or €0.`
      : `A taxe de séjour declaration is due soon for ${item.propertyName}. Platform collection does not replace your host declaration.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        propertyId: item.propertyId,
        type: "tourist_tax",
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
          type: "tourist_tax",
        },
      });
    }
  }
}

export async function syncAllNotifications(userId: string) {
  await syncExpiryNotifications(userId);
  await syncMissingFicheNotifications(userId);
  await syncSesDueNotifications(userId);
  await syncNightCapNotifications(userId);
  await syncTouristTaxNotifications(userId);
}
