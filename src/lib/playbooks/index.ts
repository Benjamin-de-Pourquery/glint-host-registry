import { FRANCE_PLAYBOOKS } from "./france";
import { SPAIN_PLAYBOOK, ITALY_PLAYBOOK, NETHERLANDS_PLAYBOOK } from "./international";
import type { Playbook, PropertyFieldValues } from "./types";

const ALL_PLAYBOOKS: Playbook[] = [
  ...FRANCE_PLAYBOOKS,
  SPAIN_PLAYBOOK,
  ITALY_PLAYBOOK,
  NETHERLANDS_PLAYBOOK,
];

const CITY_ALIASES: Record<string, string> = {
  paris: "Paris",
  lyon: "Lyon",
  marseille: "Marseille",
  bordeaux: "Bordeaux",
  nice: "Nice",
};

function normalizeCountry(country: string): string {
  const c = country.trim().toLowerCase();
  if (c === "fr" || c === "france" || c === "frança" || c === "francaise") return "France";
  if (c === "es" || c === "spain" || c === "espagne" || c === "espana") return "Spain";
  if (c === "it" || c === "italy" || c === "italie" || c === "italia") return "Italy";
  if (c === "nl" || c === "netherlands" || c === "pays-bas" || c === "nederland") {
    return "Netherlands";
  }
  return country.trim();
}

function normalizeCity(city: string): string {
  const key = city.trim().toLowerCase();
  return CITY_ALIASES[key] || city.trim();
}

export function resolvePlaybook(country: string, city: string): Playbook | null {
  const normalizedCountry = normalizeCountry(country);
  const normalizedCity = normalizeCity(city);

  const cityPlaybook = ALL_PLAYBOOKS.find(
    (p) =>
      p.country === normalizedCountry &&
      p.city &&
      p.city.toLowerCase() === normalizedCity.toLowerCase()
  );
  if (cityPlaybook) return cityPlaybook;

  const countryPlaybook = ALL_PLAYBOOKS.find(
    (p) => p.country === normalizedCountry && !p.city
  );
  return countryPlaybook ?? null;
}

export function getPlaybookById(id: string): Playbook | null {
  return ALL_PLAYBOOKS.find((p) => p.id === id) ?? null;
}

export function listPlaybookCoverage(): {
  fullFranceCities: string[];
  countryStubs: string[];
} {
  return {
    fullFranceCities: FRANCE_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    countryStubs: ["Spain", "Italy", "Netherlands"],
  };
}

export function buildPreparedFieldsText(
  stepKey: string,
  playbook: Playbook,
  property: PropertyFieldValues,
  locale: "en" | "fr"
): string {
  const step = playbook.steps.find((s) => s.key === stepKey);
  if (!step) return "";

  const hints = step.fieldHints ?? ["name", "address", "city", "country", "propertyType"];
  const labels: Record<string, { en: string; fr: string }> = {
    name: { en: "Property name", fr: "Nom du bien" },
    address: { en: "Address", fr: "Adresse" },
    city: { en: "City", fr: "Ville" },
    country: { en: "Country", fr: "Pays" },
    propertyType: { en: "Property type", fr: "Type de bien" },
    notes: { en: "Notes", fr: "Notes" },
  };

  const lines = hints
    .filter((key) => property[key as keyof PropertyFieldValues])
    .map((key) => {
      const label = labels[key]?.[locale] ?? key;
      const value = property[key as keyof PropertyFieldValues];
      return `${label}: ${value}`;
    });

  return lines.join("\n");
}

export function getNextPendingStep(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>
): (typeof playbook.steps)[number] | null {
  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));

  for (const step of playbook.steps) {
    const status = progressMap.get(step.key);
    if (!status || status === "pending") {
      return step;
    }
  }

  return null;
}

export function getPlaybookProgressSummary(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>
): { completed: number; total: number; skipped: number } {
  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  let completed = 0;
  let skipped = 0;

  for (const step of playbook.steps) {
    const status = progressMap.get(step.key);
    if (status === "done") completed++;
    if (status === "skipped") skipped++;
  }

  return { completed, total: playbook.steps.length, skipped };
}

export { ALL_PLAYBOOKS };
