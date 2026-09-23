import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { computeScore } from "./compute-score";
import { computeGuestDueSignals } from "./guest-due-signals";
import {
  isRegistrationRequiredByPlaybook,
  resolveEffectiveExpiryDate,
  resolvePrimaryRegistrationNumber,
} from "./resolve-registration";
import type {
  ListingHealthFactor,
  ListingHealthResult,
  ListingHealthScore,
  ListingHealthSnapshotRecord,
} from "./types";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";

function parseFactors(json: string): ListingHealthFactor[] {
  try {
    const parsed = JSON.parse(json) as ListingHealthFactor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toSnapshotRecord(
  row: {
    id: string;
    propertyId: string;
    score: string;
    factorsJson: string;
    computedAt: Date;
  },
  isActivated: boolean
): ListingHealthSnapshotRecord {
  return {
    id: row.id,
    propertyId: row.propertyId,
    score: row.score as ListingHealthScore,
    factors: parseFactors(row.factorsJson),
    isActivated,
    computedAt: row.computedAt.toISOString(),
  };
}

export async function buildListingHealthInput(
  propertyId: string,
  locale: string
): Promise<import("./types").ListingHealthComputeInput | null> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      registration: true,
      listingChannels: true,
      guestStays: {
        where: {
          expectsForeignGuest: true,
          checkOutDate: { gte: startOfDay(new Date()) },
        },
        include: {
          guestRecords: {
            select: {
              id: true,
              arrivalDate: true,
              requiresPoliceForm: true,
              isFrenchNational: true,
            },
          },
        },
      },
    },
  });

  if (!property) return null;

  const guestSignals = computeGuestDueSignals(property.guestStays);

  let nightCapPercentUsed: number | null = null;
  let nightCapExceeded = false;
  let capGuardEnabled = false;
  let capGuardCritical = false;

  const nightCap = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: null,
  });

  const capGuardPolicy = await prisma.capGuardPolicy.findUnique({
    where: { propertyId: property.id },
  });

  if (nightCap.applies && nightCap.computation?.enabled) {
    nightCapPercentUsed = nightCap.computation.percentUsed;
    nightCapExceeded =
      nightCap.computation.status === "exceeded" ||
      nightCap.computation.nightsUsed > nightCap.computation.limit;
  }

  if (capGuardPolicy?.enabled && nightCap.computation?.enabled) {
    capGuardEnabled = true;
    capGuardCritical =
      nightCap.computation.status === "critical" ||
      nightCap.computation.status === "exceeded" ||
      nightCap.computation.remaining < capGuardPolicy.bufferNights;
  }

  return {
    propertyId: property.id,
    locale,
    registrationRequired: isRegistrationRequiredByPlaybook(property.country, property.city),
    primaryRegistrationNumber: resolvePrimaryRegistrationNumber(property.registration),
    expiryDate: resolveEffectiveExpiryDate(property.registration),
    channels: property.listingChannels.map((c) => ({
      channel: c.channel,
      listingUrl: c.listingUrl,
      displayedRegistrationNumber: c.registrationNumberDisplayed,
    })),
    guestDueCriticalCount: guestSignals.criticalCount,
    guestDueWarningCount: guestSignals.warningCount,
    nightCapPercentUsed,
    nightCapExceeded,
    capGuardEnabled,
    capGuardCritical,
  };
}

export async function recomputeListingHealth(
  propertyId: string,
  locale = "en"
): Promise<ListingHealthResult | null> {
  const input = await buildListingHealthInput(propertyId, locale);
  if (!input) return null;

  const result = computeScore(input);

  await prisma.listingHealthSnapshot.create({
    data: {
      propertyId,
      score: result.score,
      factorsJson: JSON.stringify(result.factors),
      computedAt: result.computedAt,
    },
  });

  return result;
}

export async function getLatestListingHealth(
  propertyId: string,
  locale = "en"
): Promise<ListingHealthSnapshotRecord | null> {
  const latest = await prisma.listingHealthSnapshot.findFirst({
    where: { propertyId },
    orderBy: { computedAt: "desc" },
  });

  if (!latest) {
    const recomputed = await recomputeListingHealth(propertyId, locale);
    if (!recomputed) return null;
    const row = await prisma.listingHealthSnapshot.findFirst({
      where: { propertyId },
      orderBy: { computedAt: "desc" },
    });
    if (!row) return null;
    return toSnapshotRecord(row, recomputed.isActivated);
  }

  const input = await buildListingHealthInput(propertyId, locale);
  const isActivated = input
    ? Boolean(input.primaryRegistrationNumber?.trim()) &&
      input.channels.some((c) => c.listingUrl.trim())
    : false;

  return toSnapshotRecord(latest, isActivated);
}

