import type { LocalizedText, OfficialUrl } from "@/lib/playbooks/types";
import type { RuleConfidence } from "@/lib/rule-radar/keys";

export type PrePurchaseConfidence = RuleConfidence | "to_confirm";

export type ZoneRuleCategory =
  | "zoning"
  | "minimum_stay"
  | "caps"
  | "licence_regime"
  | "announced_end"
  | "co_ownership"
  | "transferability"
  | "national_context";

export type ZoneRuleItem = {
  id: string;
  category: ZoneRuleCategory;
  title: LocalizedText;
  /** Present only when confidence is official, announced, or reported */
  summary?: LocalizedText;
  confidence: PrePurchaseConfidence;
  sourceReviewedAt?: string;
  officialUrls: OfficialUrl[];
  toConfirmQuestion?: LocalizedText;
};

export type PrePurchaseCountry = "ES" | "";
export type PrePurchaseRegion = "CT" | "other" | "";

export type PrePurchaseJourneyInput = {
  country: PrePurchaseCountry;
  region: PrePurchaseRegion;
  municipality: string;
  addressOrListing: string;
  licenceNumber: string;
};

export type RegisterLookupStatus = "found" | "not_found" | "uncertain";

export type RegisterLookupPublicRecord = {
  registrationNumber: string;
  establishmentType: string;
  status: string;
  municipality: string;
  postalCode: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  door?: string;
};

export type RegisterLookupResult = {
  status: RegisterLookupStatus;
  normalizedNumber: string;
  datasetUpdatedAt: string | null;
  record?: RegisterLookupPublicRecord;
  addressMatchNote?: LocalizedText;
  message: LocalizedText;
};

export type PrePurchaseFlagLevel = "red" | "orange" | "verify";

export type PrePurchaseFlag = {
  level: PrePurchaseFlagLevel;
  code: string;
  title: LocalizedText;
  detail: LocalizedText;
};

export type DocumentToRequest = {
  id: string;
  title: LocalizedText;
  why: LocalizedText;
};

export type PrePurchaseJourneyEvaluation = {
  rules: ZoneRuleItem[];
  flags: PrePurchaseFlag[];
  documents: DocumentToRequest[];
  lookup?: RegisterLookupResult;
};
