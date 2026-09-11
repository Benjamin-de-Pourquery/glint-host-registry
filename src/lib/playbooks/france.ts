import type { Playbook, PlaybookStep, LocalizedText } from "./types";

const frSteps = {
  verifyRules: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-verify-rules`,
    title: {
      en: "Check local STR rules and quotas",
      fr: "Vérifier la réglementation locale et les quotas",
    },
    instruction: {
      en: "Confirm your property type and rental use are allowed in your zone. Many French cities enforce 120-night caps or change-of-use rules for primary residences.",
      fr: "Confirmez que votre type de bien et l'usage locatif sont autorisés dans votre zone. De nombreuses villes appliquent un plafond de 120 nuitées/an ou des règles de changement d'usage.",
    },
    officialUrls: [
      {
        url: "https://www.service-public.fr/particuliers/vosdroits/F35928",
        label: {
          en: "Service-Public — furnished tourist rental",
          fr: "Service-Public — location meublée touristique",
        },
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Proof of address and property title or lease",
        "Estimated annual rental nights",
        "Co-ownership bylaws (if applicable)",
      ],
      fr: [
        "Justificatif de domicile et titre de propriété ou bail",
        "Estimation du nombre de nuitées annuelles",
        "Règlement de copropriété (le cas échéant)",
      ],
    },
    timeline: {
      en: "Allow 1–3 days for research before filing.",
      fr: "Prévoir 1 à 3 jours de recherche avant le dépôt.",
    },
    pitfalls: {
      en: "Paris and other cities may require change-of-use authorization before registration.",
      fr: "Paris et d'autres villes peuvent exiger une autorisation de changement d'usage avant l'enregistrement.",
    },
    fieldHints: ["address", "city", "country", "propertyType"],
  }),

  municipalRegistration: (
    cityKey: string,
    urls: Array<{ url: string; label: LocalizedText; urlVerified: boolean }>,
    authorityHint: LocalizedText
  ): PlaybookStep => ({
    key: `${cityKey}-municipal-registration`,
    title: {
      en: "Register with the municipality",
      fr: "S'inscrire auprès de la mairie / collectivité",
    },
    instruction: {
      en: `Submit your furnished tourist rental declaration to the local authority (${authorityHint.en}). You will receive a registration number to display on listings.`,
      fr: `Déposez votre déclaration de location meublée touristique auprès de la collectivité (${authorityHint.fr}). Vous recevrez un numéro d'enregistrement à afficher sur vos annonces.`,
    },
    officialUrls: urls,
    documents: {
      en: [
        "National ID or passport",
        "Proof of ownership or authorization to rent",
        "Property address and cadastral reference if available",
        "IBAN for local tax payments",
      ],
      fr: [
        "Pièce d'identité",
        "Justificatif de propriété ou d'autorisation de louer",
        "Adresse du bien et référence cadastrale si disponible",
        "IBAN pour le paiement des taxes locales",
      ],
    },
    timeline: {
      en: "Processing typically takes 2–6 weeks depending on the city.",
      fr: "Le traitement prend généralement 2 à 6 semaines selon la ville.",
    },
    pitfalls: {
      en: "Incomplete co-ownership consent is a common cause of rejection.",
      fr: "L'absence d'accord de copropriété est une cause fréquente de rejet.",
    },
    fieldHints: ["name", "address", "city", "country", "propertyType"],
  }),

  taxDeclaration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-tax-declaration`,
    title: {
      en: "Declare rental activity to tax authorities",
      fr: "Déclarer l'activité locative aux impôts",
    },
    instruction: {
      en: "Register your furnished rental activity with the tax administration (SIRET if professional, or appropriate tax category for non-professional hosts).",
      fr: "Immatriculez votre activité de location meublée auprès de l'administration fiscale (SIRET si activité professionnelle, ou régime adapté pour les non-professionnels).",
    },
    officialUrls: [
      {
        url: "https://www.impots.gouv.fr/particulier/les-revenus-de-location-meublee",
        label: {
          en: "impots.gouv.fr — furnished rental income",
          fr: "impots.gouv.fr — revenus de location meublée",
        },
        urlVerified: true,
      },
      {
        url: "https://procedures.inpi.fr/",
        label: {
          en: "INPI — business registration portal",
          fr: "INPI — guichet unique d'immatriculation",
        },
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Municipal registration number", "Estimated annual rental income", "IBAN"],
      fr: [
        "Numéro d'enregistrement municipal",
        "Estimation des revenus locatifs annuels",
        "IBAN",
      ],
    },
    timeline: {
      en: "Complete within 15 days of starting rental activity.",
      fr: "À effectuer dans les 15 jours suivant le début de l'activité.",
    },
    fieldHints: ["address", "city", "country"],
  }),

  updateListings: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-update-listings`,
    title: {
      en: "Add registration number to platform listings",
      fr: "Ajouter le numéro d'enregistrement sur les plateformes",
    },
    instruction: {
      en: "Enter your municipal registration number on Airbnb, Booking.com, Vrbo, and any other channels. EU Regulation 2024/1028 requires platforms to verify this number.",
      fr: "Saisissez votre numéro d'enregistrement municipal sur Airbnb, Booking.com, Vrbo et les autres canaux. Le règlement UE 2024/1028 impose aux plateformes de vérifier ce numéro.",
    },
    officialUrls: [
      {
        url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028",
        label: {
          en: "EU Regulation 2024/1028 (official text)",
          fr: "Règlement UE 2024/1028 (texte officiel)",
        },
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Registration number", "Platform account access"],
      fr: ["Numéro d'enregistrement", "Accès aux comptes plateformes"],
    },
    fieldHints: ["name", "notes"],
  }),

  guestRegister: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-guest-register`,
    title: {
      en: "Set up guest register and data retention",
      fr: "Mettre en place le registre des voyageurs",
    },
    instruction: {
      en: "Maintain a guest register with identity details as required by French law. Keep records for the statutory retention period.",
      fr: "Tenez un registre des voyageurs avec les informations d'identité exigées par la loi française. Conservez les données pendant la durée légale.",
    },
    officialUrls: [
      {
        url: "https://www.service-public.fr/particuliers/vosdroits/F33463",
        label: {
          en: "Service-Public — furnished rental obligations",
          fr: "Service-Public — obligations location meublée",
        },
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Guest register template", "Secure storage for identity copies"],
      fr: ["Modèle de registre des voyageurs", "Stockage sécurisé des copies d'identité"],
    },
    fieldHints: ["address", "city"],
  }),
};

export const FRANCE_PLAYBOOKS: Playbook[] = [
  {
    id: "fr-paris",
    country: "France",
    city: "Paris",
    title: {
      en: "Paris furnished tourist rental",
      fr: "Location meublée touristique — Paris",
    },
    description: {
      en: "Step-by-step guide for registering a short-term rental in Paris, including change-of-use rules where applicable.",
      fr: "Guide pas à pas pour enregistrer une location courte durée à Paris, y compris les règles de changement d'usage le cas échéant.",
    },
    steps: [
      {
        ...frSteps.verifyRules("paris"),
        pitfalls: {
          en: "Primary residences in Paris require change-of-use authorization before registration (120-night cap).",
          fr: "Les résidences principales à Paris nécessitent une autorisation de changement d'usage (plafond 120 nuitées).",
        },
        officialUrls: [
          {
            url: "https://www.paris.fr/pages/louer-son-logement-pour-le-tourisme-396",
            label: {
              en: "City of Paris — renting for tourism",
              fr: "Ville de Paris — louer son logement pour le tourisme",
            },
            urlVerified: true,
          },
          ...frSteps.verifyRules("paris").officialUrls,
        ],
      },
      frSteps.municipalRegistration(
        "paris",
        [
          {
            url: "https://www.paris.fr/pages/louer-son-logement-pour-le-tourisme-396",
            label: {
              en: "Paris registration portal (verify on official site)",
              fr: "Portail d'enregistrement Paris (vérifier sur le site officiel)",
            },
            urlVerified: true,
          },
        ],
        { en: "Mairie de Paris", fr: "Mairie de Paris" }
      ),
      frSteps.taxDeclaration("paris"),
      frSteps.updateListings("paris"),
      frSteps.guestRegister("paris"),
    ],
  },
  {
    id: "fr-lyon",
    country: "France",
    city: "Lyon",
    title: {
      en: "Lyon Metropole furnished rental",
      fr: "Location meublée — Métropole de Lyon",
    },
    description: {
      en: "Registration and compliance steps for short-term rentals in Lyon and the Metropole.",
      fr: "Étapes d'enregistrement et de conformité pour les locations courte durée à Lyon et dans la Métropole.",
    },
    steps: [
      {
        ...frSteps.verifyRules("lyon"),
        officialUrls: [
          {
            url: "https://www.grandlyon.com/services/location-meublee-tourisme.html",
            label: {
              en: "Métropole de Lyon — furnished tourist rental",
              fr: "Métropole de Lyon — location meublée touristique",
            },
            urlVerified: true,
          },
        ],
      },
      frSteps.municipalRegistration(
        "lyon",
        [
          {
            url: "https://www.grandlyon.com/services/location-meublee-tourisme.html",
            label: {
              en: "Métropole de Lyon registration info",
              fr: "Informations d'enregistrement Métropole de Lyon",
            },
            urlVerified: true,
          },
        ],
        { en: "Métropole de Lyon", fr: "Métropole de Lyon" }
      ),
      frSteps.taxDeclaration("lyon"),
      frSteps.updateListings("lyon"),
      frSteps.guestRegister("lyon"),
    ],
  },
  {
    id: "fr-marseille",
    country: "France",
    city: "Marseille",
    title: {
      en: "Marseille furnished tourist rental",
      fr: "Location meublée touristique — Marseille",
    },
    description: {
      en: "Compliance playbook for short-term rentals in Marseille and the Metropole.",
      fr: "Playbook de conformité pour les locations courte durée à Marseille et dans la Métropole.",
    },
    steps: [
      {
        ...frSteps.verifyRules("marseille"),
        officialUrls: [
          {
            url: "https://www.marseille.fr/logement-urbanisme/location-meublee-tourisme",
            label: {
              en: "City of Marseille — furnished tourist rental",
              fr: "Ville de Marseille — location meublée touristique",
            },
            urlVerified: false,
          },
        ],
      },
      frSteps.municipalRegistration(
        "marseille",
        [
          {
            url: "https://www.marseille.fr/",
            label: {
              en: "Marseille city portal (verify procedure on official site)",
              fr: "Portail Ville de Marseille (vérifier la procédure sur le site officiel)",
            },
            urlVerified: false,
          },
        ],
        {
          en: "Métropole Aix-Marseille-Provence",
          fr: "Métropole Aix-Marseille-Provence",
        }
      ),
      frSteps.taxDeclaration("marseille"),
      frSteps.updateListings("marseille"),
      frSteps.guestRegister("marseille"),
    ],
  },
  {
    id: "fr-bordeaux",
    country: "France",
    city: "Bordeaux",
    title: {
      en: "Bordeaux Metropole furnished rental",
      fr: "Location meublée — Bordeaux Métropole",
    },
    description: {
      en: "Registration steps for short-term rentals in Bordeaux and surrounding communes.",
      fr: "Étapes d'enregistrement pour les locations courte durée à Bordeaux et communes associées.",
    },
    steps: [
      {
        ...frSteps.verifyRules("bordeaux"),
        officialUrls: [
          {
            url: "https://www.bordeaux-metropole.fr/",
            label: {
              en: "Bordeaux Metropole — verify STR rules on official site",
              fr: "Bordeaux Métropole — vérifier la réglementation sur le site officiel",
            },
            urlVerified: false,
          },
        ],
      },
      frSteps.municipalRegistration(
        "bordeaux",
        [
          {
            url: "https://www.bordeaux-metropole.fr/",
            label: {
              en: "Bordeaux Metropole portal (verify registration link)",
              fr: "Portail Bordeaux Métropole (vérifier le lien d'enregistrement)",
            },
            urlVerified: false,
          },
        ],
        { en: "Bordeaux Métropole", fr: "Bordeaux Métropole" }
      ),
      frSteps.taxDeclaration("bordeaux"),
      frSteps.updateListings("bordeaux"),
      frSteps.guestRegister("bordeaux"),
    ],
  },
  {
    id: "fr-nice",
    country: "France",
    city: "Nice",
    title: {
      en: "Nice furnished tourist rental",
      fr: "Location meublée touristique — Nice",
    },
    description: {
      en: "Compliance steps for short-term rentals in Nice and the Metropole Nice Côte d'Azur.",
      fr: "Étapes de conformité pour les locations courte durée à Nice et Métropole Nice Côte d'Azur.",
    },
    steps: [
      {
        ...frSteps.verifyRules("nice"),
        officialUrls: [
          {
            url: "https://www.nice.fr/fr/nice-pratique/location-meublee-de-tourisme",
            label: {
              en: "City of Nice — furnished tourist rental",
              fr: "Ville de Nice — location meublée de tourisme",
            },
            urlVerified: false,
          },
        ],
      },
      frSteps.municipalRegistration(
        "nice",
        [
          {
            url: "https://www.nice.fr/fr/nice-pratique/location-meublee-de-tourisme",
            label: {
              en: "Nice registration information (verify on official site)",
              fr: "Informations d'enregistrement Nice (vérifier sur le site officiel)",
            },
            urlVerified: false,
          },
        ],
        { en: "Ville de Nice", fr: "Ville de Nice" }
      ),
      frSteps.taxDeclaration("nice"),
      frSteps.updateListings("nice"),
      frSteps.guestRegister("nice"),
    ],
  },
  {
    id: "fr-generic",
    country: "France",
    title: {
      en: "France — furnished tourist rental (general)",
      fr: "France — location meublée touristique (général)",
    },
    description: {
      en: "Default compliance path for French municipalities when no city-specific playbook is available.",
      fr: "Parcours de conformité par défaut pour les communes françaises sans playbook spécifique.",
    },
    steps: [
      frSteps.verifyRules("fr"),
      frSteps.municipalRegistration(
        "fr",
        [
          {
            url: "https://www.service-public.fr/particuliers/vosdroits/F35928",
            label: {
              en: "Service-Public — declare furnished tourist rental",
              fr: "Service-Public — déclarer une location meublée touristique",
            },
            urlVerified: true,
          },
        ],
        { en: "your local municipality", fr: "votre mairie / collectivité locale" }
      ),
      frSteps.taxDeclaration("fr"),
      frSteps.updateListings("fr"),
      frSteps.guestRegister("fr"),
    ],
  },
];
