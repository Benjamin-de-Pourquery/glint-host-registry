import type { LocalizedText } from "@/lib/playbooks/types";

export type PlatformBlockStep = {
  key: string;
  title: LocalizedText;
  instruction: LocalizedText;
  copyChips?: Array<{ key: string; label: LocalizedText; template: LocalizedText }>;
  officialUrls: Array<{
    url: string;
    label: LocalizedText;
    urlVerified: boolean;
  }>;
};

export const PLATFORM_BLOCK_OFFICIAL_URLS = {
  apiMeubles: {
    url: "https://www.entreprises.gouv.fr/espace-entreprises/s-informer-sur-la-reglementation/lapi-meubles-guichet-unique-de-centralisation",
    label: {
      en: "entreprises.gouv.fr — API Meublés (DGE)",
      fr: "entreprises.gouv.fr — API Meublés (DGE)",
    },
    urlVerified: true,
  },
  servicePublicNational: {
    url: "https://www.service-public.gouv.fr/particuliers/actualites/A18880",
    label: {
      en: "Service-Public — national registration news",
      fr: "Service-Public — actualité enregistrement national",
    },
    urlVerified: true,
  },
  servicePublicDeclaration: {
    url: "https://www.service-public.fr/particuliers/vosdroits/F2043",
    label: {
      en: "Service-Public — furnished tourist rental declaration",
      fr: "Service-Public — déclaration location meublée touristique",
    },
    urlVerified: true,
  },
  euRegulation: {
    url: "https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1028",
    label: {
      en: "EU Regulation 2024/1028 (official text)",
      fr: "Règlement UE 2024/1028 (texte officiel)",
    },
    urlVerified: true,
  },
} as const;

export function getPlatformBlockPlaybook(options: {
  channel: string;
  registrationNumber?: string | null;
  nationalRegistrationNumber?: string | null;
  city?: string;
  complianceTabHref?: string;
}): PlatformBlockStep[] {
  const ner =
    options.nationalRegistrationNumber?.trim() ||
    options.registrationNumber?.trim() ||
    "";
  const channelLabel = options.channel;

  return [
    {
      key: "confirm-block",
      title: {
        en: "Confirm the platform block reason",
        fr: "Confirmer la raison du blocage plateforme",
      },
      instruction: {
        en: `Open your ${channelLabel} listing and note the exact message (missing registration number, invalid number, or policy hold). Screenshot the notification and the listing editor field where the number should appear.`,
        fr: `Ouvrez votre annonce ${channelLabel} et notez le message exact (numéro manquant, numéro invalide ou suspension). Capturez la notification et le champ d'enregistrement dans l'éditeur d'annonce.`,
      },
      officialUrls: [PLATFORM_BLOCK_OFFICIAL_URLS.euRegulation],
    },
    {
      key: "verify-regime",
      title: {
        en: "Verify which registration regime applies (Sept 2026)",
        fr: "Vérifier le régime d'enregistrement applicable (sept. 2026)",
      },
      instruction: {
        en: "Until Q4 2026, France's national API Meublés portal is not yet open. Use your valid municipal registration number (commune teleservice or Cerfa 14004*04 procedure) on listings. Do not confuse: (1) furnished tourist rental declaration/enregistrement, (2) change-of-use authorization for non-primary residences, and (3) the 120/90-day primary residence cap — these are separate requirements.",
        fr: "Jusqu'au T4 2026, le portail national API Meublés n'est pas encore ouvert. Utilisez votre numéro d'enregistrement municipal valide (téléservice communal ou Cerfa 14004*04) sur les annonces. Ne confondez pas : (1) déclaration/enregistrement meublé de tourisme, (2) autorisation de changement d'usage pour résidences non principales, et (3) plafond 120/90 jours pour résidence principale — ce sont des obligations distinctes.",
      },
      officialUrls: [
        PLATFORM_BLOCK_OFFICIAL_URLS.apiMeubles,
        PLATFORM_BLOCK_OFFICIAL_URLS.servicePublicNational,
        PLATFORM_BLOCK_OFFICIAL_URLS.servicePublicDeclaration,
      ],
    },
    {
      key: "gather-evidence",
      title: {
        en: "Gather evidence for platform appeal",
        fr: "Rassembler les preuves pour le recours plateforme",
      },
      instruction: {
        en: "Collect: municipal registration proof (number + declaration receipt), screenshots of the listing block, your property address, and links to official commune procedure. Glint does not contact platforms or mairies on your behalf.",
        fr: "Rassemblez : justificatif d'enregistrement municipal (numéro + accusé de déclaration), captures du blocage, adresse du bien et liens vers la procédure communale officielle. Glint ne contacte pas les plateformes ni les mairies pour vous.",
      },
      copyChips: [
        {
          key: "appeal-intro",
          label: {
            en: "Appeal intro (copy)",
            fr: "Introduction recours (copier)",
          },
          template: {
            en: `Hello, my ${channelLabel} listing was blocked for a missing or invalid registration number. I have a valid French municipal registration number (${ner || "[your NER]"}). The national API Meublés portal is not yet open (expected Q4 2026 per DGE). I am attaching proof of municipal registration and official sources.`,
            fr: `Bonjour, mon annonce ${channelLabel} a été bloquée pour numéro d'enregistrement manquant ou invalide. Je dispose d'un numéro d'enregistrement municipal français valide (${ner || "[votre NER]"}). Le portail national API Meublés n'est pas encore ouvert (prévu T4 2026 selon la DGE). Je joins les justificatifs d'enregistrement municipal et les sources officielles.`,
          },
        },
        {
          key: "ner-line",
          label: {
            en: "Registration number line",
            fr: "Ligne numéro d'enregistrement",
          },
          template: {
            en: `Registration number (NER): ${ner || "[your municipal NER]"}`,
            fr: `Numéro d'enregistrement (NER) : ${ner || "[votre NER municipal]"}`,
          },
        },
      ],
      officialUrls: [
        PLATFORM_BLOCK_OFFICIAL_URLS.apiMeubles,
        PLATFORM_BLOCK_OFFICIAL_URLS.servicePublicNational,
      ],
    },
    {
      key: "restore-listing",
      title: {
        en: "Restore listing checklist",
        fr: "Checklist de rétablissement de l'annonce",
      },
      instruction: {
        en: "1) Enter the correct municipal NER in the platform listing field. 2) Upload appeal evidence via the platform support channel. 3) Mark the number as present in Glint once visible on the live listing. 4) Plan national portal migration when API Meublés opens.",
        fr: "1) Saisir le NER municipal correct dans le champ plateforme. 2) Envoyer les preuves via le support plateforme. 3) Marquer le numéro comme présent dans Glint une fois visible sur l'annonce en ligne. 4) Prévoir la migration vers le portail national à l'ouverture de l'API Meublés.",
      },
      officialUrls: [PLATFORM_BLOCK_OFFICIAL_URLS.euRegulation],
    },
  ];
}
