import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildStayNotifyCopyText,
  STAY_NOTIFY_SYSTEM,
} from "@/lib/netherlands/export";
import {
  isNetherlandsCountry,
  requiresNlStayNotification,
} from "@/lib/netherlands/regions";
import { getStayNotificationPortalUrl } from "@/lib/netherlands/official-links";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["prepare", "update_status"]),
  status: z.enum(["prepared", "submitted", "accepted"]).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stayId } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !isNetherlandsCountry(property.country) ||
    !requiresNlStayNotification(property.city)
  ) {
    return NextResponse.json({ error: "Stay notification not applicable" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: {
      guestRecords: true,
      regionalGuestReports: {
        where: { system: STAY_NOTIFY_SYSTEM },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const latestReport = stay.regionalGuestReports[0] ?? null;
  const copyText = buildStayNotifyCopyText({
    registrationNumber: property.registration?.nlRegistrationNumber ?? null,
    permitNumber: property.registration?.nlPermitNumber ?? null,
    checkInDate: stay.checkInDate.toISOString().split("T")[0],
    checkOutDate: stay.checkOutDate.toISOString().split("T")[0],
    guestLabel: stay.guestLabel,
    guestCount: stay.guestRecords.length,
    propertyAddress: property.address,
    city: property.city,
  });

  return NextResponse.json({
    system: STAY_NOTIFY_SYSTEM,
    portalUrl: getStayNotificationPortalUrl(property.city),
    guestCount: stay.guestRecords.length,
    registrationNumber: property.registration?.nlRegistrationNumber ?? null,
    permitNumber: property.registration?.nlPermitNumber ?? null,
    copyText,
    latestStatus: latestReport?.status ?? null,
    latestReportId: latestReport?.id ?? null,
    preparedAt: latestReport?.preparedAt?.toISOString() ?? null,
    submittedAt: latestReport?.submittedAt?.toISOString() ?? null,
    acceptedAt: latestReport?.acceptedAt?.toISOString() ?? null,
    notes: latestReport?.notes ?? null,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stayId } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    !isNetherlandsCountry(property.country) ||
    !requiresNlStayNotification(property.city)
  ) {
    return NextResponse.json({ error: "Stay notification not applicable" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = actionSchema.parse(body);

    if (data.action === "prepare") {
      const report = await prisma.regionalGuestReport.create({
        data: {
          propertyId: id,
          stayId,
          system: STAY_NOTIFY_SYSTEM,
          status: "prepared",
          notes: data.notes ?? "stay_notification",
        },
      });

      return NextResponse.json({
        ready: true,
        reportId: report.id,
        guestCount: stay.guestRecords.length,
        portalUrl: getStayNotificationPortalUrl(property.city),
      });
    }

    if (data.action === "update_status" && data.status) {
      const existing = await prisma.regionalGuestReport.findFirst({
        where: { propertyId: id, stayId, system: STAY_NOTIFY_SYSTEM },
        orderBy: { createdAt: "desc" },
      });

      const now = new Date();
      const report = existing
        ? await prisma.regionalGuestReport.update({
            where: { id: existing.id },
            data: {
              status: data.status,
              submittedAt:
                data.status === "submitted" || data.status === "accepted"
                  ? now
                  : existing.submittedAt,
              acceptedAt: data.status === "accepted" ? now : existing.acceptedAt,
            },
          })
        : await prisma.regionalGuestReport.create({
            data: {
              propertyId: id,
              stayId,
              system: STAY_NOTIFY_SYSTEM,
              status: data.status,
              submittedAt:
                data.status === "submitted" || data.status === "accepted"
                  ? now
                  : null,
              acceptedAt: data.status === "accepted" ? now : null,
              notes: "stay_notification",
            },
          });

      return NextResponse.json({ reportId: report.id, status: report.status });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
