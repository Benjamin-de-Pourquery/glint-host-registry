import { prisma } from "@/lib/prisma";
import {
  buildDefaultNightCapSettings,
  computeNightCapStatus,
  nightCapApplies,
  type NightCapComputation,
  type NightCapSettingsInput,
  type NightCapSource,
} from "@/lib/france/night-cap";
import { isNetherlandsCountry } from "@/lib/netherlands/regions";
import {
  buildDefaultNlNightCapSettings,
  computeNlNightCapStatus,
} from "@/lib/netherlands/night-cap";

export type NightCapSettingsRecord = {
  id: string;
  propertyId: string;
  nightCapEnabled: boolean;
  nightCapLimit: number;
  nightCapYear: number;
  nightCapSource: string;
  notes: string | null;
  nightsUsedYtd: number | null;
  lastComputedAt: Date | null;
};

export type PropertyNightCapContext = {
  propertyId: string;
  country: string;
  city: string;
  residencyStatus: string | null;
  settings: NightCapSettingsRecord | null;
};

export async function getOrCreateNightCapSettings(
  propertyId: string,
  city: string
): Promise<NightCapSettingsRecord> {
  const existing = await prisma.nightCapSettings.findUnique({
    where: { propertyId },
  });

  if (existing) {
    return existing;
  }

  const defaults = buildDefaultNightCapSettings(city);
  const created = await prisma.nightCapSettings.create({
    data: {
      propertyId,
      nightCapEnabled: defaults.nightCapEnabled,
      nightCapLimit: defaults.nightCapLimit,
      nightCapYear: defaults.nightCapYear,
      nightCapSource: defaults.nightCapSource,
      notes: defaults.notes ?? null,
    },
  });

  return created;
}

export async function loadPropertyNightCap(
  context: PropertyNightCapContext,
  wijkKey?: string | null
): Promise<{ applies: boolean; settings: NightCapSettingsRecord | null; computation: NightCapComputation | null }> {
  if (!nightCapApplies(context.country, context.residencyStatus, context.city)) {
    return { applies: false, settings: null, computation: null };
  }

  if (isNetherlandsCountry(context.country)) {
    const registration = await prisma.registration.findUnique({
      where: { propertyId: context.propertyId },
      select: { nlNeighborhood: true, nlNightCapSource: true },
    });
    const neighborhood = wijkKey ?? registration?.nlNeighborhood ?? null;

    const stays = await prisma.guestStay.findMany({
      where: { propertyId: context.propertyId },
      select: {
        checkInDate: true,
        checkOutDate: true,
        importStatus: true,
      },
    });

    const defaults = buildDefaultNlNightCapSettings(context.city, neighborhood);
    let settings = context.settings;

    if (!settings) {
      settings = await prisma.nightCapSettings.create({
        data: {
          propertyId: context.propertyId,
          nightCapEnabled: defaults.nightCapEnabled,
          nightCapLimit: defaults.nightCapLimit,
          nightCapYear: defaults.nightCapYear,
          nightCapSource: "custom",
          notes: defaults.notes ?? null,
        },
      });
    } else if (settings.nightCapLimit !== defaults.nightCapLimit) {
      settings = await prisma.nightCapSettings.update({
        where: { propertyId: context.propertyId },
        data: {
          nightCapLimit: defaults.nightCapLimit,
          nightCapSource: "custom",
          nightCapYear: defaults.nightCapYear,
        },
      });
    }

    const computation = computeNlNightCapStatus(stays, context.city, neighborhood, {
      nightCapEnabled: settings.nightCapEnabled,
      nightCapLimit: settings.nightCapLimit,
      nightCapYear: settings.nightCapYear,
      nightCapSource: "custom",
    });

    if (computation && (
      settings.nightsUsedYtd !== computation.nightsUsed ||
      !settings.lastComputedAt
    )) {
      await prisma.nightCapSettings.update({
        where: { propertyId: context.propertyId },
        data: {
          nightsUsedYtd: computation.nightsUsed,
          lastComputedAt: new Date(),
        },
      });
    }

    return { applies: true, settings, computation };
  }

  const settings = context.settings ?? await getOrCreateNightCapSettings(context.propertyId, context.city);

  const stays = await prisma.guestStay.findMany({
    where: { propertyId: context.propertyId },
    select: {
      checkInDate: true,
      checkOutDate: true,
      importStatus: true,
    },
  });

  const settingsInput: NightCapSettingsInput = {
    nightCapEnabled: settings.nightCapEnabled,
    nightCapLimit: settings.nightCapLimit,
    nightCapYear: settings.nightCapYear,
    nightCapSource: settings.nightCapSource as NightCapSource,
    notes: settings.notes,
  };

  const computation = computeNightCapStatus(stays, settingsInput);

  if (
    settings.nightsUsedYtd !== computation.nightsUsed ||
    !settings.lastComputedAt
  ) {
    await prisma.nightCapSettings.update({
      where: { propertyId: context.propertyId },
      data: {
        nightsUsedYtd: computation.nightsUsed,
        lastComputedAt: new Date(),
      },
    });
  }

  return { applies: true, settings, computation };
}

export async function getNightCapAttentionForUser(userId: string): Promise<
  Array<{
    propertyId: string;
    propertyName: string;
    computation: NightCapComputation;
  }>
> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false, residencyStatus: "primary" },
    include: {
      nightCapSettings: true,
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
    computation: NightCapComputation;
  }> = [];

  for (const property of properties) {
    if (!nightCapApplies(property.country, property.residencyStatus, property.city)) continue;

    const defaults = buildDefaultNightCapSettings(property.city);
    const settings = property.nightCapSettings ?? {
      nightCapEnabled: defaults.nightCapEnabled,
      nightCapLimit: defaults.nightCapLimit,
      nightCapYear: defaults.nightCapYear,
      nightCapSource: defaults.nightCapSource,
      notes: null,
    };

    const computation = computeNightCapStatus(property.guestStays, {
      nightCapEnabled: settings.nightCapEnabled,
      nightCapLimit: settings.nightCapLimit,
      nightCapYear: settings.nightCapYear,
      nightCapSource: settings.nightCapSource as NightCapSource,
      notes: settings.notes,
    });

    if (
      computation.enabled &&
      (computation.status === "warning" ||
        computation.status === "critical" ||
        computation.status === "exceeded")
    ) {
      results.push({
        propertyId: property.id,
        propertyName: property.name,
        computation,
      });
    }
  }

  return results;
}
