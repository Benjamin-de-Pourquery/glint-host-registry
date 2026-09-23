import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assembleEvidencePackManifest,
  formatPeriodFilename,
  loadEvidencePackData,
  renderEvidencePackPdf,
  resolveEvidencePackPeriod,
  runEvidencePackPrecheck,
  type EvidencePackLocale,
  type EvidencePackPeriodPreset,
} from "@/lib/evidence-pack";

const querySchema = z.object({
  action: z.enum(["precheck"]).optional(),
  preset: z.enum(["90d", "calendar_year", "custom"]).default("90d"),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  locale: z.enum(["en", "fr"]).default("en"),
});

const bodySchema = z.object({
  preset: z.enum(["90d", "calendar_year", "custom"]).default("90d"),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  locale: z.enum(["en", "fr"]).default("en"),
  format: z.enum(["pdf", "manifest", "both"]).default("pdf"),
});

async function authorizeProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { registration: true },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await authorizeProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    action: url.searchParams.get("action") ?? undefined,
    preset: url.searchParams.get("preset") ?? "90d",
    periodStart: url.searchParams.get("periodStart") ?? undefined,
    periodEnd: url.searchParams.get("periodEnd") ?? undefined,
    locale: url.searchParams.get("locale") ?? "en",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { periodStart, periodEnd } = resolveEvidencePackPeriod(
      parsed.data.preset,
      parsed.data.periodStart,
      parsed.data.periodEnd
    );

    const data = await loadEvidencePackData(
      session.user.id,
      id,
      periodStart,
      periodEnd,
      parsed.data.locale as EvidencePackLocale
    );

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (parsed.data.action === "precheck") {
      const warnings = runEvidencePackPrecheck(data);
      return NextResponse.json({
        warnings,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid period";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await authorizeProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = bodySchema.parse(await request.json());
    const { periodStart, periodEnd } = resolveEvidencePackPeriod(
      body.preset as EvidencePackPeriodPreset,
      body.periodStart,
      body.periodEnd
    );

    const data = await loadEvidencePackData(
      session.user.id,
      id,
      periodStart,
      periodEnd,
      body.locale as EvidencePackLocale
    );

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const registrationId = property.registration?.id ?? property.id;
    const manifest = assembleEvidencePackManifest(
      data,
      registrationId,
      periodStart,
      periodEnd,
      body.locale as EvidencePackLocale
    );

    await prisma.evidencePackEvent.create({
      data: {
        registrationId,
        periodStart,
        periodEnd,
        locale: body.locale,
      },
    });

    const baseFilename = formatPeriodFilename(
      property.name,
      periodStart,
      periodEnd
    );

    if (body.format === "manifest") {
      return NextResponse.json(manifest, {
        headers: {
          "Content-Disposition": `attachment; filename="${baseFilename}.json"`,
        },
      });
    }

    const pdfBytes = renderEvidencePackPdf(manifest);

    if (body.format === "both") {
      return NextResponse.json({
        manifest,
        pdfBase64: Buffer.from(pdfBytes).toString("base64"),
        filename: `${baseFilename}.pdf`,
      });
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseFilename}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
