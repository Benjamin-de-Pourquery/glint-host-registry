import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  resolvePlaybook,
  getPlaybookProgressSummary,
} from "@/lib/playbooks";
import { getEffectiveNextStep } from "@/lib/playbooks/effective-next-step";
import { getSesDueQueueForUser } from "@/lib/ses/due-queue";
import { getAlloggiatiDueQueueForUser } from "@/lib/italy/due-queue";
import { getSibaDueQueueForUser } from "@/lib/portugal/due-queue";
import { getAadeDueQueueForUser } from "@/lib/greece/due-queue";
import { getEvisitorDueQueueForUser } from "@/lib/croatia/due-queue";
import { getStayNotifyDueQueueForUser } from "@/lib/netherlands/due-queue";
import { hasGreeceRegistrationNumber } from "@/lib/greece/ama-compliance";
import {
  hasNlRegistrationNumber,
} from "@/lib/netherlands/registration-compliance";
import {
  hasBeRegistrationNumber,
  isBeDossierComplete,
} from "@/lib/belgium/registration-compliance";
import {
  hasAtRegistrationNumber,
  isAtDossierPrepared,
} from "@/lib/austria/registration-compliance";
import {
  hasCroatiaCategorisationNumber,
  hasCroatiaEvisitorObjectId,
} from "@/lib/croatia/categorisation-compliance";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";
import { getNightCapPriorityAction } from "@/lib/france/night-cap";
import { loadPropertyTouristTax } from "@/lib/france/tourist-tax-service";
import { getTouristTaxPriorityAction } from "@/lib/france/tourist-tax";
import {
  frNerMigrationApplies,
  toFrNerMigrationRecord,
} from "@/lib/fr-ner-migration/service";
import { z } from "zod";

