import { FRANCE_PLAYBOOKS } from "./france";
import { SPAIN_PLAYBOOK, ITALY_PLAYBOOK, NETHERLANDS_PLAYBOOK } from "./international";
import type {
  OfficialUrl,
  OfficialUrlRole,
  Playbook,
  PlaybookStep,
  PropertyFieldValues,
  ResidencyStatus,
  StepAppliesWhen,
} from "./types";

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

export function stepAppliesToResidency(
  step: PlaybookStep,
  residencyStatus?: ResidencyStatus | null
): boolean {
  const appliesWhen = step.appliesWhen ?? "always";
  if (appliesWhen === "always") return true;
  if (!residencyStatus) return true;

  switch (appliesWhen) {
    case "primaryResidence":
      return residencyStatus === "primary";
    case "secondaryResidence":
      return residencyStatus === "secondary";
    case "nonPrimary":
      return residencyStatus === "secondary" || residencyStatus === "other";
    default:
      return true;
  }
}

export function getApplicableSteps(
  playbook: Playbook,
  residencyStatus?: ResidencyStatus | null
): PlaybookStep[] {
  return playbook.steps.filter((step) => stepAppliesToResidency(step, residencyStatus));
}

export function getPrimaryCtaUrl(step: PlaybookStep): OfficialUrl | null {
  const formOrPortal = step.officialUrls.find(
    (u) => u.role === "form" || u.role === "portal"
  );
  if (formOrPortal) return formOrPortal;

  const rulesOrInfo = step.officialUrls.find(
    (u) => u.role === "rules" || u.role === "info"
  );
  return rulesOrInfo ?? step.officialUrls[0] ?? null;
}

export type CtaLabelKey =
  | "openOfficialForm"
  | "openOfficialPortal"
  | "openOfficialRules"
  | "openOfficialInfo"
  | "openOfficial";

export function getCtaLabelKey(role: OfficialUrlRole): CtaLabelKey {
  switch (role) {
    case "form":
      return "openOfficialForm";
    case "portal":
      return "openOfficialPortal";
    case "rules":
      return "openOfficialRules";
    case "info":
      return "openOfficialInfo";
    case "tax":
      return "openOfficial";
    default:
      return "openOfficial";
  }
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

const RESIDENCY_LABELS: Record<string, { en: string; fr: string }> = {
  primary: { en: "Primary residence", fr: "Résidence principale" },
  secondary: { en: "Secondary residence", fr: "Résidence secondaire" },
  other: { en: "Other / non-primary", fr: "Autre / non principale" },
};

export function buildPreparedFieldsText(
  stepKey: string,
  playbook: Playbook,
  property: PropertyFieldValues,
  locale: "en" | "fr"
): string {
  const step = playbook.steps.find((s) => s.key === stepKey);
  if (!step) return "";

  const hints = step.fieldHints ?? [
    "name",
    "address",
    "city",
    "country",
    "propertyType",
    "residencyStatus",
  ];
  const labels: Record<string, { en: string; fr: string }> = {
    name: { en: "Property name", fr: "Nom du bien" },
    address: { en: "Address", fr: "Adresse" },
    city: { en: "City", fr: "Ville" },
    country: { en: "Country", fr: "Pays" },
    propertyType: { en: "Property type", fr: "Type de bien" },
    notes: { en: "Notes", fr: "Notes" },
    residencyStatus: { en: "Residency status", fr: "Statut de résidence" },
  };

  const lines = hints
    .filter((key) => {
      const value = property[key as keyof PropertyFieldValues];
      return value !== undefined && value !== null && value !== "";
    })
    .map((key) => {
      const label = labels[key]?.[locale] ?? key;
      let value = property[key as keyof PropertyFieldValues];
      if (key === "residencyStatus" && value) {
        value = RESIDENCY_LABELS[value as string]?.[locale] ?? value;
      }
      return `${label}: ${value}`;
    });

  const isParisDeclaration =
    stepKey.startsWith("paris-declare") ||
    (playbook.id === "fr-paris" && step.officialUrls.some((u) => u.role === "form"));

  if (isParisDeclaration) {
    const taxHint =
      locale === "fr"
        ? "Identifiant du local (avis taxe d'habitation, bas page 4) — ou cocher « J'identifie mon local autrement »"
        : "Local ID (taxe d'habitation notice, bottom of page 4) — or check « J'identifie mon local autrement »";
    lines.push(taxHint);
  }

  return lines.join("\n");
}

export function getNextPendingStep(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus?: ResidencyStatus | null
): PlaybookStep | null {
  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const applicableSteps = getApplicableSteps(playbook, residencyStatus);

  for (const step of applicableSteps) {
    const status = progressMap.get(step.key);
    if (!status || status === "pending") {
      return step;
    }
  }

  return null;
}

export function getPlaybookProgressSummary(
  playbook: Playbook,
  progress: Array<{ stepKey: string; status: string }>,
  residencyStatus?: ResidencyStatus | null
): { completed: number; total: number; skipped: number } {
  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const applicableSteps = getApplicableSteps(playbook, residencyStatus);
  let completed = 0;
  let skipped = 0;

  for (const step of applicableSteps) {
    const status = progressMap.get(step.key);
    if (status === "done") completed++;
    if (status === "skipped") skipped++;
  }

  return { completed, total: applicableSteps.length, skipped };
}

export { ALL_PLAYBOOKS };
