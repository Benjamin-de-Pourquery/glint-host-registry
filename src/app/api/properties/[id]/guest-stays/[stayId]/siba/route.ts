import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildSibaCsvExport,
  filterForeignGuestsForSiba,
  getSibaPhaseFromNotes,
  SIBA_PHASE_NOTES,
  validateStayForSibaExport,
} from "@/lib/portugal/export";
import {
  getPortugalGuestReportingMode,
  isPortugalCountry,
  isPortugalGuestReporting,
} from "@/lib/portugal/regions";
import { getSibaPortalUrl, getSibaFaqUrl } from "@/lib/portugal/official-links";
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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isPortugalCountry(property.country) || !isPortugalGuestReporting(property.city)) {
    return NextResponse.json({ error: "SIBA reporting not applicable" }, { status: 400 });
  }

  const system = getPortugalGuestReportingMode(property.city);
  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: {
      guestRecords: true,
      regionalGuestReports: {
        where: { system: "siba" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const phaseNote = SIBA_PHASE_NOTES[phase];
  const latestReport =
    stay.regionalGuestReports.find((r) => getSibaPhaseFromNotes(r.notes) === phase) ??
    (phase === "arrival" ? stay.regionalGuestReports[0] : null);

  const foreignGuests = filterForeignGuestsForSiba(stay.guestRecords);

  return NextResponse.json({
    system,
    phase,
    portalUrl: getSibaPortalUrl(),
    faqUrl: getSibaFaqUrl(),
    foreignGuestCount: foreignGuests.length,
    totalGuestCount: stay.guestRecords.length,
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

  if (!isPortugalCountry(property.country) || !isPortugalGuestReporting(property.city)) {
    return NextResponse.json({ error: "SIBA reporting not applicable" }, { status: 400 });
  }

  const system = getPortugalGuestReportingMode(property.city);
  if (system !== "siba") {
    return NextResponse.json({ error: "Invalid guest reporting system" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const foreignGuests = filterForeignGuestsForSiba(stay.guestRecords);
  if (!foreignGuests.length) {
    return NextResponse.json(
      { error: "No foreign guest records for SIBA reporting" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { action, status, phase = "arrival", notes } = actionSchema.parse(body);
    const phaseNote = SIBA_PHASE_NOTES[phase];

    if (action === "prepare") {
      const validationErrors = validateStayForSibaExport(stay.guestRecords);
      const csvPreview = buildSibaCsvExport({
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        guestLabel: stay.guestLabel,
        guests: stay.guestRecords,
        phase,
      });

      const existing = await prisma.regionalGuestReport.findFirst({
        where: {
          stayId,
          propertyId: id,
          system: "siba",
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
            system: "siba",
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
        foreignGuestCount: foreignGuests.length,
        reportId: report.id,
        status: report.status,
        phase,
        csvLineCount: csvPreview.split("\n").length - 4,
        portalUrl: getSibaPortalUrl(),
        faqUrl: getSibaFaqUrl(),
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
          system: "siba",
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
              system: "siba",
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