const updateSchema = z.object({
  stepKey: z.string().min(1),
  status: z.enum(["pending", "done", "skipped"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: {
      playbookProgress: true,
      registration: true,
      sesCredential: true,
      nightCapSettings: true,
      touristTaxSettings: true,
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const playbook = resolvePlaybook(property.country, property.city);

  if (!playbook) {
    return NextResponse.json({
      playbook: null,
      progress: [],
      nextStepKey: null,
      summary: { completed: 0, total: 0, skipped: 0 },
    });
  }

  const progress = property.playbookProgress.map((p) => ({
    stepKey: p.stepKey,
    status: p.status,
    completedAt: p.completedAt?.toISOString() ?? null,
  }));

  const residencyStatus = property.residencyStatus as
    | "primary"
    | "secondary"
    | "other"
    | null
    | undefined;

  const sesDueForProperty = (
    await getSesDueQueueForUser(session.user.id)
  ).some((item) => item.propertyId === id);

  const alloggiatiDueForProperty = (
    await getAlloggiatiDueQueueForUser(session.user.id)
  ).some((item) => item.propertyId === id);

  const sibaDueForProperty = (
    await getSibaDueQueueForUser(session.user.id)
  ).some((item) => item.propertyId === id);

  const aadeDueForProperty = (
    await getAadeDueQueueForUser(session.user.id)
  ).some((item) => item.propertyId === id);

  const evisitorDueForProperty = (
    await getEvisitorDueQueueForUser(session.user.id)
  ).some((item) => item.propertyId === id);

  const stayNotifyDueForProperty = (
    await getStayNotifyDueQueueForUser(session.user.id)
  ).some((item) => item.propertyId === id);

  const nightCapResult = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: property.nightCapSettings,
  });

  const touristTaxResult = await loadPropertyTouristTax({
    propertyId: property.id,
    country: property.country,
    settings: property.touristTaxSettings,
  });

  let frNerMigration = null;
  if (frNerMigrationApplies(property.country) && property.registration) {
    const migrationRow = await prisma.frNerMigration.findUnique({
      where: { registrationId: property.registration.id },
    });
    if (migrationRow) {
      frNerMigration = toFrNerMigrationRecord(migrationRow);
    }
  }

  const nextStep = getEffectiveNextStep(playbook, progress, residencyStatus, {
    country: property.country,
    city: property.city,
    registration: property.registration,
    hasActiveStayNeedingSes: sesDueForProperty,
    hasSesCredentials: Boolean(property.sesCredential),
    hasCinNumber: Boolean(property.registration?.cinNumber?.trim()),
    hasActiveStayNeedingAlloggiati: alloggiatiDueForProperty,
    hasRnalNumber: Boolean(property.registration?.rnalNumber?.trim()),
    hasActiveStayNeedingSiba: sibaDueForProperty,
    hasAmaNumber: hasGreeceRegistrationNumber(property.registration),
    amaDisplayedOnListings: Boolean(property.registration?.amaDisplayedOnListings),
    hasActiveStayNeedingAade: aadeDueForProperty,
    hasCategorisationNumber: hasCroatiaCategorisationNumber(property.registration),
    hasEvisitorObjectId: hasCroatiaEvisitorObjectId(property.registration),
    hasActiveStayNeedingEvisitor: evisitorDueForProperty,
    hasNlRegistrationNumber: hasNlRegistrationNumber(property.registration),
    hasNlHolidayPermit:
      property.registration?.nlHolidayPermitStatus === "active" ||
      Boolean(property.registration?.nlPermitNumber?.trim()),
    hasActiveStayNeedingNotification: stayNotifyDueForProperty,
    beRegion: property.registration?.beRegion ?? null,
    hasBeRegistrationNumber: hasBeRegistrationNumber(property.registration),
    isBeDossierComplete: isBeDossierComplete(
      property.registration,
      property.registration?.beRegion as "brussels" | "flanders" | "wallonia" | null
    ),
    beDisplayedOnListings: Boolean(
      property.registration?.beRegistrationDisplayedOnListings
    ),
    atFederalState: property.registration?.atFederalState ?? null,
    hasAtRegistrationNumber: hasAtRegistrationNumber(property.registration),
    isAtDossierPrepared: isAtDossierPrepared(property.registration),
    atDisplayedOnListings: Boolean(
      property.registration?.atRegistrationDisplayedOnListings
    ),
    nightCapComputation: nightCapResult.computation,
    touristTaxSummary: touristTaxResult.summary,
    frNerMigration,
  });
  const summary = getPlaybookProgressSummary(playbook, progress, residencyStatus);

  const touristTaxPriority = touristTaxResult.summary
    ? getTouristTaxPriorityAction(touristTaxResult.summary)
    : null;
  const nightCapPriority = nightCapResult.computation
    ? getNightCapPriorityAction(nightCapResult.computation)
    : null;
  const priorityAction =
    touristTaxPriority?.level === "critical"
      ? touristTaxPriority
      : nightCapPriority?.level === "exceeded" || nightCapPriority?.level === "critical"
        ? nightCapPriority
        : touristTaxPriority ?? nightCapPriority;

  return NextResponse.json({
    playbook,
    progress,
    nextStepKey: nextStep?.key ?? null,
    summary,
    nightCap: nightCapResult.computation,
    touristTax: touristTaxResult.summary,
    priorityAction,
  });
}

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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const playbook = resolvePlaybook(property.country, property.city);
  if (!playbook) {
    return NextResponse.json({ error: "No playbook for property" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const validStep = playbook.steps.some((s) => s.key === data.stepKey);
    if (!validStep) {
      return NextResponse.json({ error: "Invalid step key" }, { status: 400 });
    }

    const updated = await prisma.playbookStepProgress.upsert({
      where: {
        propertyId_stepKey: {
          propertyId: id,
          stepKey: data.stepKey,
        },
      },
      create: {
        propertyId: id,
        stepKey: data.stepKey,
        status: data.status,
        completedAt: data.status === "done" ? new Date() : null,
      },
      update: {
        status: data.status,
        completedAt: data.status === "done" ? new Date() : null,
      },
    });

    return NextResponse.json({
      stepKey: updated.stepKey,
      status: updated.status,
      completedAt: updated.completedAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
