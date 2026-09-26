import { prisma } from "@/lib/prisma";
import { HARDCODED_DEFAULTS } from "./defaults";
import { RULE_KEYS } from "./keys";
import {
  LEGIFRANCE_L324_1_1_URL,
  SERVICE_PUBLIC_STR_URL,
} from "@/lib/france/night-cap";
import { VIENNA_WKVRG_OTS_URL } from "@/lib/austria/official-links";

const SEED_EFFECTIVE_FROM = new Date("2020-01-01T00:00:00.000Z");
const VIENNA_WKVRG_EFFECTIVE_FROM = new Date("2027-01-01T00:00:00.000Z");

type SeedRow = {
  key: string;
  country: string;
  city?: string | null;
  zone?: string | null;
  residency?: string | null;
  value: unknown;
  sourceUrl?: string | null;
  effectiveFrom?: Date;
};

const SEED_ROWS: SeedRow[] = [
  {
    key: RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT,
    country: "FR",
    residency: "primary",
    value: HARDCODED_DEFAULTS[RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT],
    sourceUrl: LEGIFRANCE_L324_1_1_URL,
  },
  {
    key: RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_LIMIT,
    country: "FR",
    residency: "primary",
    value: HARDCODED_DEFAULTS[RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_LIMIT],
    sourceUrl: SERVICE_PUBLIC_STR_URL,
  },
  {
    key: RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES,
    country: "FR",
    residency: "primary",
    value: HARDCODED_DEFAULTS[RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES],
    sourceUrl: SERVICE_PUBLIC_STR_URL,
  },
  {
    key: RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_DEFAULT,
    country: "NL",
    city: "Amsterdam",
    residency: "primary",
    value: HARDCODED_DEFAULTS[RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_DEFAULT],
    sourceUrl: "https://www.amsterdam.nl/toerisme-verhuur/",
  },
  {
    key: RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_WIJK_15,
    country: "NL",
    city: "Amsterdam",
    residency: "primary",
    value: HARDCODED_DEFAULTS[RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_WIJK_15],
    sourceUrl: "https://www.amsterdam.nl/toerisme-verhuur/",
  },
  {
    key: RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES,
    country: "NL",
    city: "Amsterdam",
    residency: "primary",
    value: HARDCODED_DEFAULTS[RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES],
    sourceUrl: "https://www.amsterdam.nl/toerisme-verhuur/",
  },
  {
    key: RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE,
    country: "FR",
    value: HARDCODED_DEFAULTS[RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE],
    sourceUrl: "https://www.service-public.fr/particuliers/vosdroits/F32963",
  },
  {
    key: RULE_KEYS.FR_GUEST_FICHE_DEADLINE_DAYS,
    country: "FR",
    value: HARDCODED_DEFAULTS[RULE_KEYS.FR_GUEST_FICHE_DEADLINE_DAYS],
    sourceUrl: SERVICE_PUBLIC_STR_URL,
  },
  {
    key: RULE_KEYS.AT_VIENNA_WKVRG_REGISTRATION,
    country: "AT",
    city: "Vienna",
    value: HARDCODED_DEFAULTS[RULE_KEYS.AT_VIENNA_WKVRG_REGISTRATION],
    sourceUrl: VIENNA_WKVRG_OTS_URL,
    effectiveFrom: VIENNA_WKVRG_EFFECTIVE_FROM,
  },
];

let seedPromise: Promise<void> | null = null;

export async function ensureJurisdictionRulesSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedJurisdictionRules().then(() => undefined);
  }
  await seedPromise;
}

export async function seedJurisdictionRules(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const row of SEED_ROWS) {
    const effectiveFrom = row.effectiveFrom ?? SEED_EFFECTIVE_FROM;
    const existing = await prisma.jurisdictionRule.findFirst({
      where: {
        key: row.key,
        country: row.country,
        city: row.city ?? null,
        zone: row.zone ?? null,
        residency: row.residency ?? null,
        effectiveFrom,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.jurisdictionRule.create({
      data: {
        key: row.key,
        country: row.country,
        city: row.city ?? null,
        zone: row.zone ?? null,
        residency: row.residency ?? null,
        valueJson: JSON.stringify(row.value),
        effectiveFrom,
        sourceUrl: row.sourceUrl ?? null,
        reviewedAt: new Date(),
      },
    });
    created++;
  }

  await seedViennaWkvgrRuleChange();

  return { created, skipped };
}

const VIENNA_WKVRG_RULE_CHANGE_SUMMARY_EN =
  "Vienna announced WKVRG: platform STR registration from 1 Jan 2027 (existing listings until 31 Mar 2027). Law still pending Wiener Landtag; final text may change.";

const VIENNA_WKVRG_RULE_CHANGE_SUMMARY_FR =
  "Vienne a annoncé le WKVRG : enregistrement LCD plateforme dès le 1er janv. 2027 (annonces existantes jusqu'au 31 mars 2027). Loi encore en attente au Landtag ; le texte final peut évoluer.";

async function seedViennaWkvgrRuleChange(): Promise<void> {
  const existing = await prisma.ruleChange.findFirst({
    where: { summaryEn: VIENNA_WKVRG_RULE_CHANGE_SUMMARY_EN },
  });
  if (existing) return;

  await prisma.ruleChange.create({
    data: {
      ruleKeysJson: JSON.stringify([RULE_KEYS.AT_VIENNA_WKVRG_REGISTRATION]),
      summaryEn: VIENNA_WKVRG_RULE_CHANGE_SUMMARY_EN,
      summaryFr: VIENNA_WKVRG_RULE_CHANGE_SUMMARY_FR,
      confidence: "announced",
      publishedAt: new Date("2026-09-19T12:00:00.000Z"),
    },
  });
}
