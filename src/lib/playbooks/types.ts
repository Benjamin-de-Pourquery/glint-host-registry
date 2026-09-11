export type LocalizedText = {
  en: string;
  fr: string;
};

export type OfficialUrl = {
  url: string;
  label: LocalizedText;
  urlVerified: boolean;
};

export type LocalizedStringList = {
  en: string[];
  fr: string[];
};

export type PlaybookStep = {
  key: string;
  title: LocalizedText;
  instruction: LocalizedText;
  officialUrls: OfficialUrl[];
  documents: LocalizedStringList;
  timeline?: LocalizedText;
  pitfalls?: LocalizedText;
  /** Property field keys to include when copying prepared values */
  fieldHints?: Array<
    "name" | "address" | "city" | "country" | "propertyType" | "notes"
  >;
};

export type Playbook = {
  id: string;
  country: string;
  city?: string;
  title: LocalizedText;
  description: LocalizedText;
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
};
