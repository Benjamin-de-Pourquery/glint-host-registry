import { prisma } from "@/lib/prisma";
import { isFranceCountry } from "@/lib/national-transition";
import { nightCapApplies } from "@/lib/france/night-cap";
import { isAmsterdamCity, isNetherlandsCountry } from "@/lib/netherlands/regions";
import { touristTaxApplies } from "@/lib/france/tourist-tax";
import { RULE_KEYS, type ImpactSeverity, type RuleKey } from "./keys";
import {
  buildSnapshotFromRows,
  loadRuleSnapshot,
  resolveFrCommune90Cities,
  resolveFrTouristTaxDefaultCadence,
} from "./resolver";
import {
  computePropertyNightCapFromSettings,
  resolveNightCapSettingsForProperty,
} from "./night-cap-integration";
import type { PropertyImpactPayload, RuleSnapshot } from "./types";

function parseRuleKeys(json: string): RuleKey[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as RuleKey[]) : [];
  } catch {
    return [];
  }
}

function severityForNightCapDelta(
  before: PropertyImpactPayload["nightCap"],
  after: PropertyImpactPayload["nightCap"]
): ImpactSeverity {
  if (!before.applies && !after.applies) return "none";
  if (!before.applies && after.applies) return "medium";
  if (before.limit != null && after.limit != null && after.limit < before.limit) {
    const drop = before.limit - after.limit;
    if (drop >= 30) return "high";
    if (drop >= 10) return "medium";
    return "low";
  }
  if (before.limit != null && after.limit != null && after.limit > before.limit) {
    return "low";
  }
  if (before.status !== after.status && (after.status === "exceeded" || after.status === "critical")) {
    return "high";
  }
  return "low";
}

function overallSeverity(payloads: {
  before: PropertyImpactPayload;
  after: PropertyImpactPayload;
}): ImpactSeverity {
  const nightCapSeverity = severityForNightCapDelta(payloads.before.nightCap, payloads.after.nightCap);
  if (nightCapSeverity === "high") return "high";
  if (nightCapSeverity === "medium") return "medium";
  if (nightCapSeverity === "low") return "low";
  return "none";
}

async function loadSnapshotBeforeChange(
  publishedAt: Date,
  ruleUpdates: Array<{ key: string; effectiveFrom?: Date }>
): Promise<RuleSnapshot> {
  const earliestUpdate = ruleUpdates.reduce<Date | null>((min, row) => {
    const effective = row.effectiveFrom ?? publishedAt;
    if (!min || effective.getTime() < min.getTime()) return effective;
    return min;
  }, null);

  const asOf = earliestUpdate
    ? new Date(earliestUpdate.getTime() - 1000)
    : new Date(publishedAt.getTime() - 1000);

  const rows = await prisma.jurisdictionRule.findMany({
    orderBy: { effectiveFrom: "desc" },
  });

  return buildSnapshotFromRows(rows, asOf);
}

async function loadSnapshotAfterChange(publishedAt: Date): Promise<RuleSnapshot> {
  const rows = await prisma.jurisdictionRule.findMany({
    orderBy: { effectiveFrom: "desc" },
  });
  return buildSnapshotFromRows(rows, publishedAt);
}

async function computePropertyImpactPayload(
  property: {
    country: string;
    city: string;
    residencyStatus: string | null;
    registration: { nlNeighborhood: string | null } | null;
    guestStays: Array<{
      checkInDate: Date;
      checkOutDate: Date;
      importStatus: string | null;
    }>;
    nightCapSettings: {
      nightCapEnabled: boolean;
      nightCapLimit: number;
      nightCapYear: number;
      nightCapSource: string;
      notes: string | null;
    } | null;
    touristTaxSettings: {
      declarationCadence: string;
    } | null;
  },
  snapshot: RuleSnapshot
): Promise<PropertyImpactPayload> {
  const wijkKey = property.registration?.nlNeighborhood ?? null;
  const existingSettings = property.nightCapSettings
    ? {
        nightCapEnabled: property.nightCapSettings.nightCapEnabled,
        nightCapLimit: property.nightCapSettings.nightCapLimit,
        nightCapYear: property.nightCapSettings.nightCapYear,
        nightCapSource: property.nightCapSettings.nightCapSource as "statutory_120" | "commune_90" | "custom",
        notes: property.nightCapSettings.notes,
      }
    : null;

  const settings = await resolveNightCapSettingsForProperty(
    {
      country: property.country,
      city: property.city,
      residencyStatus: property.residencyStatus,
      wijkKey,
      existing: existingSettings,
    },
    snapshot
  );

  const computation = computePropertyNightCapFromSettings(property.guestStays, {
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    wijkKey,
    settings,
  });

  const nightCap = {
    applies: nightCapApplies(property.country, property.residencyStatus, property.city),
    limit: computation?.limit ?? null,
    source: computation?.source ?? settings.nightCapSource,
    nightsUsed: computation?.nightsUsed ?? 0,
    remaining: computation?.remaining ?? null,
    status: computation?.status ?? null,
  };

  const touristTax = touristTaxApplies(property.country)
    ? {
        applies: true,
        declarationCadence:
          property.touristTaxSettings?.declarationCadence ??
          resolveFrTouristTaxDefaultCadence(snapshot),
      }
    : { applies: false, declarationCadence: null };

  return { nightCap, touristTax };
}

