import type {
  CollectionMode,
  DeclarationCadence,
  MeubleClassification,
  TouristTaxPeriodStatus,
} from "@/lib/france/tourist-tax";

/** JSON shape from GET/PATCH `/api/properties/[id]/tourist-tax` (dates are ISO strings). */
export type TouristTaxPeriodResponse = {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: TouristTaxPeriodStatus;
  nightsInPeriod?: number | null;
  declaredAt?: string | null;
  declarationChannel?: string | null;
  amountCents?: number | null;
  notes?: string | null;
  declarationDueDate: string;
  daysUntilDue: number | null;
  needsAttention: boolean;
};

export type TouristTaxSummaryResponse = {
  enabled: boolean;
  collectionMode: CollectionMode;
  declarationCadence: DeclarationCadence;
  attentionCount: number;
  overdueCount: number;
  dueCount: number;
  nextDuePeriod: TouristTaxPeriodResponse | null;
  periods: TouristTaxPeriodResponse[];
};

export type TouristTaxSettingsResponse = {
  enabled: boolean;
  collectionMode: CollectionMode;
  declarationCadence: DeclarationCadence;
  portalUrl: string | null;
  classification: MeubleClassification;
  attestationOnFile: boolean;
  notes: string | null;
};

export type TouristTaxResponse = {
  applies: boolean;
  settings: TouristTaxSettingsResponse | null;
  summary: TouristTaxSummaryResponse | null;
  priorityAction: {
    level: string;
    title: { en: string; fr: string };
    message: { en: string; fr: string };
  } | null;
};

export function formatDeclarationDueDate(
  declarationDueDate: Date | string,
  locale: "en" | "fr"
): string {
  return new Date(declarationDueDate).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB"
  );
}
