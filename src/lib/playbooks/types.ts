export type LocalizedText = {
  en: string;
  fr: string;
};

export type OfficialUrlRole = "rules" | "form" | "portal" | "tax" | "info";

export type OfficialUrl = {
  url: string;
  label: LocalizedText;
  role: OfficialUrlRole;
  urlVerified: boolean;
};

export type LocalizedStringList = {
  en: string[];
  fr: string[];
};

export type DocumentDetail = {
  name: LocalizedText;
  why: LocalizedText;
};

export type StepAppliesWhen =
  | "always"
  | "primaryResidence"
  | "secondaryResidence"
  | "nonPrimary";

export type ResidencyStatus = "primary" | "secondary" | "other";

export type PlaybookStep = {
  key: string;
  title: LocalizedText;
  instruction: LocalizedText;
  officialUrls: OfficialUrl[];
  documents: LocalizedStringList;
  /** Optional detailed document list with rationale (shown in next-action UI) */
  documentsDetailed?: DocumentDetail[];
  timeline?: LocalizedText;
  pitfalls?: LocalizedText;
  /** When this step applies — defaults to "always" */
  appliesWhen?: StepAppliesWhen;
  /** Property field keys to include when copying prepared values */
  fieldHints?: Array<
    | "name"
    | "address"
    | "city"
    | "country"
    | "propertyType"
    | "notes"
    | "residencyStatus"
  >;
};

export type Playbook = {
  id: string;
  country: string;
  city?: string;
  title: LocalizedText;
  description: LocalizedText;
  /** ISO date of last content review against official sources */
  sourceReviewedAt?: string;
  steps: PlaybookStep[];
};

export type StepProgressStatus = "pending" | "done" | "skipped";

export type PlaybookStepProgress = {
  stepKey: string;
  status: StepProgressStatus;
  completedAt?: string | null;
};

export type PropertyFieldValues = {
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  notes?: string | null;
  residencyStatus?: ResidencyStatus | null;
};