export async function getListingHealthAtRiskForUser(
  userId: string,
  locale = "en"
): Promise<
  Array<{
    propertyId: string;
    propertyName: string;
    city: string;
    score: ListingHealthScore;
    factors: ListingHealthFactor[];
  }>
> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });

  const atRisk: Array<{
    propertyId: string;
    propertyName: string;
    city: string;
    score: ListingHealthScore;
    factors: ListingHealthFactor[];
  }> = [];

  for (const property of properties) {
    const snapshot = await getLatestListingHealth(property.id, locale);
    if (snapshot && (snapshot.score === "ORANGE" || snapshot.score === "RED")) {
      atRisk.push({
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        score: snapshot.score,
        factors: snapshot.factors,
      });
    }
  }

  return atRisk;
}

export async function countListingHealthAtRiskForUser(userId: string): Promise<number> {
  const scores = await getListingHealthScoresForUser(userId);
  return scores.filter((s) => s.score === "ORANGE" || s.score === "RED").length;
}

export async function getListingHealthScoresForUser(
  userId: string,
  locale = "en"
): Promise<
  Array<{
    propertyId: string;
    propertyName: string;
    city: string;
    score: ListingHealthScore;
    factors: ListingHealthFactor[];
  }>
> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      registration: true,
      listingChannels: true,
      guestStays: {
        where: {
          expectsForeignGuest: true,
          checkOutDate: { gte: startOfDay(new Date()) },
        },
        include: {
          guestRecords: {
            select: {
              id: true,
              arrivalDate: true,
              requiresPoliceForm: true,
              isFrenchNational: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const results: Array<{
    propertyId: string;
    propertyName: string;
    city: string;
    score: ListingHealthScore;
    factors: ListingHealthFactor[];
  }> = [];

  for (const property of properties) {
    const guestSignals = computeGuestDueSignals(property.guestStays);
    let nightCapPercentUsed: number | null = null;
    let nightCapExceeded = false;
    let capGuardEnabled = false;
    let capGuardCritical = false;

    const nightCap = await loadPropertyNightCap({
      propertyId: property.id,
      country: property.country,
      city: property.city,
      residencyStatus: property.residencyStatus,
      settings: null,
    });

    const capGuardPolicy = await prisma.capGuardPolicy.findUnique({
      where: { propertyId: property.id },
    });

    if (nightCap.applies && nightCap.computation?.enabled) {
      nightCapPercentUsed = nightCap.computation.percentUsed;
      nightCapExceeded =
        nightCap.computation.status === "exceeded" ||
        nightCap.computation.nightsUsed > nightCap.computation.limit;
    }

    if (capGuardPolicy?.enabled && nightCap.computation?.enabled) {
      capGuardEnabled = true;
      capGuardCritical =
        nightCap.computation.status === "critical" ||
        nightCap.computation.status === "exceeded" ||
        nightCap.computation.remaining < capGuardPolicy.bufferNights;
    }

    const computed = computeScore({
      propertyId: property.id,
      locale,
      registrationRequired: isRegistrationRequiredByPlaybook(property.country, property.city),
      primaryRegistrationNumber: resolvePrimaryRegistrationNumber(property.registration),
      expiryDate: resolveEffectiveExpiryDate(property.registration),
      channels: property.listingChannels.map((c) => ({
        channel: c.channel,
        listingUrl: c.listingUrl,
        displayedRegistrationNumber: c.registrationNumberDisplayed,
      })),
      guestDueCriticalCount: guestSignals.criticalCount,
      guestDueWarningCount: guestSignals.warningCount,
      nightCapPercentUsed,
      nightCapExceeded,
      capGuardEnabled,
      capGuardCritical,
    });

    results.push({
      propertyId: property.id,
      propertyName: property.name,
      city: property.city,
      score: computed.score,
      factors: computed.factors,
    });
  }

  return results;
}
