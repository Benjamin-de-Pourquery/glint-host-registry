import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAadeCsvExport } from "@/lib/greece/export";
import {
  isGreeceCountry,
  isGreeceGuestReporting,
} from "@/lib/greece/regions";
import { getEffectiveGreeceRegistrationNumber } from "@/lib/greece/ama-compliance";
import { isLongTermStay } from "@/lib/greece/stay-duration";

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
    return NextResponse.json({ error: "AADE export not applicable" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay || !stay.guestRecords.length) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (isLongTermStay(stay.checkInDate, stay.checkOutDate)) {
    return NextResponse.json(
      { error: "Long-term stay — not eligible for short-term declaration export" },
      { status: 400 }
    );
  }

  const csv = buildAadeCsvExport({
    stayId: stay.id,
    checkInDate: stay.checkInDate,
    checkOutDate: stay.checkOutDate,
    guestLabel: stay.guestLabel,
    guests: stay.guestRecords,
    amaNumber: getEffectiveGreeceRegistrationNumber(property.registration),
    propertyAddress: property.address,
    propertyCity: property.city,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aade-declaration-${stayId.slice(0, 8)}.csv"`,
    },
  });
}
