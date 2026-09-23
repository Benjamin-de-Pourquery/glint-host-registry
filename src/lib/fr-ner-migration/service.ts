import { isFranceCountry } from "@/lib/national-transition";
import {
  defaultChannelUpdatesChecklist,
  mergeChannelUpdatesChecklist,
} from "./channels";
import {
  defaultDocumentsChecklist,
  mergeDocumentsChecklist,
} from "./documents";
import { inferFrNerMigrationStatus } from "./status";
import type {
  ChecklistItem,
  FrNerMigrationRecord,
  FrNerMigrationStatus,
  FrNerWizardStep,
} from "./types";
import { isFrNerMigrationStatus } from "./status";

type DbFrNerMigration = {
  id: string;
  registrationId: string;
  status: string;
  localRegistrationNumber: string | null;
  localIssuingCommune: string | null;
  nerNumber: string | null;
  nerIssuedAt: Date | null;
  transitionEndsAt: Date | null;
  documentsChecklist: string;
  channelUpdatesChecklist: string;
  notifyOnPortalOpen: boolean;
  wizardStep: string | null;
  updatedAt: Date;
};

type RegistrationSeed = {
  id: string;
  registrationNumber?: string | null;
  issuingAuthority?: string | null;
  nationalRegistrationNumber?: string | null;
};

function parseChecklistJson(raw: string): ChecklistItem[] {
  try {
    const parsed = JSON.parse(raw) as ChecklistItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.key === "string" && typeof item.done === "boolean"
    );
  } catch {
    return [];
  }
}

function stringifyChecklist(items: ChecklistItem[]): string {
  return JSON.stringify(items);
}

export function toFrNerMigrationRecord(row: DbFrNerMigration): FrNerMigrationRecord {
  return {
    id: row.id,
    registrationId: row.registrationId,
    status: isFrNerMigrationStatus(row.status) ? row.status : "NO_LOCAL",
    localRegistrationNumber: row.localRegistrationNumber,
    localIssuingCommune: row.localIssuingCommune,
    nerNumber: row.nerNumber,
    nerIssuedAt: row.nerIssuedAt?.toISOString() ?? null,
    transitionEndsAt: row.transitionEndsAt?.toISOString() ?? null,
    documentsChecklist: mergeDocumentsChecklist(parseChecklistJson(row.documentsChecklist)),
    channelUpdatesChecklist: mergeChannelUpdatesChecklist(
      parseChecklistJson(row.channelUpdatesChecklist)
    ),
    notifyOnPortalOpen: row.notifyOnPortalOpen,
    wizardStep: (row.wizardStep as FrNerWizardStep | null) ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function buildInitialMigrationData(registration: RegistrationSeed) {
  const localNumber = registration.registrationNumber?.trim() ?? "";
  const nerNumber = registration.nationalRegistrationNumber?.trim() ?? "";
  const documentsChecklist = defaultDocumentsChecklist();
  const status = inferFrNerMigrationStatus({
    localRegistrationNumber: localNumber || null,
    nerNumber: nerNumber || null,
    documentsChecklist,
  });

  return {
    status,
    localRegistrationNumber: localNumber || null,
    localIssuingCommune: registration.issuingAuthority?.trim() || null,
    nerNumber: nerNumber || null,
    documentsChecklist: stringifyChecklist(documentsChecklist),
    channelUpdatesChecklist: stringifyChecklist(defaultChannelUpdatesChecklist()),
    notifyOnPortalOpen: false,
  };
}

export type FrNerMigrationPatch = {
  status?: FrNerMigrationStatus;
  localRegistrationNumber?: string | null;
  localIssuingCommune?: string | null;
  nerNumber?: string | null;
  nerIssuedAt?: string | null;
  transitionEndsAt?: string | null;
  documentsChecklist?: ChecklistItem[];
  channelUpdatesChecklist?: ChecklistItem[];
  notifyOnPortalOpen?: boolean;
  wizardStep?: FrNerWizardStep | null;
};

export function applyFrNerMigrationPatch(
  current: FrNerMigrationRecord,
  patch: FrNerMigrationPatch
): {
  record: FrNerMigrationRecord;
  registrationSync: {
    registrationNumber?: string | null;
    issuingAuthority?: string | null;
    nationalRegistrationNumber?: string | null;
    nationalTransitionStatus?: string;
  } | null;
} {
  const documentsChecklist = patch.documentsChecklist
    ? mergeDocumentsChecklist(patch.documentsChecklist)
    : current.documentsChecklist;

  const channelUpdatesChecklist = patch.channelUpdatesChecklist
    ? mergeChannelUpdatesChecklist(patch.channelUpdatesChecklist)
    : current.channelUpdatesChecklist;

  const localRegistrationNumber =
    patch.localRegistrationNumber !== undefined
      ? patch.localRegistrationNumber?.trim() || null
      : current.localRegistrationNumber;

  const nerNumber =
    patch.nerNumber !== undefined
      ? patch.nerNumber?.trim() || null
      : current.nerNumber;

  const nerIssuedAt =
    patch.nerIssuedAt !== undefined
      ? patch.nerIssuedAt
      : current.nerIssuedAt;

  const transitionEndsAt =
    patch.transitionEndsAt !== undefined
      ? patch.transitionEndsAt
      : current.transitionEndsAt;

  const status = inferFrNerMigrationStatus({
    status: patch.status ?? current.status,
    explicitStatus: patch.status ?? null,
    localRegistrationNumber,
    nerNumber,
    documentsChecklist,
    transitionEndsAt,
  });

  const record: FrNerMigrationRecord = {
    ...current,
    status,
    localRegistrationNumber,
    localIssuingCommune:
      patch.localIssuingCommune !== undefined
        ? patch.localIssuingCommune?.trim() || null
        : current.localIssuingCommune,
    nerNumber,
    nerIssuedAt: nerIssuedAt,
    transitionEndsAt,
    documentsChecklist,
    channelUpdatesChecklist,
    notifyOnPortalOpen:
      patch.notifyOnPortalOpen !== undefined
        ? patch.notifyOnPortalOpen
        : current.notifyOnPortalOpen,
    wizardStep:
      patch.wizardStep !== undefined ? patch.wizardStep : current.wizardStep,
    updatedAt: new Date().toISOString(),
  };

  const registrationSync =
    patch.localRegistrationNumber !== undefined ||
    patch.localIssuingCommune !== undefined ||
    patch.nerNumber !== undefined
      ? {
          registrationNumber: localRegistrationNumber,
          issuingAuthority: record.localIssuingCommune,
          nationalRegistrationNumber: nerNumber,
          nationalTransitionStatus: nerNumber ? "renewed" : undefined,
        }
      : null;

  return { record, registrationSync };
}

export function frNerMigrationApplies(country: string): boolean {
  return isFranceCountry(country);
}
