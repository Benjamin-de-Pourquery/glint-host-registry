import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultMonthPeriod,
  listFindings,
  parsePeriodParam,
  resolveFinding,
} from "@/lib/authority-mirror";
import { recomputeListingHealth } from "@/lib/listing-health";

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { id: true },
  });
}

const resolveSchema = z.object({
  findingId: z.string().min(1),
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
  const period = parsePeriodParam(url.searchParams.get("period")) ?? defaultMonthPeriod();
  const findings = await listFindings(id, period.periodStart, period.periodEnd);

  return NextResponse.json({ findings });
}

export async function PATCH(
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
    const data = resolveSchema.parse(body);
    const ok = await resolveFinding(data.findingId, id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await recomputeListingHealth(id);
    return NextResponse.json({ resolved: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
