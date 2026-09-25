import { prisma } from "@/lib/prisma";
import { HARDCODED_DEFAULTS } from "./defaults";
import { RULE_KEYS } from "./keys";
import {
  LEGIFRANCE_L324_1_1_URL,
  SERVICE_PUBLIC_STR_URL,
} from "@/lib/france/night-cap";

const SEED_EFFECTIVE_FROM = new Date("2020-01-01T00:00:00.000Z");

type SeedRow = {
  key: string;
  country: string;
  city?: string | null;
  zone?: string | null;
  residency?: string | null;
  value: unknown;
  sourceUrl?: string | null;
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
    const existing = await prisma.jurisdictionRule.findFirst({
      where: {
        key: row.key,
        country: row.country,
        city: row.city ?? null,
        zone: row.zone ?? null,
        residency: row.residency ?? null,
        effectiveFrom: SEED_EFFECTIVE_FROM,
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
        effectiveFrom: SEED_EFFECTIVE_FROM,
        sourceUrl: row.sourceUrl ?? null,
        reviewedAt: new Date(),
      },
    });
    created++;
  }

  return { created, skipped };
}
