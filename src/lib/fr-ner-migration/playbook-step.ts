import type { PlaybookStep } from "@/lib/playbooks/types";
import { NER_MIGRATION_TIMELINE } from "./config";
import {
  API_MEUBLES_INFO_URL,
  ENTREPRISES_API_MEUBLES_URL,
  SERVICE_PUBLIC_NATIONAL_URL,
} from "./official-links";

export function buildNerMigrationPrepStep(cityKey: string): PlaybookStep {
  const portalLabel = NER_MIGRATION_TIMELINE.portalOpensLabel;

  return {
    key: `${cityKey}-ner-migration-prep`,
    title: {
      en: "Prepare NER national migration dossier",
      fr: "Préparer le dossier migration NER national",
    },
    instruction: {
      en: `France's national furnished-rental teleservice (API Meublés / Démarche Numérique) is expected to open in ${portalLabel.en}. Use the NER Migration Cockpit to inventory your current municipal number, complete the document checklist, and opt in to be notified when the portal opens. When the teleservice is live, follow the guided wizard to record your NER and mark each listing channel updated. This is operational guidance, not legal advice.`,
      fr: `Le téléservice national d'enregistrement des meublés (API Meublés / Démarche Numérique) devrait ouvrir au ${portalLabel.fr}. Utilisez le Cockpit migration NER pour inventorier votre numéro communal actuel, compléter la checklist pièces et activer l'alerte à l'ouverture du portail. Quand le téléservice sera en ligne, suivez l'assistant guidé pour saisir votre NER et marquer chaque canal d'annonce à jour. Aide opérationnelle, pas un conseil juridique.`,
    },
    officialUrls: [
      {
        url: API_MEUBLES_INFO_URL,
        label: {
          en: "API Meublés — understand the national system (DGE)",
          fr: "API Meublés — comprendre le dispositif national (DGE)",
        },
        role: "info",
        urlVerified: false,
      },
      {
        url: SERVICE_PUBLIC_NATIONAL_URL,
        label: {
          en: "Service-Public — national registration news",
          fr: "Service-Public — actualité enregistrement national",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: ENTREPRISES_API_MEUBLES_URL,
        label: {
          en: "entreprises.gouv.fr — API Meublés central portal",
          fr: "entreprises.gouv.fr — guichet unique API Meublés",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "National ID or passport of the owner/landlord",
        "Proof of address for the rental property",
        "Current municipal registration number and commune of issue",
        "Listing URLs (Airbnb, Booking, Vrbo, etc.)",
        "Co-ownership attestation if required by your building",
        "Change-of-use authorization if your city requires it",
      ],
      fr: [
        "Pièce d'identité du propriétaire/loueur",
        "Justificatif d'adresse du logement loué",
        "Numéro d'enregistrement communal actuel et commune de délivrance",
        "URLs des annonces (Airbnb, Booking, Vrbo, etc.)",
        "Attestation de copropriété si exigée par l'immeuble",
        "Autorisation de changement d'usage si votre ville l'exige",
      ],
    },
    timeline: {
      en: `National portal expected ${portalLabel.en}. Gather documents now; transition end date will be published at launch.`,
      fr: `Portail national attendu au ${portalLabel.fr}. Rassemblez les pièces dès maintenant ; la date de fin de transition sera publiée au lancement.`,
    },
    pitfalls: {
      en: "Platforms may require a registration number now while the national portal is not yet open. Use your valid municipal number on listings in the interim. Glint does not submit filings to mairies or the national teleservice.",
      fr: "Les plateformes peuvent exiger un numéro dès maintenant alors que le portail national n'est pas ouvert. Utilisez votre numéro municipal valide en attendant. Glint ne dépose pas de dossiers auprès des mairies ni du téléservice national.",
    },
    fieldHints: ["address", "city", "country", "propertyType", "residencyStatus", "notes"],
  };
}
