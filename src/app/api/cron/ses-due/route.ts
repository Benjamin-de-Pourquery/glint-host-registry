import { NextResponse } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSesStaysEnteringSubmissionWindow } from "@/lib/ses/due-queue";
import { getRegionalStaysEnteringSubmissionWindow } from "@/lib/spain/regional-due-queue";
import { getRegionalSystemLabel } from "@/lib/spain/regions";
import { getAlloggiatiStaysEnteringSubmissionWindow } from "@/lib/italy/due-queue";
import { getSibaStaysEnteringSubmissionWindow } from "@/lib/portugal/due-queue";
import { getAadeStaysEnteringSubmissionWindow } from "@/lib/greece/due-queue";

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
  const sibaStays = await getSibaStaysEnteringSubmissionWindow();
  const aadeStays = await getAadeStaysEnteringSubmissionWindow();
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

  for (const stay of sibaStays) {
    const guestRef = stay.guestLabel ? ` (${stay.guestLabel})` : "";
    const phaseLabel = stay.phase === "arrival" ? "arrival" : "departure";
    const title = `SIBA ${phaseLabel} due soon: ${stay.propertyName}`;
    const message = `Foreign guest ${phaseLabel} on ${format(stay.eventDate, "dd/MM/yyyy")}${guestRef} at ${stay.propertyName} (${stay.city}). Prepare and submit the Boletim de Alojamento on SIBA within 3 working days.`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId: stay.userId,
        propertyId: stay.propertyId,
        type: "siba_due",
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
          type: "siba_due",
        },
      });
      created++;
    }
  }

  for (const stay of aadeStays) {
    const guestRef = stay.guestLabel ? ` (${stay.guestLabel})` : "";
    const title = `AADE declaration due soon: ${stay.propertyName}`;
    const message = `Guest checkout on ${format(stay.checkOutDate, "dd/MM/yyyy")}${guestRef} at ${stay.propertyName} (${stay.city}). Submit the Short-Term Stay Declaration on myAADE by ${format(stay.deadline, "dd/MM/yyyy")} (20th of month after departure).`;

    const existing = await prisma.notification.findFirst({
      where: {
        userId: stay.userId,
        propertyId: stay.propertyId,
        type: "aade_due",
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
          type: "aade_due",
        },
      });
      created++;
    }
  }

  return NextResponse.json({
    scanned:
      sesStays.length +
      regionalStays.length +
      alloggiatiStays.length +
      sibaStays.length +
      aadeStays.length,
    sesScanned: sesStays.length,
    regionalScanned: regionalStays.length,
    alloggiatiScanned: alloggiatiStays.length,
    sibaScanned: sibaStays.length,
    aadeScanned: aadeStays.length,
    notificationsCreated: created,
  });
}

/** Vercel Cron invokes GET; manual ops may use POST with the same auth. */
export async function GET(request: Request) {
  return POST(request);
}
