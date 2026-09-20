import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAadeCsvExport,
  validateStayForAadeExport,
  AADE_SYSTEM,
} from "@/lib/greece/export";
import {
  getGreeceGuestReportingMode,
  isGreeceCountry,
  isGreeceGuestReporting,
} from "@/lib/greece/regions";
import { getEffectiveGreeceRegistrationNumber } from "@/lib/greece/ama-compliance";
import {
  getAadeDeclarationDeadline,
  getStayNightCount,
  isLongTermStay,
  isShortTermStay,
} from "@/lib/greece/stay-duration";
import { getAadeShortTermHubUrl, getMyAadeUrl } from "@/lib/greece/official-links";
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

  if (!isGreeceCountry(property.country) || !isGreeceGuestReporting(property.country, property.city)) {
    return NextResponse.json({ error: "AADE reporting not applicable" }, { status: 400 });
  }

  const system = getGreeceGuestReportingMode(property.country, property.city);
  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: {
      guestRecords: true,
      regionalGuestReports: {
        where: { system: AADE_SYSTEM },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const latestReport = stay.regionalGuestReports[0];
  const nightCount = getStayNightCount(stay.checkInDate, stay.checkOutDate);
  const longTerm = isLongTermStay(stay.checkInDate, stay.checkOutDate);

  return NextResponse.json({
    system,
    portalUrl: getMyAadeUrl(),
    hubUrl: getAadeShortTermHubUrl(),
    guestCount: stay.guestRecords.length,
    nightCount,
    isLongTerm: longTerm,
    isShortTerm: isShortTermStay(stay.checkInDate, stay.checkOutDate),
    declarationDeadline: longTerm
      ? null
      : getAadeDeclarationDeadline(stay.checkOutDate).toISOString(),
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

  if (!isGreeceCountry(property.country) || !isGreeceGuestReporting(property.country, property.city)) {
    return NextResponse.json({ error: "AADE reporting not applicable" }, { status: 400 });
  }

  const system = getGreeceGuestReportingMode(property.country, property.city);
  if (system !== "aade") {
    return NextResponse.json({ error: "Invalid guest reporting system" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (isLongTermStay(stay.checkInDate, stay.checkOutDate)) {
    return NextResponse.json(
      {
        error: "Long-term stay — use AADE long-term lease declaration",
        isLongTerm: true,
        nightCount: getStayNightCount(stay.checkInDate, stay.checkOutDate),
      },
      { status: 400 }
    );
  }

  if (!stay.guestRecords.length) {
    return NextResponse.json({ error: "No guest records for AADE reporting" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, status, notes } = actionSchema.parse(body);
    const amaNumber = getEffectiveGreeceRegistrationNumber(property.registration);

    if (action === "prepare") {
      const validationErrors = validateStayForAadeExport(stay.guestRecords);
      const csvPreview = buildAadeCsvExport({
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        guestLabel: stay.guestLabel,
        guests: stay.guestRecords,
        amaNumber,
        propertyAddress: property.address,
        propertyCity: property.city,
      });

      const existing = await prisma.regionalGuestReport.findFirst({
        where: {
          stayId,
          propertyId: id,
          system: AADE_SYSTEM,
        },
        orderBy: { createdAt: "desc" },
      });

      let report;
      if (existing && existing.status === "prepared") {
        report = await prisma.regionalGuestReport.update({
          where: { id: existing.id },
          data: { preparedAt: new Date() },
        });
      } else if (!existing || (existing.status !== "submitted" && existing.status !== "accepted")) {
        report = await prisma.regionalGuestReport.create({
          data: {
            propertyId: id,
            stayId,
            system: AADE_SYSTEM,
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
        portalUrl: getMyAadeUrl(),
        hubUrl: getAadeShortTermHubUrl(),
        declarationDeadline: getAadeDeclarationDeadline(stay.checkOutDate).toISOString(),
      });
    }

    if (action === "update_status") {
      if (!status) {
        return NextResponse.json({ error: "Status required" }, { status: 400 });
      }

      const now = new Date();
      const existing = await prisma.regionalGuestReport.findFirst({
        where: {
          stayId,
          propertyId: id,
          system: AADE_SYSTEM,
        },
        orderBy: { createdAt: "desc" },
      });

      const report = existing
        ? await prisma.regionalGuestReport.update({
            where: { id: existing.id },
            data: {
              status,
              submittedAt:
                status === "submitted" || status === "accepted" ? now : existing.submittedAt,
              acceptedAt: status === "accepted" ? now : existing.acceptedAt,
            },
          })
        : await prisma.regionalGuestReport.create({
            data: {
              propertyId: id,
              stayId,
              system: AADE_SYSTEM,
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
