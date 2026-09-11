import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseAccompanyingChildren } from "@/lib/guest-register";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, recordId } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const record = await prisma.guestRecord.findFirst({
    where: { id: recordId, propertyId: id },
  });

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: record.id,
    propertyName: property.name,
    propertyCity: property.city,
    lastName: record.lastName,
    firstNames: record.firstNames,
    dateOfBirth: record.dateOfBirth.toISOString(),
    placeOfBirth: record.placeOfBirth,
    nationality: record.nationality,
    usualAddress: record.usualAddress,
    mobile: record.mobile,
    email: record.email,
    arrivalDate: record.arrivalDate.toISOString(),
    departureDate: record.departureDate.toISOString(),
    isFrenchNational: record.isFrenchNational,
    requiresPoliceForm: record.requiresPoliceForm,
    signatureDataUrl: record.signatureDataUrl,
    signedAt: record.signedAt?.toISOString() ?? null,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    retentionExpiresAt: record.retentionExpiresAt?.toISOString() ?? null,
    accompanyingChildren: parseAccompanyingChildren(record.accompanyingChildrenJson),
  });
}