function propertyMatchesRuleKeys(
  property: {
    country: string;
    city: string;
    residencyStatus: string | null;
    registration: { nlNeighborhood: string | null } | null;
  },
  ruleKeys: RuleKey[],
  snapshot: RuleSnapshot
): boolean {
  if (ruleKeys.length === 0) return false;

  for (const key of ruleKeys) {
    if (key.startsWith("fr.night_cap") || key === RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE) {
      if (!isFranceCountry(property.country)) continue;
      if (key !== RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE && property.residencyStatus !== "primary") {
        continue;
      }
      if (key === RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES) {
        const cities = resolveFrCommune90Cities(snapshot);
        if (cities.includes(property.city.trim().toLowerCase())) return true;
        continue;
      }
      return true;
    }

    if (key.startsWith("nl.amsterdam")) {
      if (!isNetherlandsCountry(property.country)) continue;
      if (property.residencyStatus !== "primary") continue;
      if (!isAmsterdamCity(property.city)) continue;
      if (key === RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES) {
        const wijk = property.registration?.nlNeighborhood;
        if (wijk) return true;
        continue;
      }
      return true;
    }

    if (key === RULE_KEYS.FR_GUEST_FICHE_DEADLINE_DAYS) {
      if (isFranceCountry(property.country)) return true;
    }
  }

  return false;
}

export async function applyRuleUpdates(
  updates: Array<{
    key: RuleKey;
    country: string;
    city?: string | null;
    zone?: string | null;
    residency?: string | null;
    value: unknown;
    sourceUrl?: string | null;
    effectiveFrom?: Date;
  }>,
  publishedAt: Date
): Promise<void> {
  for (const update of updates) {
    await prisma.jurisdictionRule.create({
      data: {
        key: update.key,
        country: update.country,
        city: update.city ?? null,
        zone: update.zone ?? null,
        residency: update.residency ?? null,
        valueJson: JSON.stringify(update.value),
        effectiveFrom: update.effectiveFrom ?? publishedAt,
        sourceUrl: update.sourceUrl ?? null,
        reviewedAt: publishedAt,
      },
    });
  }
}

export async function computeImpactsForRuleChange(
  ruleChangeId: string,
  ruleUpdates: Array<{
    key: RuleKey;
    country: string;
    city?: string | null;
    zone?: string | null;
    residency?: string | null;
    value: unknown;
    sourceUrl?: string | null;
    effectiveFrom?: Date;
  }> = []
): Promise<{ impactsCreated: number }> {
  const ruleChange = await prisma.ruleChange.findUnique({
    where: { id: ruleChangeId },
  });

  if (!ruleChange || !ruleChange.publishedAt) {
    throw new Error("Rule change must be published before computing impacts");
  }

  const ruleKeys = parseRuleKeys(ruleChange.ruleKeysJson);
  const publishedAt = ruleChange.publishedAt;

  const beforeSnapshot = await loadSnapshotBeforeChange(publishedAt, ruleUpdates);
  const afterSnapshot = ruleUpdates.length > 0
    ? await loadSnapshotAfterChange(publishedAt)
    : await loadRuleSnapshot(publishedAt);

  const properties = await prisma.property.findMany({
    where: { archived: false },
    include: {
      registration: { select: { nlNeighborhood: true } },
      guestStays: {
        select: { checkInDate: true, checkOutDate: true, importStatus: true },
      },
      nightCapSettings: true,
      touristTaxSettings: true,
    },
  });

  let impactsCreated = 0;

  for (const property of properties) {
    if (!propertyMatchesRuleKeys(property, ruleKeys, afterSnapshot)) {
      continue;
    }

    const before = await computePropertyImpactPayload(property, beforeSnapshot);
    const after = await computePropertyImpactPayload(property, afterSnapshot);
    const severity = overallSeverity({ before, after });

    if (severity === "none") {
      continue;
    }

    await prisma.ruleImpact.create({
      data: {
        ruleChangeId,
        propertyId: property.id,
        beforeJson: JSON.stringify(before),
        afterJson: JSON.stringify(after),
        severity,
      },
    });
    impactsCreated++;
  }

  return { impactsCreated };
}

export async function publishRuleChange(
  ruleChangeId: string,
  ruleUpdates: Array<{
    key: RuleKey;
    country: string;
    city?: string | null;
    zone?: string | null;
    residency?: string | null;
    value: unknown;
    sourceUrl?: string | null;
    effectiveFrom?: Date;
  }> = []
): Promise<{ impactsCreated: number }> {
  const publishedAt = new Date();

  await prisma.ruleChange.update({
    where: { id: ruleChangeId },
    data: { publishedAt },
  });

  if (ruleUpdates.length > 0) {
    await applyRuleUpdates(ruleUpdates, publishedAt);
  }

  return computeImpactsForRuleChange(ruleChangeId, ruleUpdates);
}
