import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultNationalTransitionStatus,
  isFranceCountry,
  NATIONAL_TRANSITION_STATUSES,
} from "@/lib/national-transition";
import { isNetherlandsCountry, resolveNlNightCapSource } from "@/lib/netherlands/regions";
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
  cinNumber: z.string().nullable().optional(),
  cinBdsrStatus: z
    .enum(["not_started", "pending", "active", "rejected"])
    .optional(),
  cinDisplayedOnListings: z.boolean().optional(),
  rnalNumber: z.string().nullable().optional(),
  rnalStatus: z
    .enum(["not_started", "pending", "active", "expired"])
    .optional(),
  rnalDisplayedOnListings: z.boolean().optional(),
  amaNumber: z.string().nullable().optional(),
  amaStatus: z
    .enum(["not_started", "in_progress", "obtained", "displayed", "not_required_esl"])
    .optional(),
  amaDisplayedOnListings: z.boolean().optional(),
  greeceRegistrationKind: z.enum(["ama", "esl", "unique_notification"]).optional(),
  greeceAlternateLicenseNumber: z.string().nullable().optional(),
  atak: z.string().nullable().optional(),
  hrCategorisationNumber: z.string().nullable().optional(),
  hrObjectId: z.string().nullable().optional(),
  hrCategorisationStatus: z
    .enum(["not_started", "pending", "active", "expired"])
    .optional(),
  hrCategorisationDisplayedOnListings: z.boolean().optional(),
  nlRegistrationNumber: z.string().nullable().optional(),
  nlRegistrationStatus: z
    .enum(["not_started", "pending", "active", "expired"])
    .optional(),
  nlRegistrationDisplayedOnListings: z.boolean().optional(),
  nlHolidayPermitStatus: z
    .enum(["not_started", "pending", "active", "expired", "not_required"])
    .optional(),
  nlHolidayPermitExpiry: z.string().nullable().optional(),
  nlPermitNumber: z.string().nullable().optional(),
  nlNeighborhood: z.string().nullable().optional(),
  nlNightCapSource: z
    .enum(["amsterdam_30", "amsterdam_15", "nl_municipal", "none"])
    .optional(),
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

    const nlNeighborhood =
      data.nlNeighborhood !== undefined
        ? data.nlNeighborhood
        : property.registration?.nlNeighborhood ?? null;
    const nlNightCapSource = isNetherlandsCountry(property.country)
      ? (data.nlNightCapSource ??
        resolveNlNightCapSource(property.city, nlNeighborhood))
      : "none";

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
        cinNumber: data.cinNumber ?? null,
        cinBdsrStatus: data.cinBdsrStatus ?? "not_started",
        cinDisplayedOnListings: data.cinDisplayedOnListings ?? false,
        rnalNumber: data.rnalNumber ?? null,
        rnalStatus: data.rnalStatus ?? "not_started",
        rnalDisplayedOnListings: data.rnalDisplayedOnListings ?? false,
        amaNumber: data.amaNumber ?? null,
        amaStatus: data.amaStatus ?? "not_started",
        amaDisplayedOnListings: data.amaDisplayedOnListings ?? false,
        greeceRegistrationKind: data.greeceRegistrationKind ?? "ama",
        greeceAlternateLicenseNumber: data.greeceAlternateLicenseNumber ?? null,
        atak: data.atak ?? null,
        hrCategorisationNumber: data.hrCategorisationNumber ?? null,
        hrObjectId: data.hrObjectId ?? null,
        hrCategorisationStatus: data.hrCategorisationStatus ?? "not_started",
        hrCategorisationDisplayedOnListings:
          data.hrCategorisationDisplayedOnListings ?? false,
        nlRegistrationNumber: data.nlRegistrationNumber ?? null,
        nlRegistrationStatus: data.nlRegistrationStatus ?? "not_started",
        nlRegistrationDisplayedOnListings:
          data.nlRegistrationDisplayedOnListings ?? false,
        nlHolidayPermitStatus: data.nlHolidayPermitStatus ?? "not_started",
        nlHolidayPermitExpiry: data.nlHolidayPermitExpiry
          ? new Date(data.nlHolidayPermitExpiry)
          : null,
        nlPermitNumber: data.nlPermitNumber ?? null,
        nlNeighborhood: nlNeighborhood,
        nlNightCapSource,
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
        cinNumber: data.cinNumber,
        cinBdsrStatus: data.cinBdsrStatus,
        cinDisplayedOnListings: data.cinDisplayedOnListings,
        rnalNumber: data.rnalNumber,
        rnalStatus: data.rnalStatus,
        rnalDisplayedOnListings: data.rnalDisplayedOnListings,
        amaNumber: data.amaNumber,
        amaStatus: data.amaStatus,
        amaDisplayedOnListings: data.amaDisplayedOnListings,
        greeceRegistrationKind: data.greeceRegistrationKind,
        greeceAlternateLicenseNumber: data.greeceAlternateLicenseNumber,
        atak: data.atak,
        hrCategorisationNumber: data.hrCategorisationNumber,
        hrObjectId: data.hrObjectId,
        hrCategorisationStatus: data.hrCategorisationStatus,
        hrCategorisationDisplayedOnListings: data.hrCategorisationDisplayedOnListings,
        nlRegistrationNumber: data.nlRegistrationNumber,
        nlRegistrationStatus: data.nlRegistrationStatus,
        nlRegistrationDisplayedOnListings: data.nlRegistrationDisplayedOnListings,
        nlHolidayPermitStatus: data.nlHolidayPermitStatus,
        nlHolidayPermitExpiry: data.nlHolidayPermitExpiry
          ? new Date(data.nlHolidayPermitExpiry)
          : data.nlHolidayPermitExpiry === null
            ? null
            : undefined,
        nlPermitNumber: data.nlPermitNumber,
        nlNeighborhood: data.nlNeighborhood,
        nlNightCapSource: isNetherlandsCountry(property.country)
          ? (data.nlNightCapSource ??
            (data.nlNeighborhood !== undefined
              ? resolveNlNightCapSource(property.city, data.nlNeighborhood)
              : undefined))
          : undefined,
      },
    });

    return NextResponse.json(registration);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
