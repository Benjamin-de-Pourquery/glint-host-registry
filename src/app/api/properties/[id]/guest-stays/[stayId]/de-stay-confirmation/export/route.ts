import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildStayConfirmationText, isBusinessStayType } from "@/lib/germany/business-stay";
import { isGermanyCountry } from "@/lib/germany/regions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stayId } = await params;
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");
  const locale: "en" | "fr" = localeParam === "fr" ? "fr" : "en";

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
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
      { error: "Stay confirmation export is for business or mid-term stays" },
      { status: 400 }
    );
  }

  const text = buildStayConfirmationText({
    locale,
    propertyName: property.name,
    propertyAddress: property.address,
    propertyCity: property.city,
    registrationNumber: property.registration?.deRegistrationNumber,
    checkIn: stay.checkInDate,
    checkOut: stay.checkOutDate,
    guestLabel: stay.guestLabel,
    companyName: stay.companyName,
    payer: stay.payer,
    projectRef: stay.projectRef,
  });

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="aufenthaltsbestaetigung-${stayId.slice(0, 8)}.txt"`,
    },
  });
}
