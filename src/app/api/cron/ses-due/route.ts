import { NextResponse } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSesStaysEnteringSubmissionWindow } from "@/lib/ses/due-queue";
import { getRegionalStaysEnteringSubmissionWindow } from "@/lib/spain/regional-due-queue";
import { getRegionalSystemLabel } from "@/lib/spain/regions";
import { getAlloggiatiStaysEnteringSubmissionWindow } from "@/lib/italy/due-queue";

function verifyCronAuth(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  const headerSecret = request.headers.get("x-cron-secret");
  const providedSecret = bearerToken ?? headerSecret;

  return Boolean(providedSecret && providedSecret === cronSecret);
}

export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sesStays = await getSesStaysEnteringSubmissionWindow();
  const regionalStays = await getRegionalStaysEnteringSubmissionWindow();
  const alloggiatiStays = await getAlloggiatiStaysEnteringSubmissionWindow();
  let created = 0;

  for (const stay of sesStays) {
    const guestRef = stay.guestLabel ? ` (${stay.guestLabel})` : "";
    const title = `SES due soon: ${stay.propertyName}`;
    const message = `Guest check-in on ${format(stay.checkInDate, "dd/MM/yyyy")}${guestRef} at ${stay.propertyName}. Submit the parte de viajeros within 24 hours of arrival.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId: stay.userId,
        propertyId: stay.propertyId,
        type: "ses_due",
        title,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: stay.userId,
          propertyId: stay.propertyId,
          title,
          message,
          type: "ses_due",
        },
      });
      created++;
    }
  }

  for (const stay of regionalStays) {
    const systemLabel = getRegionalSystemLabel(stay.system);
    const guestRef = stay.guestLabel ? ` (${stay.guestLabel})` : "";
    const title = `${systemLabel} due soon: ${stay.propertyName}`;
    const message = `Guest check-in on ${format(stay.checkInDate, "dd/MM/yyyy")}${guestRef} at ${stay.propertyName} (${stay.city}). Prepare and submit via the official ${systemLabel} portal within 24 hours of arrival.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId: stay.userId,
        propertyId: stay.propertyId,
        type: "regional_due",
        title,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: stay.userId,
          propertyId: stay.propertyId,
          title,
          message,
          type: "regional_due",
        },
      });
      created++;
    }
  }

  for (const stay of alloggiatiStays) {
    const guestRef = stay.guestLabel ? ` (${stay.guestLabel})` : "";
    const title = `Alloggiati due soon: ${stay.propertyName}`;
    const message = `Guest check-in on ${format(stay.checkInDate, "dd/MM/yyyy")}${guestRef} at ${stay.propertyName} (${stay.city}). Prepare and submit the schedina on Alloggiati Web within 24 hours of arrival.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId: stay.userId,
        propertyId: stay.propertyId,
        type: "alloggiati_due",
        title,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: stay.userId,
          propertyId: stay.propertyId,
          title,
          message,
          type: "alloggiati_due",
        },
      });
      created++;
    }
  }

  return NextResponse.json({
    scanned: sesStays.length + regionalStays.length + alloggiatiStays.length,
    sesScanned: sesStays.length,
    regionalScanned: regionalStays.length,
    alloggiatiScanned: alloggiatiStays.length,
    notificationsCreated: created,
  });
}

/** Vercel Cron invokes GET; manual ops may use POST with the same auth. */
export async function GET(request: Request) {
  return POST(request);
}
