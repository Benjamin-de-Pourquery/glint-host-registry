import type { NightCapComputation } from "@/lib/france/night-cap";
import type { ListingChannelRecord } from "@/lib/listings/channels";
import type { PlaybookStepProgress } from "@/lib/playbooks/types";

export type EvidencePackLocale = "en" | "fr";

export type EvidencePackPeriodPreset = "90d" | "calendar_year" | "custom";

export type EvidencePackRequest = {
  registrationId: string;
  propertyId: string;
  periodStart: Date;
  periodEnd: Date;
  locale: EvidencePackLocale;
};

export type EvidencePackIdentityField = {
  key: string;
  label: string;
  value: string;
};

export type EvidencePackPlaybookStep = {
  stepKey: string;
  title: string;
  status: "pending" | "done" | "skipped";
  completedAt: string | null;
};

export type EvidencePackStay = {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  source: string;
  channel: string | null;
};

export type EvidencePackGuestQueueItem = {
  system: string;
  queueStatus: string;
  deadline: string;
  updatedAt: string;
};

export type EvidencePackGuestQueueSummary = {
  total: number;
  byStatus: Record<string, number>;
  items: EvidencePackGuestQueueItem[];
};

export type EvidencePackHealthScore = {
  score: string;
  factors: Array<{ id: string; label: string; status: string }>;
};

export type EvidencePackChannel = {
  channel: string;
  listingUrl: string;
  registrationNumberDisplayed: string | null;
  displayStatus: string;
};

export type EvidencePackSection = {
  id: string;
  title: string;
  itemCount: number;
  included: boolean;
  omittedReason?: string;
};

export type EvidencePackReconciliationRow = {
  channel: string;
  platformNights: number;
  platformReservations: number;
  registrationKeyDisplayed: string | null;
};

export type EvidencePackReconciliationFinding = {
  code: string;
  severity: string;
};

export type EvidencePackReconciliationStatement = {
  openFindingsCount: number;
  touristTaxNightsDeclared: number | null;
  nightCapUsed: number;
  nightCapLimit: number | null;
  channels: EvidencePackReconciliationRow[];
  findings: EvidencePackReconciliationFinding[];
};

export type EvidencePackManifest = {
  generatedAt: string;
  productVersion: string;
  registrationId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  periodStart: string;
  periodEnd: string;
  locale: EvidencePackLocale;
  sections: EvidencePackSection[];
  identity: EvidencePackIdentityField[];
  playbookSteps: EvidencePackPlaybookStep[];
  playbookSummary: { completed: number; total: number; skipped: number } | null;
  stays: EvidencePackStay[];
  stayCount: number;
  nightCap: NightCapComputation | null;
  capGuard: {
    mode: string;
    activeSince: string;
    propagationConfirmedAt: string | null;
  } | null;
  guestQueue: EvidencePackGuestQueueSummary;
  channels: EvidencePackChannel[];
  channelsConfigured: boolean;
  healthScore: EvidencePackHealthScore | null;
  nerMigration: {
    nationalRegistrationNumber: string | null;
    nationalTransitionStatus: string | null;
    nationalRenewalDeadline: string | null;
  } | null;
  reconciliationStatement: EvidencePackReconciliationStatement | null;
};

export type EvidencePackWarning = {
  key: string;
  linkTab?: "register" | "listings" | "compliance";
};

export type EvidencePackLoadedData = {
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    propertyType: string;
    residencyStatus: string | null;
  };
  registration: {
    id: string;
    registrationNumber: string | null;
    issuingAuthority: string | null;
    status: string;
    issueDate: Date | null;
    expiryDate: Date | null;
    nationalRegistrationNumber: string | null;
    nationalTransitionStatus: string;
    nationalRenewalDeadline: Date | null;
    cinNumber: string | null;
    rnalNumber: string | null;
    amaNumber: string | null;
    hrCategorisationNumber: string | null;
    nlRegistrationNumber: string | null;
    beRegistrationNumber: string | null;
  } | null;
  playbookSteps: EvidencePackPlaybookStep[];
  playbookSummary: { completed: number; total: number; skipped: number } | null;
  stays: EvidencePackStay[];
  nightCap: NightCapComputation | null;
  capGuard: {
    mode: string;
    activeSince: string;
    propagationConfirmedAt: string | null;
  } | null;
  guestQueue: EvidencePackGuestQueueSummary;
  channels: ListingChannelRecord[];
  healthScore: EvidencePackHealthScore | null;
  nerMigration: EvidencePackManifest["nerMigration"];
  reconciliationStatement: EvidencePackReconciliationStatement | null;
};

export type { PlaybookStepProgress };
