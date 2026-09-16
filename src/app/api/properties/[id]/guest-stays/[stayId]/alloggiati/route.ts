import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAlloggiatiCsvExport,
  validateStayForAlloggiatiExport,
} from "@/lib/italy/export";
import {
  getItalyGuestReportingMode,
  isItalyCountry,
  isItalyGuestReporting,
} from "@/lib/italy/regions";
import { getAlloggiatiLoginUrl, getAlloggiatiPortalUrl } from "@/lib/italy/official-links";
import { submitAlloggiatiSchedine } from "@/lib/italy/alloggiati/submit";
import { checkAlloggiatiRateLimit } from "@/lib/italy/alloggiati/rate-limit";
import { isAlloggiatiLiveEnabled } from "@/lib/italy/alloggiati/config";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["prepare", "update_status", "submit"]),
  status: z.enum(["prepared", "submitted", "accepted"]).optional(),
  mode: z.enum(["dry_run", "live"]).optional(),
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
    include: { alloggiatiCredential: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isItalyCountry(property.country) || !isItalyGuestReporting(property.city)) {
    return NextResponse.json({ error: "Alloggiati reporting not applicable" }, { status: 400 });
  }

  const system = getItalyGuestReportingMode(property.city);
  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: {
      guestRecords: true,
      regionalGuestReports: {
        where: { system: "alloggiati" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  const latestReport = stay.regionalGuestReports[0] ?? null;

  return NextResponse.json({
    system,
    portalUrl: getAlloggiatiPortalUrl(),
    loginUrl: getAlloggiatiLoginUrl(),
    guestCount: stay.guestRecords.length,
    latestStatus: latestReport?.status ?? null,
    latestReportId: latestReport?.id ?? null,
    preparedAt: latestReport?.preparedAt?.toISOString() ?? null,
    submittedAt: latestReport?.submittedAt?.toISOString() ?? null,
    acceptedAt: latestReport?.acceptedAt?.toISOString() ?? null,
    notes: latestReport?.notes ?? null,
    credentialsConfigured: Boolean(property.alloggiatiCredential),
    alloggiatiLiveEnv: isAlloggiatiLiveEnabled(),
    liveSubmitEnabled: property.alloggiatiCredential?.liveSubmitEnabled ?? false,
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

  const rateCheck = checkAlloggiatiRateLimit(session.user.id);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterMs: rateCheck.retryAfterMs },
      { status: 429 }
    );
  }

  const { id, stayId } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { alloggiatiCredential: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isItalyCountry(property.country) || !isItalyGuestReporting(property.city)) {
    return NextResponse.json({ error: "Alloggiati reporting not applicable" }, { status: 400 });
  }

  const system = getItalyGuestReportingMode(property.city);
  if (system !== "alloggiati") {
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
    return NextResponse.json({ error: "No guest records for this stay" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, status, mode, notes } = actionSchema.parse(body);

    if (action === "prepare") {
      const validationErrors = validateStayForAlloggiatiExport(stay.guestRecords);
      const csvPreview = buildAlloggiatiCsvExport({
        stayId: stay.id,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        guestLabel: stay.guestLabel,
        guests: stay.guestRecords,
      });

      const existing = await prisma.regionalGuestReport.findFirst({
        where: { stayId, propertyId: id, system: "alloggiati" },
        orderBy: { createdAt: "desc" },
      });

      let report;
      if (existing && existing.status === "prepared") {
        report = await prisma.regionalGuestReport.update({
          where: { id: existing.id },
          data: { preparedAt: new Date(), notes: notes ?? existing.notes },
        });
      } else if (!existing || (existing.status !== "submitted" && existing.status !== "accepted")) {
        report = await prisma.regionalGuestReport.create({
          data: {
            propertyId: id,
            stayId,
            system: "alloggiati",
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
        portalUrl: getAlloggiatiPortalUrl(),
        loginUrl: getAlloggiatiLoginUrl(),
      });
    }

    if (action === "submit") {
      if (!property.alloggiatiCredential) {
        return NextResponse.json(
          { error: "Alloggiati credentials not configured" },
          { status: 400 }
        );
      }

      const result = await submitAlloggiatiSchedine({
        propertyId: id,
        userId: session.user.id,
        guests: stay.guestRecords,
        mode: mode ?? "dry_run",
      });

      return NextResponse.json({
        mode: result.mode,
        success: result.success,
        schedineCount: result.schedineCount,
        schedineValide: result.schedineValide,
        governmentCode: result.governmentCode,
        governmentMessage: result.governmentMessage,
        governmentDetail: result.governmentDetail,
        dryRunNote: result.dryRunNote,
      });
    }

    if (action === "update_status") {
      if (!status) {
        return NextResponse.json({ error: "Status required" }, { status: 400 });
      }

      const now = new Date();
      const existing = await prisma.regionalGuestReport.findFirst({
        where: { stayId, propertyId: id, system: "alloggiati" },
        orderBy: { createdAt: "desc" },
      });

      const report = existing
        ? await prisma.regionalGuestReport.update({
            where: { id: existing.id },
            data: {
              status,
              notes: notes ?? existing.notes,
              submittedAt:
                status === "submitted" || status === "accepted" ? now : existing.submittedAt,
              acceptedAt: status === "accepted" ? now : existing.acceptedAt,
            },
          })
        : await prisma.regionalGuestReport.create({
            data: {
              propertyId: id,
              stayId,
              system: "alloggiati",
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
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NO_CREDENTIALS") {
        return NextResponse.json({ error: "Alloggiati credentials not configured" }, { status: 400 });
      }
      if (error.message === "NO_ENCRYPTION") {
        return NextResponse.json({ error: "Encryption not configured" }, { status: 503 });
      }
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
