import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  applyFrNerMigrationPatch,
  buildInitialMigrationData,
  frNerMigrationApplies,
  toFrNerMigrationRecord,
} from "@/lib/fr-ner-migration/service";
import {
  migrationAlreadyCompleteBody,
  migrationNotFoundBody,
  shouldRejectFrNerMigrationPatch,
} from "@/lib/fr-ner-migration/route-errors";
import { frNerMigrationPatchSchema } from "@/lib/fr-ner-migration/patch-schema";

async function ensureMigrationForProperty(propertyId: string, country: string) {
  const registration = await prisma.registration.upsert({
    where: { propertyId },
    create: {
      propertyId,
      nationalTransitionStatus: frNerMigrationApplies(country)
        ? "awaiting_portal"
        : "not_applicable",
    },
    update: {},
    include: { frNerMigration: true },
  });

  if (!registration.frNerMigration && frNerMigrationApplies(country)) {
    const created = await prisma.frNerMigration.create({
      data: {
        registrationId: registration.id,
        ...buildInitialMigrationData(registration),
      },
    });
    return { registration, migration: created };
  }

  return { registration, migration: registration.frNerMigration };
}

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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!frNerMigrationApplies(property.country)) {
    return NextResponse.json({ applies: false, migration: null });
  }

  const { migration } = await ensureMigrationForProperty(property.id, property.country);
  if (!migration) {
    return NextResponse.json(migrationNotFoundBody(), { status: 404 });
  }

  return NextResponse.json({
    applies: true,
    migration: toFrNerMigrationRecord(migration),
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

  if (!frNerMigrationApplies(property.country)) {
    return NextResponse.json(
      { error: "NER migration applies only to French properties" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = frNerMigrationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data = parsed.data;

  const { registration, migration } = await ensureMigrationForProperty(
    property.id,
    property.country
  );

  if (!migration) {
    return NextResponse.json(migrationNotFoundBody(), { status: 404 });
  }

  const current = toFrNerMigrationRecord(migration);
  const rejectCode = shouldRejectFrNerMigrationPatch(current, data);
  if (rejectCode === "migration_already_complete") {
    return NextResponse.json(migrationAlreadyCompleteBody(), { status: 409 });
  }

  const { record, registrationSync } = applyFrNerMigrationPatch(current, data);

  const updated = await prisma.frNerMigration.update({
    where: { id: migration.id },
    data: {
      status: record.status,
      localRegistrationNumber: record.localRegistrationNumber,
      localIssuingCommune: record.localIssuingCommune,
      nerNumber: record.nerNumber,
      nerIssuedAt: record.nerIssuedAt ? new Date(record.nerIssuedAt) : null,
      transitionEndsAt: record.transitionEndsAt
        ? new Date(record.transitionEndsAt)
        : null,
      documentsChecklist: JSON.stringify(record.documentsChecklist),
      channelUpdatesChecklist: JSON.stringify(record.channelUpdatesChecklist),
      notifyOnPortalOpen: record.notifyOnPortalOpen,
      wizardStep: record.wizardStep,
    },
  });

  if (registrationSync) {
    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        registrationNumber: registrationSync.registrationNumber,
        issuingAuthority: registrationSync.issuingAuthority,
        nationalRegistrationNumber: registrationSync.nationalRegistrationNumber,
        ...(registrationSync.nationalTransitionStatus
          ? { nationalTransitionStatus: registrationSync.nationalTransitionStatus }
          : {}),
      },
    });
  }

  return NextResponse.json({
    applies: true,
    migration: toFrNerMigrationRecord(updated),
  });
}
