import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildRegionalCsvExport,
  validateStayForRegionalExport,
} from "@/lib/spain/regional-export";
import {
  getSpainGuestReportingMode,
  isRegionalSpainReporting,
  isSpainCountry,
} from "@/lib/spain/regions";
import { getOfficialLoginUrl, getOfficialPortalUrl } from "@/lib/spain/official-links";
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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSpainCountry(property.country) || !isRegionalSpainReporting(property.city)) {
    return NextResponse.json({ error: "Regional reporting not applicable" }, { status: 400 });
  }

  const system = getSpainGuestReportingMode(property.city);
  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: {
      guestRecords: true,
      regionalGuestReports: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const latestReport = stay.regionalGuestReports[0] ?? null;

  return NextResponse.json({
    system,
    portalUrl: getOfficialPortalUrl(system),
    loginUrl: getOfficialLoginUrl(system),
    guestCount: stay.guestRecords.length,
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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSpainCountry(property.country) || !isRegionalSpainReporting(property.city)) {
    return NextResponse.json({ error: "Regional reporting not applicable" }, { status: 400 });
  }

  const system = getSpainGuestReportingMode(property.city);
  if (system !== "mossos" && system !== "ertzaintza") {
    return NextResponse.json({ error: "Invalid regional system" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (!stay.guestRecords.length) {
    return NextResponse.json({ error: "No guest records for this stay" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, status, notes } = actionSchema.parse(body);

    if (action === "prepare") {
      const validationErrors = validateStayForRegionalExport(stay.guestRecords);
      const csvPreview = buildRegionalCsvExport(
        {
          stayId: stay.id,
          checkInDate: stay.checkInDate,
          checkOutDate: stay.checkOutDate,
          guestLabel: stay.guestLabel,
          guests: stay.guestRecords,
        },
        system
      );

      const existing = await prisma.regionalGuestReport.findFirst({
        where: { stayId, propertyId: id },
        orderBy: { createdAt: "desc" },
      });

      let report;
      if (existing && existing.status === "prepared") {
        report = await prisma.regionalGuestReport.update({
          where: { id: existing.id },
          data: { preparedAt: new Date(), notes: notes ?? existing.notes },
        });
      } else if (!existing || existing.status !== "submitted" && existing.status !== "accepted") {
        report = await prisma.regionalGuestReport.create({
          data: {
            propertyId: id,
            stayId,
            system,
            status: "prepared",
            notes: notes ?? null,
          },
        });
      } else {
        report = existing;
      }

      return NextResponse.json({
        ready: validationErrors.length === 0,
        validationErrors,
        guestCount: stay.guestRecords.length,
        reportId: report.id,
        status: report.status,
        csvLineCount: csvPreview.split("\n").length - 4,
        portalUrl: getOfficialPortalUrl(system),
        loginUrl: getOfficialLoginUrl(system),
      });
    }

    if (action === "update_status") {
      if (!status) {
        return NextResponse.json({ error: "Status required" }, { status: 400 });
      }

      const now = new Date();
      const existing = await prisma.regionalGuestReport.findFirst({
        where: { stayId, propertyId: id },
        orderBy: { createdAt: "desc" },
      });

      const report = existing
        ? await prisma.regionalGuestReport.update({
            where: { id: existing.id },
            data: {
              status,
              notes: notes ?? existing.notes,
              submittedAt: status === "submitted" || status === "accepted" ? now : existing.submittedAt,
              acceptedAt: status === "accepted" ? now : existing.acceptedAt,
            },
          })
        : await prisma.regionalGuestReport.create({
            data: {
              propertyId: id,
              stayId,
              system,
              status,
              notes: notes ?? null,
              submittedAt: status === "submitted" || status === "accepted" ? now : null,
              acceptedAt: status === "accepted" ? now : null,
            },
          });

      return NextResponse.json({
        reportId: report.id,
        status: report.status,
        submittedAt: report.submittedAt?.toISOString() ?? null,
        acceptedAt: report.acceptedAt?.toISOString() ?? null,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
