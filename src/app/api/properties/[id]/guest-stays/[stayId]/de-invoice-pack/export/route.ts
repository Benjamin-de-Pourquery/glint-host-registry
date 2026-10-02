import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildInvoicePackCsv,
  isBusinessStayType,
  parseInvoicePackJson,
} from "@/lib/germany/business-stay";
import { isGermanyCountry } from "@/lib/germany/regions";

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
  });

  if (!property || !isGermanyCountry(property.country)) {
    return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (!isBusinessStayType(stay.stayType)) {
    return NextResponse.json(
      { error: "Invoice data pack is for business or mid-term stays" },
      { status: 400 }
    );
  }

  const pack = parseInvoicePackJson(stay.invoicePackJson);
  const csv = buildInvoicePackCsv({
    stayId: stay.id,
    propertyName: property.name,
    checkIn: stay.checkInDate,
    checkOut: stay.checkOutDate,
    companyName: stay.companyName,
    projectRef: stay.projectRef,
    pack,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoice-data-pack-${stayId.slice(0, 8)}.csv"`,
    },
  });
}
