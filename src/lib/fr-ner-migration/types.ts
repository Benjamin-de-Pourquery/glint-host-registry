export const FR_NER_MIGRATION_STATUSES = [
  "NO_LOCAL",
  "HAS_LOCAL",
  "PREP_DONE",
  "SUBMITTED",
  "NER_ACTIVE",
  "STALE_LOCAL",
] as const;

export type FrNerMigrationStatus = (typeof FR_NER_MIGRATION_STATUSES)[number];

export const FR_NER_WIZARD_STEPS = [
  "account",
  "dossier",
  "submit",
  "ner_received",
  "update_listings",
] as const;

export type FrNerWizardStep = (typeof FR_NER_WIZARD_STEPS)[number];

export type ChecklistItem = {
  key: string;
  done: boolean;
};

export type FrNerMigrationRecord = {
  id: string;
  registrationId: string;
  status: FrNerMigrationStatus;
  localRegistrationNumber: string | null;
  localIssuingCommune: string | null;
  nerNumber: string | null;
  nerIssuedAt: string | null;
  transitionEndsAt: string | null;
  documentsChecklist: ChecklistItem[];
  channelUpdatesChecklist: ChecklistItem[];
  notifyOnPortalOpen: boolean;
  wizardStep: FrNerWizardStep | null;
  updatedAt: string;
};
