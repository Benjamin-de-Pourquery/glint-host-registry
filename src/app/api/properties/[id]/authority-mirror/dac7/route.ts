import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  listDac7Overviews,
  runReconciliation,
  upsertDac7Overview,
} from "@/lib/authority-mirror";
import { recomputeListingHealth } from "@/lib/listing-health";

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { id: true },
  });
}

const dac7Schema = z.object({
  year: z.number().int().min(2020).max(2100),
  channel: z.string().min(1),
  listingRef: z.string().nullable().optional(),
  daysRented: z.number().int().min(0),
  q1ConsiderationCents: z.number().int().nullable().optional(),
  q2ConsiderationCents: z.number().int().nullable().optional(),
  q3ConsiderationCents: z.number().int().nullable().optional(),
  q4ConsiderationCents: z.number().int().nullable().optional(),
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
  const year = Number(url.searchParams.get("year") ?? new Date().getFullYear());
  const overviews = await listDac7Overviews(id, year);

  return NextResponse.json({ year, overviews });
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
    const data = dac7Schema.parse(body);
    const overview = await upsertDac7Overview(id, data);

    const periodStart = new Date(data.year, 0, 1);
    const periodEnd = new Date(data.year, 11, 31, 23, 59, 59, 999);
    await runReconciliation(id, periodStart, periodEnd);
    await recomputeListingHealth(id);

    return NextResponse.json({
      overview: {
        id: overview.id,
        year: overview.year,
        channel: overview.channel,
        listingRef: overview.listingRef,
        daysRented: overview.daysRented,
        q1ConsiderationCents: overview.q1ConsiderationCents,
        q2ConsiderationCents: overview.q2ConsiderationCents,
        q3ConsiderationCents: overview.q3ConsiderationCents,
        q4ConsiderationCents: overview.q4ConsiderationCents,
        updatedAt: overview.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
