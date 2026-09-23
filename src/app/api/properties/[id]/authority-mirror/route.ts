import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultMonthPeriod,
  getAuthorityMirrorLedger,
  listFindings,
  parsePeriodParam,
  rematchPropertyReservations,
  runReconciliation,
} from "@/lib/authority-mirror";
import { recomputeListingHealth } from "@/lib/listing-health";

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { id: true },
  });
}

const reconcileSchema = z.object({
  period: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const periodParam = parsePeriodParam(url.searchParams.get("period"));
  const period = periodParam ?? defaultMonthPeriod();

  const [ledger, findings, imports] = await Promise.all([
    getAuthorityMirrorLedger(id, period.periodStart, period.periodEnd),
    listFindings(id, period.periodStart, period.periodEnd),
    prisma.platformImport.findMany({
      where: { propertyId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        channel: true,
        filename: true,
        rowCount: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    period: {
      start: period.periodStart.toISOString(),
      end: period.periodEnd.toISOString(),
      month: url.searchParams.get("period") ?? undefined,
    },
    ledger,
    findings,
    recentImports: imports.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
  });
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
  const property = await getOwnedProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = reconcileSchema.parse(body);
    const period = parsePeriodParam(data.period ?? null) ?? defaultMonthPeriod();

    await rematchPropertyReservations(id);
    const findings = await runReconciliation(id, period.periodStart, period.periodEnd);
    await recomputeListingHealth(id);

    return NextResponse.json({
      findingsCount: findings.length,
      findings,
      period: {
        start: period.periodStart.toISOString(),
        end: period.periodEnd.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
