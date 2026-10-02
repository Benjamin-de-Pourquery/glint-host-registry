import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultNationalTransitionStatus,
  isFranceCountry,
  NATIONAL_TRANSITION_STATUSES,
} from "@/lib/national-transition";
import { isNetherlandsCountry, resolveNlNightCapSource } from "@/lib/netherlands/regions";
import { isBelgiumCountry, getBelgiumRegion } from "@/lib/belgium/regions";
import { isAustriaCountry, getAustriaFederalState } from "@/lib/austria/regions";
import { isGermanyCountry, getGermanyFederalState } from "@/lib/germany/regions";
import {
  isSpainCountry,
  getSpainAutonomousCommunity,
} from "@/lib/spain/regions";
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
  beRegistrationNumber: z.string().nullable().optional(),
  beRegistrationStatus: z
    .enum(["not_started", "dossier_in_progress", "active", "expired", "unknown"])
    .optional(),
  beRegistrationDisplayedOnListings: z.boolean().optional(),
  beRegion: z.enum(["brussels", "flanders", "wallonia"]).nullable().optional(),
  beOperatorCategory: z.enum(["private", "professional"]).nullable().optional(),
  beFireSafetyStatus: z
    .enum(["not_started", "pending", "valid", "expired"])
    .optional(),
  beInsuranceStatus: z
    .enum(["not_started", "pending", "valid", "expired"])
    .optional(),
  beUrbanPlanningStatus: z
    .enum(["not_started", "pending", "valid", "expired"])
    .optional(),
  beDossierSubmittedAt: z.string().nullable().optional(),
  atRegistrationNumber: z.string().nullable().optional(),
  atRegistrationStatus: z
    .enum([
      "not_started",
      "dossier_in_progress",
      "pending",
      "active",
      "expired",
      "unknown",
    ])
    .optional(),
  atRegistrationDisplayedOnListings: z.boolean().optional(),
  atFederalState: z.enum(["vienna", "other"]).nullable().optional(),
  atOperatorCategory: z.enum(["natural", "legal"]).nullable().optional(),
  atDossierPreparedAt: z.string().nullable().optional(),
  atTransitionDeadline: z.string().nullable().optional(),
  deRegistrationNumber: z.string().nullable().optional(),
  deRegistrationStatus: z
    .enum([
      "not_started",
      "dossier_in_progress",
      "awaiting_registration_portal",
      "pending",
      "active",
      "expired",
      "unknown",
    ])
    .optional(),
  deRegistrationDisplayedOnListings: z.boolean().optional(),
  deFederalState: z.enum(["berlin", "bayern", "other"]).nullable().optional(),
  deCityOrDistrict: z.string().nullable().optional(),
  deOperatorCategory: z
    .enum([
      "hauptwohnung",
      "nebenwohnung",
      "partial_main",
      "private_room",
      "whole_unit",
      "commercial",
      "other",
    ])
    .nullable()
    .optional(),
  dePermitType: z
    .enum([
      "genehmigung",
      "anzeige_49pct",
      "negativattest",
      "pending_eu_number",
      "zes_genehmigung_8w",
      "zes_5a_registration",
      "other",
    ])
    .nullable()
    .optional(),
  deDossierPreparedAt: z.string().nullable().optional(),
  deTransitionDeadline: z.string().nullable().optional(),
  deRegistrationHolderName: z.string().nullable().optional(),
  deRegistrationHolderType: z.enum(["natural", "legal"]).nullable().optional(),
  deHostChangeFlagged: z.boolean().optional(),
  deMonteurKitChecklistJson: z.string().optional(),
  deCompanyAgreementChecklistJson: z.string().optional(),
  esRegistrationNumber: z.string().nullable().optional(),
  esRegistrationStatus: z
    .enum([
      "not_started",
      "dossier_in_progress",
      "pending",
      "active",
      "expired",
      "unknown",
    ])
    .optional(),
  esRegistrationDisplayedOnListings: z.boolean().optional(),
  esAutonomousCommunity: z
    .enum(["catalonia", "madrid", "valencian", "other"])
    .nullable()
    .optional(),
  esLicenseKind: z.enum(["hut", "vut", "other"]).nullable().optional(),
  esDossierPreparedAt: z.string().nullable().optional(),
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

    const beRegion =
      data.beRegion !== undefined
        ? data.beRegion
        : isBelgiumCountry(property.country)
          ? property.registration?.beRegion ??
            (() => {
              const inferred = getBelgiumRegion(property.city);
              return inferred === "unknown" ? null : inferred;
            })()
          : null;

    const atFederalState =
      data.atFederalState !== undefined
        ? data.atFederalState
        : isAustriaCountry(property.country)
          ? property.registration?.atFederalState ??
            (() => {
              const inferred = getAustriaFederalState(property.city);
              return inferred === "unknown" ? null : inferred;
            })()
          : null;

    const deFederalState =
      data.deFederalState !== undefined
        ? data.deFederalState
        : isGermanyCountry(property.country)
          ? property.registration?.deFederalState ??
            (() => {
              const inferred = getGermanyFederalState(property.city);
              return inferred === "unknown" ? null : inferred;
            })()
          : null;

    const deCityOrDistrict =
      data.deCityOrDistrict !== undefined
        ? data.deCityOrDistrict
        : property.registration?.deCityOrDistrict ?? null;

    const esAutonomousCommunity =
      data.esAutonomousCommunity !== undefined
        ? data.esAutonomousCommunity
        : isSpainCountry(property.country)
          ? property.registration?.esAutonomousCommunity ??
            (() => {
              const inferred = getSpainAutonomousCommunity(property.city);
              if (inferred === "catalonia") return "catalonia";
              if (inferred === "madrid") return "madrid";
              if (inferred === "other") return "other";
              return null;
            })()
          : null;

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
        beRegistrationNumber: data.beRegistrationNumber ?? null,
        beRegistrationStatus: data.beRegistrationStatus ?? "not_started",
        beRegistrationDisplayedOnListings:
          data.beRegistrationDisplayedOnListings ?? false,
        beRegion,
        beOperatorCategory: data.beOperatorCategory ?? null,
        beFireSafetyStatus: data.beFireSafetyStatus ?? "not_started",
        beInsuranceStatus: data.beInsuranceStatus ?? "not_started",
        beUrbanPlanningStatus: data.beUrbanPlanningStatus ?? "not_started",
        beDossierSubmittedAt: data.beDossierSubmittedAt
          ? new Date(data.beDossierSubmittedAt)
          : null,
        atRegistrationNumber: data.atRegistrationNumber ?? null,
        atRegistrationStatus: data.atRegistrationStatus ?? "not_started",
        atRegistrationDisplayedOnListings:
          data.atRegistrationDisplayedOnListings ?? false,
        atFederalState,
        atOperatorCategory: data.atOperatorCategory ?? null,
        atDossierPreparedAt: data.atDossierPreparedAt
          ? new Date(data.atDossierPreparedAt)
          : null,
        atTransitionDeadline: data.atTransitionDeadline
          ? new Date(data.atTransitionDeadline)
          : null,
        deRegistrationNumber: data.deRegistrationNumber ?? null,
        deRegistrationStatus: data.deRegistrationStatus ?? "not_started",
        deRegistrationDisplayedOnListings:
          data.deRegistrationDisplayedOnListings ?? false,
        deFederalState,
        deCityOrDistrict: deCityOrDistrict,
        deOperatorCategory: data.deOperatorCategory ?? null,
        dePermitType: data.dePermitType ?? null,
        deDossierPreparedAt: data.deDossierPreparedAt
          ? new Date(data.deDossierPreparedAt)
          : null,
        deTransitionDeadline: data.deTransitionDeadline
          ? new Date(data.deTransitionDeadline)
          : null,
        deRegistrationHolderName: data.deRegistrationHolderName ?? null,
        deRegistrationHolderType: data.deRegistrationHolderType ?? null,
        deHostChangeFlagged: data.deHostChangeFlagged ?? false,
        deMonteurKitChecklistJson: data.deMonteurKitChecklistJson ?? "[]",
        deCompanyAgreementChecklistJson: data.deCompanyAgreementChecklistJson ?? "[]",
        esRegistrationNumber: data.esRegistrationNumber ?? null,
        esRegistrationStatus: data.esRegistrationStatus ?? "not_started",
        esRegistrationDisplayedOnListings:
          data.esRegistrationDisplayedOnListings ?? false,
        esAutonomousCommunity,
        esLicenseKind: data.esLicenseKind ?? null,
        esDossierPreparedAt: data.esDossierPreparedAt
          ? new Date(data.esDossierPreparedAt)
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
        beRegistrationNumber: data.beRegistrationNumber,
        beRegistrationStatus: data.beRegistrationStatus,
        beRegistrationDisplayedOnListings: data.beRegistrationDisplayedOnListings,
        beRegion: data.beRegion !== undefined ? data.beRegion : beRegion,
        beOperatorCategory: data.beOperatorCategory,
        beFireSafetyStatus: data.beFireSafetyStatus,
        beInsuranceStatus: data.beInsuranceStatus,
        beUrbanPlanningStatus: data.beUrbanPlanningStatus,
        beDossierSubmittedAt: data.beDossierSubmittedAt
          ? new Date(data.beDossierSubmittedAt)
          : data.beDossierSubmittedAt === null
            ? null
            : undefined,
        atRegistrationNumber: data.atRegistrationNumber,
        atRegistrationStatus: data.atRegistrationStatus,
        atRegistrationDisplayedOnListings: data.atRegistrationDisplayedOnListings,
        atFederalState: data.atFederalState !== undefined ? data.atFederalState : atFederalState,
        atOperatorCategory: data.atOperatorCategory,
        atDossierPreparedAt: data.atDossierPreparedAt
          ? new Date(data.atDossierPreparedAt)
          : data.atDossierPreparedAt === null
            ? null
            : undefined,
        atTransitionDeadline: data.atTransitionDeadline
          ? new Date(data.atTransitionDeadline)
          : data.atTransitionDeadline === null
            ? null
            : undefined,
        deRegistrationNumber: data.deRegistrationNumber,
        deRegistrationStatus: data.deRegistrationStatus,
        deRegistrationDisplayedOnListings: data.deRegistrationDisplayedOnListings,
        deFederalState: data.deFederalState !== undefined ? data.deFederalState : deFederalState,
        deCityOrDistrict:
          data.deCityOrDistrict !== undefined ? data.deCityOrDistrict : deCityOrDistrict,
        deOperatorCategory: data.deOperatorCategory,
        dePermitType: data.dePermitType,
        deDossierPreparedAt: data.deDossierPreparedAt
          ? new Date(data.deDossierPreparedAt)
          : data.deDossierPreparedAt === null
            ? null
            : undefined,
        deTransitionDeadline: data.deTransitionDeadline
          ? new Date(data.deTransitionDeadline)
          : data.deTransitionDeadline === null
            ? null
            : undefined,
        deRegistrationHolderName: data.deRegistrationHolderName,
        deRegistrationHolderType: data.deRegistrationHolderType,
        deHostChangeFlagged: data.deHostChangeFlagged,
        deMonteurKitChecklistJson: data.deMonteurKitChecklistJson,
        deCompanyAgreementChecklistJson: data.deCompanyAgreementChecklistJson,
        esRegistrationNumber: data.esRegistrationNumber,
        esRegistrationStatus: data.esRegistrationStatus,
        esRegistrationDisplayedOnListings: data.esRegistrationDisplayedOnListings,
        esAutonomousCommunity:
          data.esAutonomousCommunity !== undefined ? data.esAutonomousCommunity : esAutonomousCommunity,
        esLicenseKind: data.esLicenseKind,
        esDossierPreparedAt: data.esDossierPreparedAt
          ? new Date(data.esDossierPreparedAt)
          : data.esDossierPreparedAt === null
            ? null
            : undefined,
      },
    });

    return NextResponse.json(registration);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
