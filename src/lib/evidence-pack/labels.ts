import type { EvidencePackLocale } from "./types";

export type EvidencePackLabels = {
  productTitle: string;
  disclaimer: string;
  disclaimerTitle: string;
  coverPeriod: string;
  coverGenerated: string;
  sectionIdentity: string;
  sectionPlaybook: string;
  sectionStays: string;
  sectionNightCap: string;
  sectionGuestQueue: string;
  sectionChannels: string;
  sectionHealthScore: string;
  sectionNer: string;
  sectionReconciliation: string;
  reconciliationOpenFindings: string;
  reconciliationPlatformNights: string;
  reconciliationTouristTax: string;
  reconciliationNightCap: string;
  sectionHowToRead: string;
  howToReadBody: string;
  notConfigured: string;
  notApplicable: string;
  omitted: string;
  noStays: string;
  noQueueItems: string;
  fieldRegistrationNumber: string;
  fieldIssuingAuthority: string;
  fieldStatus: string;
  fieldIssueDate: string;
  fieldExpiryDate: string;
  fieldNationalNumber: string;
  fieldNationalStatus: string;
  fieldNationalDeadline: string;
  fieldCin: string;
  fieldRnal: string;
  fieldAma: string;
  fieldHrCategorisation: string;
  fieldNlRegistration: string;
  fieldBeRegistration: string;
  fieldPropertyType: string;
  fieldResidency: string;
  fieldCapacity: string;
  nightCapUsed: string;
  nightCapLimit: string;
  nightCapRemaining: string;
  stayCheckIn: string;
  stayCheckOut: string;
  stayNights: string;
  staySource: string;
  stayChannel: string;
  channelUrl: string;
  channelNumber: string;
  channelStatus: string;
  queueSystem: string;
  queueStatus: string;
  queueDeadline: string;
  playbookStatusPending: string;
  playbookStatusDone: string;
  playbookStatusSkipped: string;
  healthScore: string;
  healthFactors: string;
  footer: string;
};

