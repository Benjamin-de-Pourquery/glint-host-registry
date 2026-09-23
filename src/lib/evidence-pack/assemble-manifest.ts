import { format } from "date-fns";
import packageJson from "../../../package.json";
import { getEvidencePackLabels } from "./labels";
import type {
  EvidencePackIdentityField,
  EvidencePackLoadedData,
  EvidencePackManifest,
  EvidencePackLocale,
} from "./types";

function pushIdentityField(
  fields: EvidencePackIdentityField[],
  key: string,
  label: string,
  value: string | null | undefined
) {
  if (value?.trim()) {
    fields.push({ key, label, value: value.trim() });
  }
}

function buildIdentityFields(
  data: EvidencePackLoadedData,
  locale: EvidencePackLocale
): EvidencePackIdentityField[] {
  const labels = getEvidencePackLabels(locale);
  const fields: EvidencePackIdentityField[] = [];
  const reg = data.registration;

  pushIdentityField(
    fields,
    "registrationNumber",
    labels.fieldRegistrationNumber,
    reg?.registrationNumber
  );
  pushIdentityField(
    fields,
    "issuingAuthority",
    labels.fieldIssuingAuthority,
    reg?.issuingAuthority
  );
  if (reg?.status) {
    pushIdentityField(fields, "status", labels.fieldStatus, reg.status);
  }
  if (reg?.issueDate) {
    pushIdentityField(
      fields,
      "issueDate",
      labels.fieldIssueDate,
      format(reg.issueDate, "yyyy-MM-dd")
    );
  }
  if (reg?.expiryDate) {
    pushIdentityField(
      fields,
      "expiryDate",
      labels.fieldExpiryDate,
      format(reg.expiryDate, "yyyy-MM-dd")
    );
  }

  pushIdentityField(fields, "propertyType", labels.fieldPropertyType, data.property.propertyType);
  pushIdentityField(
    fields,
    "residencyStatus",
    labels.fieldResidency,
    data.property.residencyStatus
  );

  pushIdentityField(fields, "cinNumber", labels.fieldCin, reg?.cinNumber);
  pushIdentityField(fields, "rnalNumber", labels.fieldRnal, reg?.rnalNumber);
  pushIdentityField(fields, "amaNumber", labels.fieldAma, reg?.amaNumber);
  pushIdentityField(
    fields,
    "hrCategorisationNumber",
    labels.fieldHrCategorisation,
    reg?.hrCategorisationNumber
  );
  pushIdentityField(
    fields,
    "nlRegistrationNumber",
    labels.fieldNlRegistration,
    reg?.nlRegistrationNumber
  );
  pushIdentityField(
    fields,
    "beRegistrationNumber",
    labels.fieldBeRegistration,
    reg?.beRegistrationNumber
  );

  if (data.nerMigration) {
    pushIdentityField(
      fields,
      "nationalRegistrationNumber",
      labels.fieldNationalNumber,
      data.nerMigration.nationalRegistrationNumber
    );
    pushIdentityField(
      fields,
      "nationalTransitionStatus",
      labels.fieldNationalStatus,
      data.nerMigration.nationalTransitionStatus
    );
    if (data.nerMigration.nationalRenewalDeadline) {
      pushIdentityField(
        fields,
        "nationalRenewalDeadline",
        labels.fieldNationalDeadline,
        data.nerMigration.nationalRenewalDeadline.slice(0, 10)
      );
    }
  }

  return fields;
}

export function assembleEvidencePackManifest(
  data: EvidencePackLoadedData,
  registrationId: string,
  periodStart: Date,
  periodEnd: Date,
  locale: EvidencePackLocale,
  generatedAt: Date = new Date()
): EvidencePackManifest {
  const labels = getEvidencePackLabels(locale);
  const identity = buildIdentityFields(data, locale);
  const channelsConfigured = data.channels.length > 0;

  const sections = [
    {
      id: "identity",
      title: labels.sectionIdentity,
      itemCount: identity.length,
      included: true,
    },
    {
      id: "playbook",
      title: labels.sectionPlaybook,
      itemCount: data.playbookSteps.length,
      included: data.playbookSteps.length > 0,
      omittedReason: data.playbookSteps.length === 0 ? labels.notApplicable : undefined,
    },
    {
      id: "stays",
      title: labels.sectionStays,
      itemCount: data.stays.length,
      included: true,
    },
    {
      id: "nightCap",
      title: labels.sectionNightCap,
      itemCount: data.nightCap ? 1 : 0,
      included: Boolean(data.nightCap),
      omittedReason: data.nightCap ? undefined : labels.notApplicable,
    },
    {
      id: "guestQueue",
      title: labels.sectionGuestQueue,
      itemCount: data.guestQueue.total,
      included: true,
    },
    {
      id: "channels",
      title: labels.sectionChannels,
      itemCount: data.channels.length,
      included: true,
      omittedReason: channelsConfigured ? undefined : labels.notConfigured,
    },
    {
      id: "healthScore",
      title: labels.sectionHealthScore,
      itemCount: data.healthScore?.factors.length ?? 0,
      included: Boolean(data.healthScore),
      omittedReason: data.healthScore ? undefined : labels.omitted,
    },
    {
      id: "ner",
      title: labels.sectionNer,
      itemCount: data.nerMigration ? 1 : 0,
      included: Boolean(data.nerMigration),
      omittedReason: data.nerMigration ? undefined : labels.notApplicable,
    },
    {
      id: "reconciliation",
      title: labels.sectionReconciliation,
      itemCount: data.reconciliationStatement?.findings.length ?? 0,
      included: Boolean(data.reconciliationStatement),
      omittedReason: data.reconciliationStatement ? undefined : labels.notApplicable,
    },
  ];

  return {
    generatedAt: generatedAt.toISOString(),
    productVersion: packageJson.version,
    registrationId,
    propertyId: data.property.id,
    propertyName: data.property.name,
    propertyAddress: `${data.property.address}, ${data.property.city}, ${data.property.country}`,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    locale,
    sections,
    identity,
    playbookSteps: data.playbookSteps,
    playbookSummary: data.playbookSummary,
    stays: data.stays,
    stayCount: data.stays.length,
    nightCap: data.nightCap,
    guestQueue: data.guestQueue,
    channels: data.channels.map((channel) => ({
      channel: channel.channel,
      listingUrl: channel.listingUrl,
      registrationNumberDisplayed: channel.registrationNumberDisplayed,
      displayStatus: channel.displayStatus,
    })),
    channelsConfigured,
    healthScore: data.healthScore,
    nerMigration: data.nerMigration,
    reconciliationStatement: data.reconciliationStatement,
  };
}
