import { NextResponse } from "next/server";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getSesStaysEnteringSubmissionWindow } from "@/lib/ses/due-queue";

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

  const stays = await getSesStaysEnteringSubmissionWindow();
  let created = 0;

  for (const stay of stays) {
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

  return NextResponse.json({
    scanned: stays.length,
    notificationsCreated: created,
  });
}

/** Vercel Cron invokes GET; manual ops may use POST with the same auth. */
export async function GET(request: Request) {
  return POST(request);
}
