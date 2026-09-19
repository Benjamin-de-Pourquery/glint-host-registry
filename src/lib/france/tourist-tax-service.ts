import { prisma } from "@/lib/prisma";
import {
  buildDefaultTouristTaxSettings,
  computeTouristTaxSummary,
  countRentalNightsInPeriod,
  enrichPeriod,
  listPeriodBoundsToEnsure,
  touristTaxApplies,
  type CollectionMode,
  type DeclarationCadence,
  type DeclarationChannel,
  type MeubleClassification,
  type TouristTaxPeriodInput,
  type TouristTaxSettingsInput,
  type TouristTaxSummary,
} from "@/lib/france/tourist-tax";

export type TouristTaxSettingsRecord = {
  id: string;
  propertyId: string;
  enabled: boolean;
  collectionMode: string;
  declarationCadence: string;
  portalUrl: string | null;
  classification: string;
  attestationOnFile: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TouristTaxPeriodRecord = {
  id: string;
  propertyId: string;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  nightsInPeriod: number | null;
  declaredAt: Date | null;
  declarationChannel: string | null;
  amountCents: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PropertyTouristTaxContext = {
  propertyId: string;
  country: string;
  settings: TouristTaxSettingsRecord | null;
};

function toSettingsInput(record: TouristTaxSettingsRecord): TouristTaxSettingsInput {
  return {
    enabled: record.enabled,
    collectionMode: record.collectionMode as CollectionMode,
    declarationCadence: record.declarationCadence as DeclarationCadence,
    portalUrl: record.portalUrl,
    classification: record.classification as MeubleClassification,
    attestationOnFile: record.attestationOnFile,
    notes: record.notes,
  };
}

function toPeriodInput(record: TouristTaxPeriodRecord): TouristTaxPeriodInput {
  return {
    id: record.id,
    periodStart: record.periodStart,
    periodEnd: record.periodEnd,
    status: record.status as TouristTaxPeriodInput["status"],
    nightsInPeriod: record.nightsInPeriod,
    declaredAt: record.declaredAt,
    declarationChannel: record.declarationChannel,
    amountCents: record.amountCents,
    notes: record.notes,
  };
}

export async function getOrCreateTouristTaxSettings(
  propertyId: string
): Promise<TouristTaxSettingsRecord> {
  const existing = await prisma.touristTaxSettings.findUnique({
    where: { propertyId },
  });
  if (existing) return existing;

  const defaults = buildDefaultTouristTaxSettings();
  return prisma.touristTaxSettings.create({
    data: {
      propertyId,
      enabled: defaults.enabled,
      collectionMode: defaults.collectionMode,
      declarationCadence: defaults.declarationCadence,
      portalUrl: defaults.portalUrl ?? null,
      classification: defaults.classification,
      attestationOnFile: defaults.attestationOnFile,
      notes: defaults.notes ?? null,
    },
  });
}

export async function ensureTouristTaxPeriods(
  propertyId: string,
  cadence: DeclarationCadence
): Promise<void> {
  const bounds = listPeriodBoundsToEnsure(cadence);
  for (const { periodStart, periodEnd } of bounds) {
    await prisma.touristTaxPeriod.upsert({
      where: {
        propertyId_periodStart: {
          propertyId,
          periodStart,
        },
      },
      create: {
        propertyId,
        periodStart,
        periodEnd,
        status: "upcoming",
      },
      update: {},
    });
  }
}

export async function syncTouristTaxPeriodStatuses(
  propertyId: string,
  settings: TouristTaxSettingsInput,
  stays: Array<{ checkInDate: Date; checkOutDate: Date; importStatus: string | null }>
): Promise<TouristTaxPeriodRecord[]> {
  const periods = await prisma.touristTaxPeriod.findMany({
    where: { propertyId },
    orderBy: { periodStart: "desc" },
    take: 12,
  });

  const now = new Date();
  for (const period of periods) {
    const enriched = enrichPeriod(toPeriodInput(period), settings, now);
    const resolvedNights =
      period.nightsInPeriod ??
      countRentalNightsInPeriod(stays, period.periodStart, period.periodEnd);

    if (period.status !== enriched.status || period.nightsInPeriod !== resolvedNights) {
      await prisma.touristTaxPeriod.update({
        where: { id: period.id },
        data: {
          status: enriched.status,
          nightsInPeriod: resolvedNights,
        },
      });
    }
  }

  return prisma.touristTaxPeriod.findMany({
    where: { propertyId },
    orderBy: { periodStart: "desc" },
    take: 12,
  });
}

export async function loadPropertyTouristTax(
  context: PropertyTouristTaxContext
): Promise<{
  applies: boolean;
  settings: TouristTaxSettingsRecord | null;
  summary: TouristTaxSummary | null;
}> {
  if (!touristTaxApplies(context.country)) {
    return { applies: false, settings: null, summary: null };
  }

  const settings =
    context.settings ?? await getOrCreateTouristTaxSettings(context.propertyId);
  const settingsInput = toSettingsInput(settings);

  await ensureTouristTaxPeriods(
    context.propertyId,
    settingsInput.declarationCadence
  );

  const stays = await prisma.guestStay.findMany({
    where: { propertyId: context.propertyId },
    select: {
      checkInDate: true,
      checkOutDate: true,
      importStatus: true,
    },
  });

  const periods = await syncTouristTaxPeriodStatuses(
    context.propertyId,
    settingsInput,
    stays
  );

  const summary = computeTouristTaxSummary(
    settingsInput,
    periods.map(toPeriodInput),
    stays
  );

  return { applies: true, settings, summary };
}

export async function markTouristTaxPeriodDeclared(
  propertyId: string,
  periodId: string,
  data: {
    declarationChannel?: DeclarationChannel | null;
    amountCents?: number | null;
    notes?: string | null;
  }
): Promise<TouristTaxPeriodRecord | null> {
  const period = await prisma.touristTaxPeriod.findFirst({
    where: { id: periodId, propertyId },
  });
  if (!period) return null;

  return prisma.touristTaxPeriod.update({
    where: { id: periodId },
    data: {
      status: "declared",
      declaredAt: new Date(),
      declarationChannel: data.declarationChannel ?? null,
      amountCents: data.amountCents ?? null,
      notes: data.notes ?? period.notes,
    },
  });
}

export async function getTouristTaxAttentionForUser(userId: string): Promise<
  Array<{
    propertyId: string;
    propertyName: string;
    summary: TouristTaxSummary;
  }>
> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      touristTaxSettings: true,
      touristTaxPeriods: {
        orderBy: { periodStart: "desc" },
        take: 12,
      },
      guestStays: {
        select: {
          checkInDate: true,
          checkOutDate: true,
          importStatus: true,
        },
      },
    },
  });

  const results: Array<{
    propertyId: string;
    propertyName: string;
    summary: TouristTaxSummary;
  }> = [];

  for (const property of properties) {
    if (!touristTaxApplies(property.country)) continue;

    const defaults = buildDefaultTouristTaxSettings();
    const settingsRecord = property.touristTaxSettings ?? {
      ...defaults,
      id: "",
      propertyId: property.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsInput: TouristTaxSettingsInput = property.touristTaxSettings
      ? toSettingsInput(property.touristTaxSettings)
      : defaults;

    if (!settingsInput.enabled) continue;

    const summary = computeTouristTaxSummary(
      settingsInput,
      property.touristTaxPeriods.map(toPeriodInput),
      property.guestStays
    );

    if (summary.attentionCount > 0) {
      results.push({
        propertyId: property.id,
        propertyName: property.name,
        summary,
      });
    }
  }

  return results;
}
