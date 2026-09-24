import { prisma } from "@/lib/prisma";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";
import { nightCapApplies } from "@/lib/france/night-cap";
import {
  computeCapGuardForecast,
  computeGuardBlockResult,
  parseBudgetWindows,
  serializeBudgetWindows,
} from "./compute-blocks";
import type { BudgetWindow, CapGuardMode } from "./types";
import { generateCapGuardFeedToken } from "./index";
import { recordCapGuardEvent } from "./events";

export type CapGuardPolicyRecord = {
  id: string;
  propertyId: string;
  enabled: boolean;
  mode: string;
  bufferNights: number;
  budgetWindows: string;
  registrationGate: boolean;
  feedToken: string;
  feedTokenRotatedAt: Date | null;
  propagationConfirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getOrCreateCapGuardPolicy(
  propertyId: string
): Promise<CapGuardPolicyRecord> {
  const existing = await prisma.capGuardPolicy.findUnique({
    where: { propertyId },
  });
  if (existing) return existing;

  const created = await prisma.capGuardPolicy.create({
    data: {
      propertyId,
      feedToken: generateCapGuardFeedToken(),
      feedTokenRotatedAt: new Date(),
    },
  });
  return created;
}

function resolveRegistrationExpiry(
  registration: {
    expiryDate: Date | null;
    nlHolidayPermitExpiry: Date | null;
  } | null
): Date | null {
  if (!registration) return null;
  const candidates = [
    registration.expiryDate,
    registration.nlHolidayPermitExpiry,
  ].filter(Boolean) as Date[];
  if (candidates.length === 0) return null;
  return candidates.reduce((earliest, date) =>
    date < earliest ? date : earliest
  );
}

export async function loadCapGuardContext(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      capGuardPolicy: true,
      nightCapSettings: true,
      registration: true,
      listingChannels: true,
      guestStays: {
        select: {
          checkInDate: true,
          checkOutDate: true,
          importStatus: true,
        },
      },
    },
  });

  if (!property) return null;

  const applies = nightCapApplies(
    property.country,
    property.residencyStatus,
    property.city
  );

  const nightCap = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: property.nightCapSettings,
  });

  const policy = property.capGuardPolicy ?? await getOrCreateCapGuardPolicy(propertyId);
  const budgetWindows = parseBudgetWindows(policy.budgetWindows);
  const registrationExpiry = resolveRegistrationExpiry(property.registration);

  const blockResult =
    nightCap.computation && applies
      ? computeGuardBlockResult({
          stays: property.guestStays,
          capComputation: nightCap.computation,
          policy: {
            enabled: policy.enabled,
            mode: policy.mode as CapGuardMode,
            bufferNights: policy.bufferNights,
            budgetWindows,
            registrationGate: policy.registrationGate,
          },
          today: new Date(),
          registrationExpiry,
        })
      : null;

  const forecast =
    nightCap.computation && applies
      ? computeCapGuardForecast(property.guestStays, nightCap.computation)
      : null;

  return {
    applies,
    property,
    policy,
    budgetWindows,
    nightCap,
    blockResult,
    forecast,
    registrationExpiry,
    channelCount: property.listingChannels.length,
  };
}

export async function updateCapGuardPolicy(
  propertyId: string,
  patch: {
    enabled?: boolean;
    mode?: CapGuardMode;
    bufferNights?: number;
    budgetWindows?: BudgetWindow[];
    registrationGate?: boolean;
    propagationConfirmed?: boolean;
  }
): Promise<CapGuardPolicyRecord> {
  const existing = await getOrCreateCapGuardPolicy(propertyId);
  const previousMode = existing.mode;
  const wasEnabled = existing.enabled;

  const updated = await prisma.capGuardPolicy.update({
    where: { propertyId },
    data: {
      ...(patch.enabled !== undefined && { enabled: patch.enabled }),
      ...(patch.mode !== undefined && { mode: patch.mode }),
      ...(patch.bufferNights !== undefined && { bufferNights: patch.bufferNights }),
      ...(patch.budgetWindows !== undefined && {
        budgetWindows: serializeBudgetWindows(patch.budgetWindows),
      }),
      ...(patch.registrationGate !== undefined && {
        registrationGate: patch.registrationGate,
      }),
      ...(patch.propagationConfirmed === true && {
        propagationConfirmedAt: new Date(),
      }),
    },
  });

  if (patch.enabled === true && !wasEnabled) {
    await recordCapGuardEvent(propertyId, "enabled");
  } else if (patch.enabled === false && wasEnabled) {
    await recordCapGuardEvent(propertyId, "disabled");
  }

  if (patch.mode !== undefined && patch.mode !== previousMode) {
    await recordCapGuardEvent(propertyId, "mode_change", {
      from: previousMode,
      to: patch.mode,
    });
  }

  return updated;
}

export async function rotateCapGuardFeedToken(
  propertyId: string
): Promise<CapGuardPolicyRecord> {
  await getOrCreateCapGuardPolicy(propertyId);
  return prisma.capGuardPolicy.update({
    where: { propertyId },
    data: {
      feedToken: generateCapGuardFeedToken(),
      feedTokenRotatedAt: new Date(),
      propagationConfirmedAt: null,
    },
  });
}

export async function maybeRecordBreachNearEvent(
  propertyId: string,
  percentUsed: number
): Promise<void> {
  if (percentUsed < 90) return;
  const recent = await prisma.capGuardEvent.findFirst({
    where: {
      propertyId,
      eventType: "breach_near",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (recent) return;
  await recordCapGuardEvent(propertyId, "breach_near", { percentUsed });
}

export async function recordBlocksPublishedEvent(
  propertyId: string,
  blockCount: number
): Promise<void> {
  await recordCapGuardEvent(propertyId, "blocks_published", { blockCount });
}

export async function loadCapGuardPolicyByToken(token: string) {
  return prisma.capGuardPolicy.findFirst({
    where: { feedToken: token, enabled: true },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true,
          city: true,
          residencyStatus: true,
          nightCapSettings: true,
          registration: {
            select: {
              expiryDate: true,
              nlHolidayPermitExpiry: true,
            },
          },
          guestStays: {
            select: {
              checkInDate: true,
              checkOutDate: true,
              importStatus: true,
            },
          },
        },
      },
    },
  });
}
