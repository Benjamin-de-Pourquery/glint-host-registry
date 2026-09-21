import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildEvisitorCsvExport,
  getEvisitorPhaseFromNotes,
  EVISITOR_PHASE_NOTES,
  EVISITOR_SYSTEM,
  validateStayForEvisitorExport,
} from "@/lib/croatia/export";
import {
  getCroatiaGuestReportingMode,
  isCroatiaCountry,
  isCroatiaGuestReporting,
} from "@/lib/croatia/regions";
import { getEvisitorPortalUrl } from "@/lib/croatia/official-links";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["prepare", "update_status"]),
  status: z.enum(["prepared", "submitted", "accepted"]).optional(),
  phase: z.enum(["arrival", "departure"]).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stayId } = await params;
  const url = new URL(request.url);
  const phase = (url.searchParams.get("phase") as "arrival" | "departure") ?? "arrival";

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isCroatiaCountry(property.country) || !isCroatiaGuestReporting(property.city)) {
    return NextResponse.json({ error: "eVisitor reporting not applicable" }, { status: 400 });
  }

  const system = getCroatiaGuestReportingMode(property.city);
  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: {
      guestRecords: true,
      regionalGuestReports: {
        where: { system: EVISITOR_SYSTEM },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const latestReport =
    stay.regionalGuestReports.find((r) => getEvisitorPhaseFromNotes(r.notes) === phase) ??
    (phase === "arrival" ? stay.regionalGuestReports[0] : null);

  return NextResponse.json({
    system,
    phase,
    portalUrl: getEvisitorPortalUrl(),
    guestCount: stay.guestRecords.length,
    hrObjectId: property.registration?.hrObjectId ?? null,
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

  if (!isCroatiaCountry(property.country) || !isCroatiaGuestReporting(property.city)) {
    return NextResponse.json({ error: "eVisitor reporting not applicable" }, { status: 400 });
  }

  const system = getCroatiaGuestReportingMode(property.city);
  if (system !== "evisitor") {
    return NextResponse.json({ error: "Invalid guest reporting system" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (!stay.guestRecords.length) {
    return NextResponse.json({ error: "No guest records for eVisitor reporting" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, status, phase = "arrival" } = actionSchema.parse(body);
    const phaseNote = EVISITOR_PHASE_NOTES[phase];

    if (action === "prepare") {
      const validationErrors = validateStayForEvisitorExport(stay.guestRecords);
      const csvPreview = buildEvisitorCsvExport({
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        guestLabel: stay.guestLabel,
        guests: stay.guestRecords,
        phase,
        hrObjectId: property.registration?.hrObjectId,
        hrCategorisationNumber: property.registration?.hrCategorisationNumber,
      });

      const existing = await prisma.regionalGuestReport.findFirst({
        where: {
          stayId,
          propertyId: id,
          system: EVISITOR_SYSTEM,
          notes: phaseNote,
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
            system: EVISITOR_SYSTEM,
            status: "prepared",
            notes: phaseNote,
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
        phase,
        csvLineCount: csvPreview.split("\n").length - 4,
        portalUrl: getEvisitorPortalUrl(),
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
          system: EVISITOR_SYSTEM,
          notes: phaseNote,
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
              system: EVISITOR_SYSTEM,
              status,
              notes: phaseNote,
              submittedAt: status === "submitted" || status === "accepted" ? now : null,
              acceptedAt: status === "accepted" ? now : null,
            },
          });

      return NextResponse.json({
        reportId: report.id,
        status: report.status,
        phase,
        submittedAt: report.submittedAt?.toISOString() ?? null,
        acceptedAt: report.acceptedAt?.toISOString() ?? null,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
