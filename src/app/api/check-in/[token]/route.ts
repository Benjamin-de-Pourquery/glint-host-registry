import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeRetentionExpiresAt,
  isFrenchNationality,
  type AccompanyingChild,
} from "@/lib/guest-register";
import { z } from "zod";

const childSchema = z.object({
  firstNames: z.string().min(1),
  dateOfBirth: z.string().min(1),
});

const submitSchema = z.object({
  lastName: z.string().min(1).max(200),
  firstNames: z.string().min(1).max(200),
  dateOfBirth: z.string().min(1),
  placeOfBirth: z.string().min(1).max(200),
  nationality: z.string().min(1).max(100),
  usualAddress: z.string().min(1).max(500),
  mobile: z.string().min(1).max(50),
  email: z.string().email().max(200),
  arrivalDate: z.string().min(1),
  departureDate: z.string().min(1),
  signatureDataUrl: z.string().min(1),
  accompanyingChildren: z.array(childSchema).optional(),
  website: z.string().optional(),
});

async function getTokenRecord(token: string) {
  return prisma.guestRegisterToken.findFirst({
    where: { token, enabled: true },
    include: {
      property: {
        select: { id: true, name: true, city: true, country: true },
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const tokenRecord = await getTokenRecord(token);

  if (!tokenRecord) {
    return NextResponse.json({ error: "Invalid or disabled link" }, { status: 404 });
  }

  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  return NextResponse.json({
    propertyName: tokenRecord.property.name,
    propertyCity: tokenRecord.property.city,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const tokenRecord = await getTokenRecord(token);

  if (!tokenRecord) {
    return NextResponse.json({ error: "Invalid or disabled link" }, { status: 404 });
  }

  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }

  try {
    const body = await request.json();
    const data = submitSchema.parse(body);

    if (data.website) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    const isFrench = isFrenchNationality(data.nationality);
    const now = new Date();
    const submittedAt = now;
    const retentionExpiresAt = computeRetentionExpiresAt(submittedAt);

    const children: AccompanyingChild[] = data.accompanyingChildren ?? [];

    const record = await prisma.guestRecord.create({
      data: {
        propertyId: tokenRecord.propertyId,
        lastName: data.lastName.trim(),
        firstNames: data.firstNames.trim(),
        dateOfBirth: new Date(data.dateOfBirth),
        placeOfBirth: data.placeOfBirth.trim(),
        nationality: data.nationality.trim(),
        usualAddress: data.usualAddress.trim(),
        mobile: data.mobile.trim(),
        email: data.email.trim().toLowerCase(),
        arrivalDate: new Date(data.arrivalDate),
        departureDate: new Date(data.departureDate),
        isFrenchNational: isFrench,
        requiresPoliceForm: !isFrench,
        signatureDataUrl: data.signatureDataUrl,
        signedAt: now,
        submittedAt,
        retentionExpiresAt,
        accompanyingChildrenJson:
          children.length > 0 ? JSON.stringify(children) : null,
      },
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
