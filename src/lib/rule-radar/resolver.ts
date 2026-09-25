import { prisma } from "@/lib/prisma";
import { getHardcodedDefault, HARDCODED_DEFAULTS } from "./defaults";
import { RULE_KEYS } from "./keys";
import { ensureJurisdictionRulesSeeded } from "./seed";
import type { RuleContext, RuleSnapshot } from "./types";

function parseValueJson(json: string): unknown {
  try {
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

function normalizeCity(city: string | null | undefined): string | null {
  if (!city) return null;
  return city.trim().toLowerCase();
}

function matchesContext(
  row: {
    country: string;
    city: string | null;
    zone: string | null;
    residency: string | null;
  },
  context?: RuleContext
): boolean {
  if (!context) return true;
  if (context.country && row.country.toLowerCase() !== context.country.trim().toLowerCase()) {
    return false;
  }
  if (context.city && normalizeCity(row.city) !== normalizeCity(context.city)) {
    return false;
  }
  if (context.zone && row.zone !== context.zone) return false;
  if (context.residency && row.residency !== context.residency) return false;
  return true;
}

function isEffective(row: { effectiveFrom: Date; effectiveTo: Date | null }, asOf: Date): boolean {
  if (row.effectiveFrom.getTime() > asOf.getTime()) return false;
  if (row.effectiveTo && row.effectiveTo.getTime() <= asOf.getTime()) return false;
  return true;
}

export function buildSnapshotFromRows(
  rows: Array<{
    key: string;
    country: string;
    city: string | null;
    zone: string | null;
    residency: string | null;
    valueJson: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
  }>,
  asOf: Date = new Date(),
  context?: RuleContext
): RuleSnapshot {
  const snapshot = new Map<string, unknown>();

  for (const [key, value] of Object.entries(HARDCODED_DEFAULTS)) {
    snapshot.set(key, value);
  }

  const applicable = rows
    .filter((row) => isEffective(row, asOf) && matchesContext(row, context))
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());

  const appliedKeys = new Set<string>();
  for (const row of applicable) {
    if (appliedKeys.has(row.key)) continue;
    const parsed = parseValueJson(row.valueJson);
    if (parsed !== null) {
      snapshot.set(row.key, parsed);
      appliedKeys.add(row.key);
    }
  }

  return snapshot;
}

export async function loadRuleSnapshot(
  asOf: Date = new Date(),
  context?: RuleContext
): Promise<RuleSnapshot> {
  await ensureJurisdictionRulesSeeded();

  const rows = await prisma.jurisdictionRule.findMany({
    orderBy: { effectiveFrom: "desc" },
  });

  return buildSnapshotFromRows(rows, asOf, context);
}

export function resolveFromSnapshot<T>(
  snapshot: RuleSnapshot,
  key: string,
  fallback: T
): T {
  const value = snapshot.get(key);
  if (value === undefined) {
    return getHardcodedDefault(key, fallback);
  }
  return value as T;
}

export async function resolveRuleValue<T>(
  key: string,
  fallback: T,
  context?: RuleContext,
  asOf: Date = new Date()
): Promise<T> {
  const snapshot = await loadRuleSnapshot(asOf, context);
  return resolveFromSnapshot(snapshot, key, fallback);
}

export function resolveFrCommune90Cities(snapshot: RuleSnapshot): string[] {
  const cities = resolveFromSnapshot(snapshot, RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES, [
    "paris",
    "lyon",
    "nice",
  ]);
  return Array.isArray(cities)
    ? cities.map((c) => String(c).trim().toLowerCase())
    : ["paris", "lyon", "nice"];
}

export function resolveFrNightCapLimit(
  snapshot: RuleSnapshot,
  city: string
): { limit: number; source: "statutory_120" | "commune_90" } {
  const communeCities = resolveFrCommune90Cities(snapshot);
  const cityKey = city.trim().toLowerCase();
  if (communeCities.includes(cityKey)) {
    return {
      limit: resolveFromSnapshot(snapshot, RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_LIMIT, 90),
      source: "commune_90",
    };
  }
  return {
    limit: resolveFromSnapshot(snapshot, RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT, 120),
    source: "statutory_120",
  };
}

export function resolveNlAmsterdamNightCapLimit(
  snapshot: RuleSnapshot,
  wijkKey: string | null | undefined
): number {
  const zones = resolveFromSnapshot(snapshot, RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES, []);
  const zoneList = Array.isArray(zones) ? zones.map(String) : [];
  if (wijkKey && zoneList.includes(wijkKey)) {
    return resolveFromSnapshot(snapshot, RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_WIJK_15, 15);
  }
  return resolveFromSnapshot(snapshot, RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_DEFAULT, 30);
}

export function resolveFrGuestFicheDeadlineDays(snapshot: RuleSnapshot): number {
  const days = resolveFromSnapshot(snapshot, RULE_KEYS.FR_GUEST_FICHE_DEADLINE_DAYS, 1);
  return typeof days === "number" && days > 0 ? days : 1;
}

export function resolveFrTouristTaxDefaultCadence(snapshot: RuleSnapshot): string {
  const cadence = resolveFromSnapshot(
    snapshot,
    RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE,
    "monthly"
  );
  return typeof cadence === "string" ? cadence : "monthly";
}
