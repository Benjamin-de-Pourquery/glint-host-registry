import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultNationalTransitionStatus,
  isFranceCountry,
  NATIONAL_TRANSITION_STATUSES,
} from "@/lib/national-transition";
import { z } from "zod";

const schema = z.object({
  registrationNumber: z.string().nullable().optional(),
  issuingAuthority: z.string().nullable().optional(),
  status: z.string().optional(),
  issueDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  nationalRegistrationNumber: z.string().nullable().optional(),
  nationalTransitionStatus: z.enum(NATIONAL_TRANSITION_STATUSES).optional(),
  nationalRenewalDeadline: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const defaultStatus = defaultNationalTransitionStatus(property.country);
    const nationalTransitionStatus = isFranceCountry(property.country)
      ? (data.nationalTransitionStatus ??
        property.registration?.nationalTransitionStatus ??
        defaultStatus)
      : "not_applicable";

    const registration = await prisma.registration.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        registrationNumber: data.registrationNumber,
        issuingAuthority: data.issuingAuthority,
        status: data.status || "not_started",
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes,
        nationalRegistrationNumber: data.nationalRegistrationNumber ?? null,
        nationalTransitionStatus,
        nationalRenewalDeadline: data.nationalRenewalDeadline
          ? new Date(data.nationalRenewalDeadline)
          : null,
      },
      update: {
        registrationNumber: data.registrationNumber,
        issuingAuthority: data.issuingAuthority,
        status: data.status,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        notes: data.notes,
        nationalRegistrationNumber: data.nationalRegistrationNumber,
        nationalTransitionStatus: isFranceCountry(property.country)
          ? nationalTransitionStatus
          : "not_applicable",
        nationalRenewalDeadline: data.nationalRenewalDeadline
          ? new Date(data.nationalRenewalDeadline)
          : data.nationalRenewalDeadline === null
            ? null
            : undefined,
      },
    });

    return NextResponse.json(registration);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
