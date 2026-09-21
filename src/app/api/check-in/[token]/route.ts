import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeRetentionExpiresAt,
  isFrenchNationality,
  type AccompanyingChild,
} from "@/lib/guest-register";
import { findMatchingStayForRecord } from "@/lib/guest-register/missing-fiches";
import { isValidSignatureDataUrl } from "@/lib/security/signature-data-url";
import { isCheckInRateLimited } from "@/lib/security/rate-limit";
import { validateCheckInForSes } from "@/lib/ses/check-in-validation";
import { isSpainCountry, requiresAnnexOneCheckIn } from "@/lib/spain/regions";
import { isItalyCountry, requiresAlloggiatiCheckIn } from "@/lib/italy/regions";
import { validateCheckInForAlloggiati } from "@/lib/italy/check-in-validation";
import { isPortugalCountry, requiresSibaCheckIn } from "@/lib/portugal/regions";
import { validateCheckInForSiba } from "@/lib/portugal/check-in-validation";
import { isGreeceCountry, requiresAadeCheckIn } from "@/lib/greece/regions";
import { validateCheckInForAade } from "@/lib/greece/check-in-validation";
import { isCroatiaCountry, requiresEvisitorCheckIn } from "@/lib/croatia/regions";
import { validateCheckInForEvisitor } from "@/lib/croatia/check-in-validation";
import { z } from "zod";

const childSchema = z.object({
  firstNames: z.string().min(1),
  dateOfBirth: z.string().min(1),
  kinship: z.string().max(5).optional(),
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
  documentType: z.string().max(5).optional(),
  documentNumber: z.string().max(15).optional(),
  documentSupport: z.string().max(9).optional(),
  sex: z.string().max(1).optional(),
  kinship: z.string().max(5).optional(),
  postalCode: z.string().max(20).optional(),
  municipalityCode: z.string().max(5).optional(),
  municipalityName: z.string().max(100).optional(),
  addressCountryAlpha3: z.string().max(3).optional(),
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
    propertyCountry: tokenRecord.property.country,
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

  if (await isCheckInRateLimited(tokenRecord.propertyId)) {
    return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const data = submitSchema.parse(body);

    if (data.website) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    if (!isValidSignatureDataUrl(data.signatureDataUrl)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const property = tokenRecord.property;
    const annexOneRequired =
      isSpainCountry(property.country) && requiresAnnexOneCheckIn(property.city);
    const alloggiatiRequired =
      isItalyCountry(property.country) && requiresAlloggiatiCheckIn(property.city);
    const sibaRequired =
      isPortugalCountry(property.country) && requiresSibaCheckIn(property.city);
    const aadeRequired =
      isGreeceCountry(property.country) && requiresAadeCheckIn(property.country, property.city);
    const evisitorRequired =
      isCroatiaCountry(property.country) && requiresEvisitorCheckIn(property.city);

    if (annexOneRequired) {
      const validationErrors = validateCheckInForSes(data);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", validationErrors },
          { status: 400 }
        );
      }
    }

    if (alloggiatiRequired) {
      const validationErrors = validateCheckInForAlloggiati(data);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", validationErrors },
          { status: 400 }
        );
      }
    }

    if (sibaRequired) {
      const validationErrors = validateCheckInForSiba(data);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", validationErrors },
          { status: 400 }
        );
      }
    }

    if (aadeRequired) {
      const validationErrors = validateCheckInForAade(data);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", validationErrors },
          { status: 400 }
        );
      }
    }

    if (evisitorRequired) {
      const validationErrors = validateCheckInForEvisitor(data);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", validationErrors },
          { status: 400 }
        );
      }
    }

    const isFrench = isFrenchNationality(data.nationality);
    const now = new Date();
    const submittedAt = now;
    const retentionExpiresAt = computeRetentionExpiresAt(submittedAt);

    const children: AccompanyingChild[] = data.accompanyingChildren ?? [];
    const arrivalDate = new Date(data.arrivalDate);
    const requiresPoliceForm = !isFrench;

    const stayId = await findMatchingStayForRecord(
      tokenRecord.propertyId,
      arrivalDate,
      requiresPoliceForm
    );

    const record = await prisma.guestRecord.create({
      data: {
        propertyId: tokenRecord.propertyId,
        stayId,
        lastName: data.lastName.trim(),
        firstNames: data.firstNames.trim(),
        dateOfBirth: new Date(data.dateOfBirth),
        placeOfBirth: data.placeOfBirth.trim(),
        nationality: data.nationality.trim(),
        usualAddress: data.usualAddress.trim(),
        mobile: data.mobile.trim(),
        email: data.email.trim().toLowerCase(),
        arrivalDate,
        departureDate: new Date(data.departureDate),
        isFrenchNational: isFrench,
        requiresPoliceForm,
        signatureDataUrl: data.signatureDataUrl,
        signedAt: now,
        submittedAt,
        retentionExpiresAt,
        accompanyingChildrenJson:
          children.length > 0 ? JSON.stringify(children) : null,
        documentType: data.documentType?.trim() || null,
        documentNumber: data.documentNumber?.trim() || null,
        documentSupport: data.documentSupport?.trim() || null,
        sex: data.sex?.trim().toUpperCase() || null,
        kinship: data.kinship?.trim() || null,
        postalCode: data.postalCode?.trim() || null,
        municipalityCode: data.municipalityCode?.trim() || null,
        municipalityName: data.municipalityName?.trim() || null,
        addressCountryAlpha3: data.addressCountryAlpha3?.trim().toUpperCase() || null,
      },
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
