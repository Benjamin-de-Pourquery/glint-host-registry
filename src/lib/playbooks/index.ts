import { FRANCE_PLAYBOOKS } from "./france";
import { SPAIN_PLAYBOOKS } from "./spain";
import { ITALY_PLAYBOOKS } from "./italy";
import { PORTUGAL_PLAYBOOKS } from "./portugal";
import { GREECE_PLAYBOOKS } from "./greece";
import { CROATIA_PLAYBOOKS } from "./croatia";
import { NETHERLANDS_PLAYBOOKS } from "./netherlands";
import { BELGIUM_PLAYBOOKS } from "./belgium";
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
  ...SPAIN_PLAYBOOKS,
  ...ITALY_PLAYBOOKS,
  ...PORTUGAL_PLAYBOOKS,
  ...GREECE_PLAYBOOKS,
  ...CROATIA_PLAYBOOKS,
  ...NETHERLANDS_PLAYBOOKS,
  ...BELGIUM_PLAYBOOKS,
];

const CITY_ALIASES: Record<string, string> = {
  madrid: "Madrid",
  barcelona: "Barcelona",
  valencia: "Valencia",
  malaga: "Málaga",
  "málaga": "Málaga",
  seville: "Málaga",
  sevilla: "Málaga",
  bilbao: "Bilbao",
  "donostia": "Donostia-San Sebastián",
  "donostia-san sebastián": "Donostia-San Sebastián",
  "donostia-san sebastian": "Donostia-San Sebastián",
  "san sebastián": "Donostia-San Sebastián",
  "san sebastian": "Donostia-San Sebastián",
  "vitoria": "Vitoria-Gasteiz",
  "vitoria-gasteiz": "Vitoria-Gasteiz",
  paris: "Paris",
  lyon: "Lyon",
  marseille: "Marseille",
  bordeaux: "Bordeaux",
  nice: "Nice",
  lille: "Lille",
  toulouse: "Toulouse",
  nantes: "Nantes",
  strasbourg: "Strasbourg",
  roma: "Roma",
  rome: "Roma",
  milano: "Milano",
  milan: "Milano",
  firenze: "Firenze",
  florence: "Firenze",
  venezia: "Venezia",
  venice: "Venezia",
  napoli: "Napoli",
  naples: "Napoli",
  lisboa: "Lisboa",
  lisbon: "Lisboa",
  porto: "Porto",
  oporto: "Porto",
  faro: "Faro",
  algarve: "Faro",
  funchal: "Funchal",
  madeira: "Funchal",
  athens: "Athina",
  athina: "Athina",
  athènes: "Athina",
  thessaloniki: "Thessaloniki",
  salonica: "Thessaloniki",
  salonique: "Thessaloniki",
  heraklion: "Heraklion",
  iraklio: "Heraklion",
  crete: "Heraklion",
  rhodes: "Rhodes",
  rodos: "Rhodes",
  corfu: "Corfu",
  kerkyra: "Corfu",
  zagreb: "Zagreb",
  split: "Split",
  dubrovnik: "Dubrovnik",
  zadar: "Zadar",
  rijeka: "Rijeka",
  pula: "Pula",
  istria: "Pula",
  amsterdam: "Amsterdam",
  ams: "Amsterdam",
  rotterdam: "Rotterdam",
  "den haag": "Den Haag",
  "the hague": "Den Haag",
  "'s-gravenhage": "Den Haag",
  "s-gravenhage": "Den Haag",
  utrecht: "Utrecht",
  brussels: "Brussels",
  bruxelles: "Brussels",
  brussel: "Brussels",
  antwerp: "Antwerp",
  antwerpen: "Antwerp",
  anvers: "Antwerp",
  ghent: "Ghent",
  gent: "Ghent",
  gand: "Ghent",
  bruges: "Bruges",
  brugge: "Bruges",
  leuven: "Leuven",
  louvain: "Leuven",
  mechelen: "Mechelen",
  malines: "Mechelen",
  "liège": "Liège",
  liege: "Liège",
  luik: "Liège",
  namur: "Namur",
  namen: "Namur",
  charleroi: "Charleroi",
  mons: "Mons",
  bergen: "Mons",
  tournai: "Tournai",
  doornik: "Tournai",
};

