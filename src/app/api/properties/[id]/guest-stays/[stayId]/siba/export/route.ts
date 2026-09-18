import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSibaCsvExport } from "@/lib/portugal/export";
import { isPortugalCountry, isPortugalGuestReporting } from "@/lib/portugal/regions";

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

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (!stay.guestRecords.length) {
    return NextResponse.json({ error: "No guest records" }, { status: 400 });
  }

  const csv = buildSibaCsvExport({
    stayId: stay.id,
    checkInDate: stay.checkInDate,
    checkOutDate: stay.checkOutDate,
    guestLabel: stay.guestLabel,
    guests: stay.guestRecords,
    phase,
  });
  const filename = `glint-siba-${phase}-${stay.id.slice(0, 8)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
