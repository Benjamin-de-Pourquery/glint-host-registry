import type { EvidencePackLoadedData, EvidencePackWarning } from "./types";

export function runEvidencePackPrecheck(data: EvidencePackLoadedData): EvidencePackWarning[] {
  const warnings: EvidencePackWarning[] = [];

  const hasLocalNumber = Boolean(data.registration?.registrationNumber?.trim());
  const hasAnyCountryNumber = Boolean(
    data.registration?.cinNumber?.trim() ||
      data.registration?.rnalNumber?.trim() ||
      data.registration?.amaNumber?.trim() ||
      data.registration?.hrCategorisationNumber?.trim() ||
      data.registration?.nlRegistrationNumber?.trim() ||
      data.registration?.beRegistrationNumber?.trim() ||
      data.registration?.nationalRegistrationNumber?.trim()
  );

  if (!hasLocalNumber && !hasAnyCountryNumber) {
    warnings.push({ key: "missingRegistration", linkTab: "register" });
  }

  if (data.channels.length === 0) {
    warnings.push({ key: "noChannels", linkTab: "listings" });
  }

  if (data.playbookSummary && data.playbookSummary.total > 0) {
    const completionRate =
      data.playbookSummary.completed / data.playbookSummary.total;
    if (completionRate < 0.25) {
      warnings.push({ key: "lowPlaybookProgress", linkTab: "compliance" });
    }
  }

  if (data.stays.length === 0) {
    warnings.push({ key: "noStaysInPeriod" });
  }

  if (
    data.registration?.status === "not_started" ||
    !data.registration?.status
  ) {
    warnings.push({ key: "registrationNotStarted", linkTab: "register" });
  }

  return warnings;
}