const LABELS: Record<EvidencePackLocale, EvidencePackLabels> = {
  en: {
    productTitle: "Compliance Evidence Pack",
    disclaimer:
      "This document is an operational aid generated from your Host Registry records. It is not an official certificate, legal opinion, or authority-issued compliance document.",
    disclaimerTitle: "Important notice",
    coverPeriod: "Coverage period",
    coverGenerated: "Generated on",
    sectionIdentity: "Operational identity",
    sectionPlaybook: "Playbook progress",
    sectionStays: "Stays in period",
    sectionNightCap: "Night cap summary",
    sectionGuestQueue: "Guest compliance queue",
    sectionChannels: "Listing channels",
    sectionHealthScore: "Listing health snapshot",
    sectionNer: "National registration (NER)",
    sectionReconciliation: "Operational reconciliation statement",
    reconciliationOpenFindings: "Open findings",
    reconciliationPlatformNights: "Platform nights",
    reconciliationTouristTax: "Tourist tax nights declared",
    reconciliationNightCap: "Night cap used",
    sectionHowToRead: "How to read this pack",
    howToReadBody:
      "Each section reflects data recorded in Host Registry at generation time. Cross-check registration numbers and deadlines against your municipal or national portals. For official rules, follow the playbook links in the app.",
    notConfigured: "Not configured",
    notApplicable: "Not applicable",
    omitted: "Section omitted (data not available)",
    noStays: "No stays recorded in this period.",
    noQueueItems: "No guest queue items in scope.",
    fieldRegistrationNumber: "Local registration number",
    fieldIssuingAuthority: "Issuing authority",
    fieldStatus: "Registration status",
    fieldIssueDate: "Issue date",
    fieldExpiryDate: "Expiry date",
    fieldNationalNumber: "National (NER) number",
    fieldNationalStatus: "National transition status",
    fieldNationalDeadline: "National renewal deadline",
    fieldCin: "Italy CIN",
    fieldRnal: "Portugal RNAL",
    fieldAma: "Greece AMA",
    fieldHrCategorisation: "Croatia categorisation",
    fieldNlRegistration: "Netherlands registration",
    fieldBeRegistration: "Belgium registration",
    fieldPropertyType: "Property type",
    fieldResidency: "Residency status",
    fieldCapacity: "Capacity",
    nightCapUsed: "Nights used",
    nightCapLimit: "Annual limit",
    nightCapRemaining: "Remaining",
    stayCheckIn: "Check-in",
    stayCheckOut: "Check-out",
    stayNights: "Nights",
    staySource: "Source",
    stayChannel: "Channel",
    channelUrl: "Listing URL",
    channelNumber: "Number displayed",
    channelStatus: "Display status",
    queueSystem: "System",
    queueStatus: "Status",
    queueDeadline: "Deadline",
    playbookStatusPending: "Pending",
    playbookStatusDone: "Done",
    playbookStatusSkipped: "Skipped",
    healthScore: "Health score",
    healthFactors: "Factors",
    footer: "Glint Host Registry: operational evidence pack",
  },
  fr: {
    productTitle: "Pack preuve conformité",
    disclaimer:
      "Ce document est une aide opérationnelle générée à partir de vos enregistrements Host Registry. Il ne constitue pas un certificat officiel, un avis juridique ni un document de conformité émis par une autorité.",
    disclaimerTitle: "Avis important",
    coverPeriod: "Période couverte",
    coverGenerated: "Généré le",
    sectionIdentity: "Identité opérationnelle",
    sectionPlaybook: "Progression playbook",
    sectionStays: "Séjours sur la période",
    sectionNightCap: "Synthèse plafond de nuitées",
    sectionGuestQueue: "File conformité voyageurs",
    sectionChannels: "Canaux d'annonce",
    sectionHealthScore: "Instantané santé annonce",
    sectionNer: "Enregistrement national (NER)",
    sectionReconciliation: "Relevé de rapprochement opérationnel",
    reconciliationOpenFindings: "Écarts ouverts",
    reconciliationPlatformNights: "Nuitées plateforme",
    reconciliationTouristTax: "Nuitées taxe de séjour déclarées",
    reconciliationNightCap: "Plafond de nuitées utilisé",
    sectionHowToRead: "Comment lire ce pack",
    howToReadBody:
      "Chaque section reflète les données enregistrées dans Host Registry au moment de la génération. Vérifiez les numéros et échéances sur vos portails municipaux ou nationaux. Pour les règles officielles, suivez les liens playbook dans l'application.",
    notConfigured: "Non configuré",
    notApplicable: "Non applicable",
    omitted: "Section omise (données non disponibles)",
    noStays: "Aucun séjour enregistré sur cette période.",
    noQueueItems: "Aucun élément de file voyageurs dans le périmètre.",
    fieldRegistrationNumber: "Numéro d'enregistrement local",
    fieldIssuingAuthority: "Autorité compétente",
    fieldStatus: "Statut d'enregistrement",
    fieldIssueDate: "Date de délivrance",
    fieldExpiryDate: "Date d'expiration",
    fieldNationalNumber: "Numéro national (NER)",
    fieldNationalStatus: "Statut transition nationale",
    fieldNationalDeadline: "Échéance renouvellement national",
    fieldCin: "CIN Italie",
    fieldRnal: "RNAL Portugal",
    fieldAma: "AMA Grèce",
    fieldHrCategorisation: "Catégorisation Croatie",
    fieldNlRegistration: "Enregistrement Pays-Bas",
    fieldBeRegistration: "Enregistrement Belgique",
    fieldPropertyType: "Type de logement",
    fieldResidency: "Statut de résidence",
    fieldCapacity: "Capacité",
    nightCapUsed: "Nuitées utilisées",
    nightCapLimit: "Plafond annuel",
    nightCapRemaining: "Restant",
    stayCheckIn: "Arrivée",
    stayCheckOut: "Départ",
    stayNights: "Nuitées",
    staySource: "Source",
    stayChannel: "Canal",
    channelUrl: "URL annonce",
    channelNumber: "Numéro affiché",
    channelStatus: "Statut affichage",
    queueSystem: "Système",
    queueStatus: "Statut",
    queueDeadline: "Échéance",
    playbookStatusPending: "À faire",
    playbookStatusDone: "Terminé",
    playbookStatusSkipped: "Ignoré",
    healthScore: "Score santé",
    healthFactors: "Facteurs",
    footer: "Glint Host Registry : pack preuve opérationnel",
  },
};

export function getEvidencePackLabels(locale: EvidencePackLocale): EvidencePackLabels {
  return LABELS[locale];
}
