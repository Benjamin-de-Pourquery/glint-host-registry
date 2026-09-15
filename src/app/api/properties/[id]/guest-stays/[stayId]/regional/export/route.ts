import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRegionalCsvExport } from "@/lib/spain/regional-export";
import {
  getSpainGuestReportingMode,
  isRegionalSpainReporting,
  isSpainCountry,
} from "@/lib/spain/regions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stayId } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "csv";

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
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (!stay.guestRecords.length) {
    return NextResponse.json({ error: "No guest records" }, { status: 400 });
  }

  const exportData = {
    stayId: stay.id,
    checkInDate: stay.checkInDate,
    checkOutDate: stay.checkOutDate,
    guestLabel: stay.guestLabel,
    guests: stay.guestRecords,
  };

  if (format === "html") {
    return NextResponse.json({
      redirect: `/app/properties/${id}/regional-report/print/${stayId}`,
    });
  }

  const csv = buildRegionalCsvExport(exportData, system);
  const filename = `glint-${system}-${stay.id.slice(0, 8)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
