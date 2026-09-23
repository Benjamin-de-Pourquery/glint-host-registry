import type { ImpactSeverity, RuleConfidence, RuleKey } from "./keys";

export type RuleContext = {
  country?: string;
  city?: string;
  zone?: string;
  residency?: string;
};

export type RuleSnapshot = Map<string, unknown>;

export type JurisdictionRuleRow = {
  id: string;
  key: string;
  country: string;
  city: string | null;
  zone: string | null;
  residency: string | null;
  valueJson: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  sourceUrl: string | null;
  reviewedAt: Date | null;
};

export type RuleChangeRecord = {
  id: string;
  ruleKeysJson: string;
  summaryEn: string;
  summaryFr: string;
  confidence: RuleConfidence;
  publishedAt: Date | null;
  createdAt: Date;
};

export type RuleImpactRecord = {
  id: string;
  ruleChangeId: string;
  propertyId: string;
  beforeJson: string;
  afterJson: string;
  severity: ImpactSeverity;
  seenAt: Date | null;
  createdAt: Date;
};

export type NightCapImpactPayload = {
  applies: boolean;
  limit: number | null;
  source: string | null;
  nightsUsed: number;
  remaining: number | null;
  status: string | null;
};

export type TouristTaxImpactPayload = {
  applies: boolean;
  declarationCadence: string | null;
};

export type PropertyImpactPayload = {
  nightCap: NightCapImpactPayload;
  touristTax?: TouristTaxImpactPayload;
};

export type RuleChangeDraftInput = {
  ruleKeys: RuleKey[];
  summaryEn: string;
  summaryFr: string;
  confidence: RuleConfidence;
  ruleUpdates?: Array<{
    key: RuleKey;
    country: string;
    city?: string | null;
    zone?: string | null;
    residency?: string | null;
    value: unknown;
    sourceUrl?: string | null;
    effectiveFrom?: Date;
  }>;
};

export type RegulatorySource = {
  url: string;
  labelEn: string;
  labelFr: string;
  role: string;
  playbookId: string;
  contentHash: string;
  lastCheckedAt: string | null;
};

export type TriageQueueItem = {
  source: RegulatorySource;
  suggestedRuleKeys: RuleKey[];
};