function normalizeCountry(country: string): string {
  const c = country.trim().toLowerCase();
  if (c === "fr" || c === "france" || c === "frança" || c === "francaise") return "France";
  if (c === "es" || c === "spain" || c === "espagne" || c === "espana") return "Spain";
  if (c === "it" || c === "italy" || c === "italie" || c === "italia") return "Italy";
  if (c === "pt" || c === "portugal" || c === "portuguese") return "Portugal";
  if (c === "gr" || c === "el" || c === "greece" || c === "hellas" || c === "grèce") {
    return "Greece";
  }
  if (c === "nl" || c === "netherlands" || c === "pays-bas" || c === "nederland") {
    return "Netherlands";
  }
  if (c === "hr" || c === "croatia" || c === "croatie" || c === "hrvatska") {
    return "Croatia";
  }
  if (c === "be" || c === "belgium" || c === "belgique" || c === "belgië" || c === "belgie") {
    return "Belgium";
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
  netherlandsCities: string[];
  spainCities: string[];
  italyCities: string[];
  portugalCities: string[];
  greeceCities: string[];
  croatiaCities: string[];
  belgiumCities: string[];
} {
  return {
    fullFranceCities: FRANCE_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    countryStubs: [] as string[],
    netherlandsCities: NETHERLANDS_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    belgiumCities: BELGIUM_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    spainCities: SPAIN_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    italyCities: ITALY_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    portugalCities: PORTUGAL_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    greeceCities: GREECE_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
    croatiaCities: CROATIA_PLAYBOOKS.filter((p) => p.city).map((p) => p.city!),
  };
}

const RESIDENCY_LABELS: Record<string, { en: string; fr: string }> = {
  primary: { en: "Primary residence", fr: "Résidence principale" },
  secondary: { en: "Secondary residence", fr: "Résidence secondaire" },
  other: { en: "Other / non-primary", fr: "Autre / non principale" },
};

export type PreparedField = {
  key: string;
  label: string;
  value: string;
};

const FIELD_LABELS: Record<string, { en: string; fr: string }> = {
  name: { en: "Property name", fr: "Nom du bien" },
  address: { en: "Address", fr: "Adresse" },
  city: { en: "City", fr: "Ville" },
  country: { en: "Country", fr: "Pays" },
  propertyType: { en: "Property type", fr: "Type de bien" },
  notes: { en: "Notes", fr: "Notes" },
  residencyStatus: { en: "Residency status", fr: "Statut de résidence" },
};

export function getPreparedFieldsForStep(
  stepKey: string,
  playbook: Playbook,
  property: PropertyFieldValues,
  locale: "en" | "fr"
): PreparedField[] {
  const step = playbook.steps.find((s) => s.key === stepKey);
  if (!step) return [];

  const hints = step.fieldHints ?? [
    "name",
    "address",
    "city",
    "country",
    "propertyType",
    "residencyStatus",
  ];

  const fields: PreparedField[] = hints
    .filter((key) => {
      const value = property[key as keyof PropertyFieldValues];
      return value !== undefined && value !== null && value !== "";
    })
    .map((key) => {
      const label = FIELD_LABELS[key]?.[locale] ?? key;
      let value = String(property[key as keyof PropertyFieldValues]);
      if (key === "residencyStatus") {
        value = RESIDENCY_LABELS[value]?.[locale] ?? value;
      }
      return { key: key as string, label, value };
    });

  const isParisDeclaration =
    stepKey.startsWith("paris-declare") ||
    (playbook.id === "fr-paris" && step.officialUrls.some((u) => u.role === "form"));

  if (isParisDeclaration) {
    fields.push({
      key: "paris-local-id",
      label:
        locale === "fr"
          ? "Identifiant du local"
          : "Local ID (taxe d'habitation)",
      value:
        locale === "fr"
          ? "Bas page 4 de l'avis — ou cocher « J'identifie mon local autrement »"
          : "Bottom of page 4 — or check « J'identifie mon local autrement »",
    });
  }

  return fields;
}

/** First sentence of instruction as a one-line why-now summary */
export function getStepWhyNow(
  step: PlaybookStep,
  locale: "en" | "fr"
): string {
  const text = step.instruction[locale];
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.slice(0, 120).trim() + (text.length > 120 ? "…" : "");
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
