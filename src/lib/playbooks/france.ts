import type { Playbook, PlaybookStep, LocalizedText, OfficialUrl } from "./types";

const PARIS_RULES_URL =
  "https://www.paris.fr/pages/meubles-touristiques-3637";
const PARIS_FORM_URL =
  "https://meubles-tourisme.paris.fr/meubles-tourisme/jsp/site/Portal.jsp?page=accueil";
const PARIS_CHANGE_OF_USE_PORTAL =
  "https://s29-sndcu.apps.paris.fr/changement-usage/jsp/site/Portal.jsp?page=accueil";
const PARIS_CHANGE_OF_USE_INFO =
  "https://www.paris.fr/pages/exercer-une-activite-dans-un-logement-172";

const LYON_DECLARE_URL =
  "https://www.lyon.fr/demarche/logement-habitat/declarer-un-meuble-de-tourisme";
const LYON_CHANGE_OF_USE_URL =
  "https://www.lyon.fr/demarche/logement-habitat/demander-le-changement-dusage-dun-logement-0";

const MARSEILLE_RULES_URL =
  "https://www.marseille.fr/index.php/decouvrir-marseille/une-ville-de-tourisme/la-taxe-de-sejour";
const MARSEILLE_PORTAL_URL = "https://taxedesejour.ofeaweb.fr/ts/marseille";

const BORDEAUX_GUIDE_URL =
  "https://www.bordeaux.fr/location-touristique-bordeaux--guide-proprietaires";
const BORDEAUX_PORTAL_URL = "https://taxedesejour.bordeaux-metropole.fr/";

const NICE_CHANGE_OF_USE_RULES_URL =
  "https://www.nicecotedazur.org/services/logement/autorisations-de-changements-dusage/";
const NICE_CHANGE_OF_USE_PORTAL_URL = "https://changementdusage.fr/nice";
const NICE_PORTAL_URL = "https://taxedesejour.ofeaweb.fr/ts/metropole-nca";

const frSteps = {
  verifyRules: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-verify-rules`,
    title: {
      en: "Check local STR rules and quotas",
      fr: "Vérifier la réglementation locale et les quotas",
    },
    instruction: {
      en: "Confirm your property type and rental use are allowed in your zone. Many French cities enforce 90-night caps for primary residences or change-of-use rules for non-primary properties.",
      fr: "Confirmez que votre type de bien et l'usage locatif sont autorisés dans votre zone. De nombreuses villes appliquent un plafond de 90 nuitées/an pour les résidences principales ou des règles de changement d'usage pour les autres biens.",
    },
    officialUrls: [
      {
        url: "https://www.service-public.fr/particuliers/vosdroits/F2043",
        label: {
          en: "Service-Public — furnished tourist rental declaration",
          fr: "Service-Public — déclaration de location meublée touristique",
        },
        role: "rules",
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
      en: "Non-primary properties in many cities require change-of-use authorization before registration — not primary residences.",
      fr: "Les biens non principaux dans de nombreuses villes exigent une autorisation de changement d'usage avant l'enregistrement — pas les résidences principales.",
    },
    fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
  }),

  municipalRegistration: (
    cityKey: string,
    urls: OfficialUrl[],
    authorityHint: LocalizedText,
    options?: {
      appliesWhen?: PlaybookStep["appliesWhen"];
      instruction?: LocalizedText;
      documentsDetailed?: PlaybookStep["documentsDetailed"];
      pitfalls?: LocalizedText;
    }
  ): PlaybookStep => ({
    key: `${cityKey}-municipal-registration${options?.appliesWhen && options.appliesWhen !== "always" ? `-${options.appliesWhen}` : ""}`,
    title: {
      en: "Register / declare your furnished tourist rental",
      fr: "Enregistrer / déclarer votre meublé de tourisme",
    },
    instruction: options?.instruction ?? {
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
    documentsDetailed: options?.documentsDetailed,
    timeline: {
      en: "Registration number issued immediately after online submission in most cities.",
      fr: "Numéro d'enregistrement délivré immédiatement après la déclaration en ligne dans la plupart des villes.",
    },
    pitfalls: options?.pitfalls ?? {
      en: "Incomplete co-ownership consent is a common cause of rejection.",
      fr: "L'absence d'accord de copropriété est une cause fréquente de rejet.",
    },
    appliesWhen: options?.appliesWhen,
    fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
  }),

  changeOfUse: (
    cityKey: string,
    urls: OfficialUrl[],
    instruction: LocalizedText,
    pitfalls?: LocalizedText
  ): PlaybookStep => ({
    key: `${cityKey}-change-of-use`,
    title: {
      en: "Obtain change-of-use authorization",
      fr: "Obtenir l'autorisation de changement d'usage",
    },
    instruction,
    officialUrls: urls,
    documents: {
      en: [
        "Property deed or proof of ownership",
        "Floor plans and property surface area",
        "Co-ownership bylaws (if applicable)",
        "Compensation property details (if required by city rules)",
      ],
      fr: [
        "Titre de propriété ou justificatif de propriété",
        "Plans et surface habitable du bien",
        "Règlement de copropriété (le cas échéant)",
        "Détails du bien de compensation (si exigé par la ville)",
      ],
    },
    timeline: {
      en: "Processing can take several weeks to months depending on the city.",
      fr: "Le traitement peut prendre plusieurs semaines à plusieurs mois selon la ville.",
    },
    pitfalls,
    appliesWhen: "nonPrimary",
    fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
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
        url: "https://www.impots.gouv.fr/particulier/les-locations-meublees",
        label: {
          en: "impots.gouv.fr — furnished rental income",
          fr: "impots.gouv.fr — revenus de location meublée",
        },
        role: "tax",
        urlVerified: true,
      },
      {
        url: "https://procedures.inpi.fr/",
        label: {
          en: "INPI — business registration portal",
          fr: "INPI — guichet unique d'immatriculation",
        },
        role: "portal",
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
        role: "rules",
        urlVerified: false,
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
        role: "rules",
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

const parisDocumentsDetailed = [
  {
    name: {
      en: "Last taxe d'habitation notice (avis de taxe d'habitation)",
      fr: "Dernier avis de taxe d'habitation",
    },
    why: {
      en: "Required at step 3 of the online declaration to identify the local (identifiant du local, bottom of page 4). If unavailable, check « J'identifie mon local autrement ».",
      fr: "Requis à l'étape 3 de la déclaration en ligne pour identifier le local (identifiant du local, bas de la page 4). Si indisponible, cochez « J'identifie mon local autrement ».",
    },
  },
  {
    name: {
      en: "National ID or passport of the loueur (landlord)",
      fr: "Pièce d'identité du loueur",
    },
    why: {
      en: "The declaration must be submitted in the name of the loueur (owner/landlord), not the property manager or conciergerie.",
      fr: "La déclaration doit être déposée au nom du loueur (propriétaire), pas du gestionnaire ou de la conciergerie.",
    },
  },
  {
    name: {
      en: "Proof of ownership or lease authorization",
      fr: "Justificatif de propriété ou autorisation de sous-location",
    },
    why: {
      en: "Tenants must have landlord authorization for sub-letting; social housing tenants cannot register STR properties.",
      fr: "Les locataires doivent avoir l'autorisation du bailleur ; les locataires du parc social ne peuvent pas enregistrer un meublé touristique.",
    },
  },
];

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
      en: "Step-by-step guide for registering a short-term rental in Paris. Primary residences: online declaration only (90 nights/year max). Non-primary: change-of-use authorization required first.",
      fr: "Guide pas à pas pour enregistrer une location courte durée à Paris. Résidence principale : déclaration en ligne uniquement (90 nuitées/an max). Non principale : autorisation de changement d'usage requise au préalable.",
    },
    sourceReviewedAt: "2026-03-25",
    steps: [
      {
        key: "paris-verify-rules",
        title: {
          en: "Check Paris STR rules for your situation",
          fr: "Vérifier la réglementation parisienne selon votre situation",
        },
        instruction: {
          en: "Paris rules depend on whether the property is your primary residence. Primary residences may be rented up to 90 nights/year via online declaration only. Non-primary properties (secondary residence, investment) generally require change-of-use authorization with compensation before any rental. Renting a single room in your primary home (chambre chez l'habitant) may be exempt from registration — verify on the official page.",
          fr: "Les règles parisiennes dépendent du statut du bien. Les résidences principales peuvent être louées jusqu'à 90 nuitées/an via la déclaration en ligne uniquement. Les biens non principaux (résidence secondaire, investissement) nécessitent généralement une autorisation de changement d'usage avec compensation avant toute location. La location d'une chambre dans votre résidence principale (chambre chez l'habitant) peut être exemptée d'enregistrement — vérifiez sur la page officielle.",
        },
        officialUrls: [
          {
            url: PARIS_RULES_URL,
            label: {
              en: "City of Paris — tourist furnished rental rules",
              fr: "Ville de Paris — règles meublés touristiques",
            },
            role: "rules",
            urlVerified: true,
          },
          {
            url: "https://www.service-public.fr/particuliers/vosdroits/F2043",
            label: {
              en: "Service-Public — national STR framework",
              fr: "Service-Public — cadre national location meublée",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Confirm primary vs non-primary residence status",
            "Co-ownership bylaws (if applicable)",
            "Estimated annual rental nights",
          ],
          fr: [
            "Confirmer le statut résidence principale ou non",
            "Règlement de copropriété (le cas échéant)",
            "Estimation du nombre de nuitées annuelles",
          ],
        },
        pitfalls: {
          en: "Primary residences do NOT require change-of-use — only the online declaration (max 90 nights/year). Non-primary properties require change-of-use authorization BEFORE registration. Platforms require the 13-character registration number; fines apply if missing.",
          fr: "Les résidences principales ne nécessitent PAS de changement d'usage — uniquement la déclaration en ligne (max 90 nuitées/an). Les biens non principaux exigent une autorisation de changement d'usage AVANT l'enregistrement. Les plateformes exigent le numéro à 13 caractères ; des amendes s'appliquent en cas d'absence.",
        },
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      {
        key: "paris-change-of-use",
        title: {
          en: "Obtain change-of-use authorization (non-primary only)",
          fr: "Obtenir l'autorisation de changement d'usage (non principale uniquement)",
        },
        instruction: {
          en: "For properties that are NOT your primary residence, you must obtain change-of-use authorization with compensation before registering. Use the official simulator — select « meublés de tourisme ». You may also need a change-of-destination authorization from the BASU (Direction de l'Urbanisme) before registration.",
          fr: "Pour les biens qui ne sont PAS votre résidence principale, vous devez obtenir une autorisation de changement d'usage avec compensation avant l'enregistrement. Utilisez le simulateur officiel — choisissez « meublés de tourisme ». Un changement de destination auprès du BASU (Direction de l'Urbanisme) peut également être requis avant l'enregistrement.",
        },
        officialUrls: [
          {
            url: PARIS_CHANGE_OF_USE_PORTAL,
            label: {
              en: "Paris — change-of-use simulator and application portal",
              fr: "Paris — simulateur et portail changement d'usage",
            },
            role: "portal",
            urlVerified: true,
          },
          {
            url: PARIS_CHANGE_OF_USE_INFO,
            label: {
              en: "City of Paris — change-of-use procedures and contacts",
              fr: "Ville de Paris — procédures et contacts changement d'usage",
            },
            role: "info",
            urlVerified: true,
          },
          {
            url: PARIS_RULES_URL,
            label: {
              en: "City of Paris — non-primary rental rules (reference)",
              fr: "Ville de Paris — règles location non principale (référence)",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Property deed and floor plans",
            "Compensation property details (transforming non-residential space to housing)",
            "Co-ownership bylaws (if applicable)",
          ],
          fr: [
            "Titre de propriété et plans",
            "Détails du bien de compensation (transformation de locaux non résidentiels en logement)",
            "Règlement de copropriété (le cas échéant)",
          ],
        },
        timeline: {
          en: "Authorization can take several months. Do not rent until all authorizations are granted.",
          fr: "L'autorisation peut prendre plusieurs mois. Ne louez pas avant l'obtention de toutes les autorisations.",
        },
        pitfalls: {
          en: "Unlike primary residences, non-primary rentals require authorization from day 1. Fines up to €100,000 plus daily penalties apply for unauthorized secondary STR in Paris.",
          fr: "Contrairement aux résidences principales, les locations non principales exigent une autorisation dès le 1er jour. Des amendes jusqu'à 100 000 € plus astreintes journalières s'appliquent pour une location non autorisée.",
        },
        appliesWhen: "nonPrimary",
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      {
        key: "paris-declare-registration",
        title: {
          en: "Declare your furnished tourist rental online",
          fr: "Déclarer votre meublé de tourisme en ligne",
        },
        instruction: {
          en: "Submit your declaration on the Paris dedicated portal (not the rules page on paris.fr). The 13-character registration number is issued immediately after validation. The declaration must be in the name of the loueur (owner/landlord), not the property manager.",
          fr: "Déposez votre déclaration sur le portail dédié de Paris (pas la page de règles sur paris.fr). Le numéro d'enregistrement à 13 caractères est délivré immédiatement après validation. La déclaration doit être au nom du loueur (propriétaire), pas du gestionnaire.",
        },
        officialUrls: [
          {
            url: PARIS_FORM_URL,
            label: {
              en: "Paris — online tourist rental declaration form",
              fr: "Paris — formulaire de déclaration meublé touristique",
            },
            role: "form",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Last taxe d'habitation notice (identifiant du local, page 4)",
            "National ID of the loueur",
            "Proof of ownership or sub-letting authorization",
          ],
          fr: [
            "Dernier avis de taxe d'habitation (identifiant du local, page 4)",
            "Pièce d'identité du loueur",
            "Justificatif de propriété ou autorisation de sous-location",
          ],
        },
        documentsDetailed: parisDocumentsDetailed,
        timeline: {
          en: "Registration number issued immediately after online submission.",
          fr: "Numéro d'enregistrement délivré immédiatement après la déclaration en ligne.",
        },
        pitfalls: {
          en: "Do not use the paris.fr rules page for declaration — use meubles-tourisme.paris.fr. Without the registration number on your listings, platforms may block publication and fines up to €5,000 apply.",
          fr: "N'utilisez pas la page de règles paris.fr pour la déclaration — utilisez meubles-tourisme.paris.fr. Sans le numéro sur vos annonces, les plateformes peuvent bloquer la publication et des amendes jusqu'à 5 000 € s'appliquent.",
        },
        appliesWhen: "primaryResidence",
        fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
      },
      {
        key: "paris-declare-registration-nonPrimary",
        title: {
          en: "Declare your furnished tourist rental online (after authorization)",
          fr: "Déclarer votre meublé de tourisme en ligne (après autorisation)",
        },
        instruction: {
          en: "After obtaining change-of-use authorization, submit your declaration on the Paris dedicated portal. The 13-character registration number is issued immediately. Declaration must be in the name of the loueur, not the gestionnaire.",
          fr: "Après obtention de l'autorisation de changement d'usage, déposez votre déclaration sur le portail dédié de Paris. Le numéro à 13 caractères est délivré immédiatement. La déclaration doit être au nom du loueur, pas du gestionnaire.",
        },
        officialUrls: [
          {
            url: PARIS_FORM_URL,
            label: {
              en: "Paris — online tourist rental declaration form",
              fr: "Paris — formulaire de déclaration meublé touristique",
            },
            role: "form",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Change-of-use authorization decision",
            "Last taxe d'habitation notice or alternative local ID",
            "National ID of the loueur",
          ],
          fr: [
            "Décision d'autorisation de changement d'usage",
            "Dernier avis de taxe d'habitation ou identification alternative du local",
            "Pièce d'identité du loueur",
          ],
        },
        documentsDetailed: parisDocumentsDetailed,
        timeline: {
          en: "Registration number issued immediately after online submission.",
          fr: "Numéro d'enregistrement délivré immédiatement après la déclaration en ligne.",
        },
        pitfalls: {
          en: "Only register after all required authorizations are granted. Renting before authorization exposes you to fines up to €100,000.",
          fr: "Enregistrez uniquement après obtention de toutes les autorisations requises. Louer avant l'autorisation expose à des amendes jusqu'à 100 000 €.",
        },
        appliesWhen: "nonPrimary",
        fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
      },
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
      en: "Lyon furnished tourist rental",
      fr: "Location meublée touristique — Lyon",
    },
    description: {
      en: "Registration via Ville de Lyon téléservice. Primary residence: online form only (90 nights/year). Non-primary: change-of-use authorization required first. National API Meublés planned Q4 2026 — Lyon téléservice remains mandatory until then.",
      fr: "Enregistrement via le téléservice de la Ville de Lyon. Résidence principale : formulaire en ligne uniquement (90 nuitées/an). Non principale : autorisation de changement d'usage requise au préalable. API Meublés national prévu T4 2026 — le téléservice lyonnais reste obligatoire jusque-là.",
    },
    sourceReviewedAt: "2026-03-25",
    steps: [
      {
        key: "lyon-verify-rules",
        title: {
          en: "Check Lyon STR rules for your situation",
          fr: "Vérifier la réglementation lyonnaise selon votre situation",
        },
        instruction: {
          en: "Primary residences: complete the online declaration form to obtain a registration number immediately (max 90 nights/year, no other formalities). Non-primary: the registration number does NOT constitute authorization — you must first obtain change-of-use approval. National API Meublés portal opens Q4 2026; Lyon téléservice remains mandatory until then.",
          fr: "Résidence principale : complétez le formulaire en ligne pour obtenir immédiatement un numéro d'enregistrement (max 90 nuitées/an, sans autre formalité). Non principale : le numéro d'enregistrement ne vaut pas autorisation — vous devez d'abord obtenir un changement d'usage. L'API Meublés national ouvre au T4 2026 ; le téléservice lyonnais reste obligatoire jusque-là.",
        },
        officialUrls: [
          {
            url: LYON_DECLARE_URL,
            label: {
              en: "Ville de Lyon — tourist furnished rental rules and conditions",
              fr: "Ville de Lyon — règles et conditions meublé de tourisme",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Confirm primary vs non-primary residence status",
            "Property surface area (compensation rules vary by zone and size)",
            "Co-ownership bylaws (if applicable)",
          ],
          fr: [
            "Confirmer le statut résidence principale ou non",
            "Surface du bien (règles de compensation selon zone et taille)",
            "Règlement de copropriété (le cas échéant)",
          ],
        },
        pitfalls: {
          en: "In copropriété, you must inform the syndic of your télédéclaration. Hypercentre properties face stricter change-of-use rules.",
          fr: "En copropriété, vous devez informer le syndic de votre télédéclaration. Les biens en hypercentre font face à des règles de changement d'usage plus strictes.",
        },
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      frSteps.changeOfUse(
        "lyon",
        [
          {
            url: LYON_CHANGE_OF_USE_URL,
            label: {
              en: "Ville de Lyon — change-of-use application procedures",
              fr: "Ville de Lyon — procédures demande de changement d'usage",
            },
            role: "info",
            urlVerified: true,
          },
        ],
        {
          en: "For non-primary residences, submit a change-of-use request to the Service habitat before registering. Download the form from the official page and send by email to habitat.usages@mairie-lyon.fr or by post. Compensation may be required depending on location and surface area.",
          fr: "Pour les résidences non principales, déposez une demande de changement d'usage au Service habitat avant l'enregistrement. Téléchargez le formulaire sur la page officielle et envoyez-le par email à habitat.usages@mairie-lyon.fr ou par courrier. Une compensation peut être exigée selon la localisation et la surface.",
        },
        {
          en: "The online registration number does NOT authorize non-primary STR without prior change-of-use approval.",
          fr: "Le numéro d'enregistrement en ligne ne vaut PAS autorisation pour une location non principale sans changement d'usage préalable.",
        }
      ),
      {
        key: "lyon-declare-registration",
        title: {
          en: "Declare your furnished tourist rental online",
          fr: "Déclarer votre meublé de tourisme en ligne",
        },
        instruction: {
          en: "Access the Ville de Lyon online declaration form from the official page. Complete and validate to obtain your registration number immediately. This number must appear on all rental listings.",
          fr: "Accédez au formulaire de déclaration en ligne de la Ville de Lyon depuis la page officielle. Complétez et validez pour obtenir immédiatement votre numéro d'enregistrement. Ce numéro doit figurer sur toutes vos annonces.",
        },
        officialUrls: [
          {
            url: LYON_DECLARE_URL,
            label: {
              en: "Ville de Lyon — online tourist rental declaration",
              fr: "Ville de Lyon — déclaration en ligne meublé de tourisme",
            },
            role: "form",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "National ID or passport",
            "Proof of ownership",
            "Change-of-use authorization (if non-primary)",
          ],
          fr: [
            "Pièce d'identité",
            "Justificatif de propriété",
            "Autorisation de changement d'usage (si non principale)",
          ],
        },
        timeline: {
          en: "Registration number issued immediately after online submission.",
          fr: "Numéro d'enregistrement délivré immédiatement après la déclaration en ligne.",
        },
        pitfalls: {
          en: "National API Meublés (Q4 2026) will not replace Lyon téléservice until officially announced. Keep using the Lyon portal.",
          fr: "L'API Meublés national (T4 2026) ne remplacera pas le téléservice lyonnais tant que ce n'est pas officiellement annoncé. Continuez d'utiliser le portail lyonnais.",
        },
        appliesWhen: "always",
        fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
      },
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
      en: "Registration via the Marseille tourist tax portal. Rules on marseille.fr. Change-of-use is a separate track when applicable.",
      fr: "Enregistrement via le portail de taxe de séjour de Marseille. Règles sur marseille.fr. Le changement d'usage est une démarche distincte le cas échéant.",
    },
    sourceReviewedAt: "2026-03-25",
    steps: [
      {
        key: "marseille-verify-rules",
        title: {
          en: "Check Marseille STR and tourist tax rules",
          fr: "Vérifier la réglementation marseillaise et la taxe de séjour",
        },
        instruction: {
          en: "Review the official Marseille tourist tax page for local STR rules, registration requirements, and change-of-use obligations where applicable.",
          fr: "Consultez la page officielle de la taxe de séjour de Marseille pour les règles locales, les exigences d'enregistrement et les obligations de changement d'usage le cas échéant.",
        },
        officialUrls: [
          {
            url: MARSEILLE_RULES_URL,
            label: {
              en: "City of Marseille — tourist tax and furnished rental rules",
              fr: "Ville de Marseille — taxe de séjour et location meublée",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Confirm primary vs non-primary residence status",
            "Property address and type",
            "Co-ownership bylaws (if applicable)",
          ],
          fr: [
            "Confirmer le statut résidence principale ou non",
            "Adresse et type du bien",
            "Règlement de copropriété (le cas échéant)",
          ],
        },
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      frSteps.changeOfUse(
        "marseille",
        [
          {
            url: MARSEILLE_RULES_URL,
            label: {
              en: "City of Marseille — change-of-use information (see rules page)",
              fr: "Ville de Marseille — informations changement d'usage (voir page règles)",
            },
            role: "info",
            urlVerified: true,
          },
        ],
        {
          en: "If your property is not your primary residence, check the Marseille rules page for change-of-use requirements before registering on the tourist tax portal. This is a separate administrative track from registration.",
          fr: "Si votre bien n'est pas votre résidence principale, consultez la page des règles de Marseille pour les exigences de changement d'usage avant l'enregistrement sur le portail de taxe de séjour. C'est une démarche distincte de l'enregistrement.",
        },
        {
          en: "Change-of-use and registration are separate procedures — complete change-of-use first if required.",
          fr: "Le changement d'usage et l'enregistrement sont des procédures distinctes — effectuez d'abord le changement d'usage si requis.",
        }
      ),
      {
        key: "marseille-declare-registration",
        title: {
          en: "Register on the Marseille tourist tax portal",
          fr: "S'inscrire sur le portail taxe de séjour de Marseille",
        },
        instruction: {
          en: "Create a host account on the Marseille tourist tax portal and add your property to obtain your registration number. This is the official registration channel — not the marseille.fr rules page.",
          fr: "Créez un compte hébergeur sur le portail de taxe de séjour de Marseille et ajoutez votre bien pour obtenir votre numéro d'enregistrement. C'est le canal officiel d'enregistrement — pas la page de règles marseille.fr.",
        },
        officialUrls: [
          {
            url: MARSEILLE_PORTAL_URL,
            label: {
              en: "Marseille tourist tax portal — host registration",
              fr: "Portail taxe de séjour Marseille — inscription hébergeur",
            },
            role: "portal",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "National ID or passport",
            "Proof of ownership or authorization to rent",
            "Property address",
            "IBAN for tourist tax payments",
          ],
          fr: [
            "Pièce d'identité",
            "Justificatif de propriété ou autorisation de louer",
            "Adresse du bien",
            "IBAN pour le paiement de la taxe de séjour",
          ],
        },
        timeline: {
          en: "Account setup and property registration typically take a few days.",
          fr: "La création de compte et l'enregistrement du bien prennent généralement quelques jours.",
        },
        fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
      },
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
      en: "Registration and registration number via Bordeaux Metropole tourist tax portal. Owner guide on bordeaux.fr. Secondary residences need change-of-use — contact usagebordeaux@bordeaux-metropole.fr.",
      fr: "Enregistrement et numéro via le portail taxe de séjour de Bordeaux Métropole. Guide propriétaires sur bordeaux.fr. Les résidences secondaires nécessitent un changement d'usage — contacter usagebordeaux@bordeaux-metropole.fr.",
    },
    sourceReviewedAt: "2026-03-25",
    steps: [
      {
        key: "bordeaux-verify-rules",
        title: {
          en: "Read the Bordeaux owner guide and local rules",
          fr: "Lire le guide propriétaires et la réglementation bordelaise",
        },
        instruction: {
          en: "Review the official Bordeaux owner guide for registration steps, primary vs secondary residence rules, and change-of-use requirements. Secondary residences require change-of-use authorization before registration.",
          fr: "Consultez le guide propriétaires officiel de Bordeaux pour les étapes d'enregistrement, les règles résidence principale vs secondaire et les exigences de changement d'usage. Les résidences secondaires nécessitent une autorisation de changement d'usage avant l'enregistrement.",
        },
        officialUrls: [
          {
            url: BORDEAUX_GUIDE_URL,
            label: {
              en: "City of Bordeaux — tourist rental guide for owners",
              fr: "Ville de Bordeaux — guide location touristique propriétaires",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Confirm primary vs secondary residence status",
            "Property deed or proof of ownership",
            "Co-ownership bylaws (if applicable)",
          ],
          fr: [
            "Confirmer le statut résidence principale ou secondaire",
            "Titre de propriété ou justificatif",
            "Règlement de copropriété (le cas échéant)",
          ],
        },
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      frSteps.changeOfUse(
        "bordeaux",
        [
          {
            url: BORDEAUX_GUIDE_URL,
            label: {
              en: "Bordeaux owner guide — change-of-use section",
              fr: "Guide propriétaires Bordeaux — section changement d'usage",
            },
            role: "info",
            urlVerified: true,
          },
        ],
        {
          en: "For secondary residences, contact usagebordeaux@bordeaux-metropole.fr (mentioned on the official portal) to initiate change-of-use procedures before registering. There is no separate online form — follow the guide and contact the authority.",
          fr: "Pour les résidences secondaires, contactez usagebordeaux@bordeaux-metropole.fr (mentionné sur le portail officiel) pour initier les démarches de changement d'usage avant l'enregistrement. Il n'existe pas de formulaire en ligne distinct — suivez le guide et contactez l'autorité.",
        },
        {
          en: "Do not register on the tourist tax portal until change-of-use is approved for secondary residences. Contact: usagebordeaux@bordeaux-metropole.fr.",
          fr: "N'enregistrez pas sur le portail de taxe de séjour tant que le changement d'usage n'est pas approuvé pour les résidences secondaires. Contact : usagebordeaux@bordeaux-metropole.fr.",
        }
      ),
      {
        key: "bordeaux-declare-registration",
        title: {
          en: "Register on the Bordeaux Metropole tourist tax portal",
          fr: "S'inscrire sur le portail taxe de séjour Bordeaux Métropole",
        },
        instruction: {
          en: "Register your furnished tourist rental on the Bordeaux Metropole tourist tax portal to obtain your registration number. This is the registration channel — not the bordeaux.fr guide page.",
          fr: "Enregistrez votre location meublée touristique sur le portail de taxe de séjour de Bordeaux Métropole pour obtenir votre numéro d'enregistrement. C'est le canal d'enregistrement — pas la page guide bordeaux.fr.",
        },
        officialUrls: [
          {
            url: BORDEAUX_PORTAL_URL,
            label: {
              en: "Bordeaux Metropole — tourist tax and registration portal",
              fr: "Bordeaux Métropole — portail taxe de séjour et enregistrement",
            },
            role: "portal",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "National ID or passport",
            "Proof of ownership",
            "Property address",
            "Change-of-use authorization (if secondary residence)",
          ],
          fr: [
            "Pièce d'identité",
            "Justificatif de propriété",
            "Adresse du bien",
            "Autorisation de changement d'usage (si résidence secondaire)",
          ],
        },
        timeline: {
          en: "Registration number issued after portal account setup and property submission.",
          fr: "Numéro d'enregistrement délivré après création du compte et soumission du bien sur le portail.",
        },
        fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
      },
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
      en: "Change-of-use and registration are distinct numbers and procedures. Primary residences often capped at 90 nights. Change-of-use via Métropole pages / changementdusage.fr/nice; registration via taxe de séjour portal.",
      fr: "Le changement d'usage et l'enregistrement sont des numéros et procédures distincts. Résidences principales souvent plafonnées à 90 nuitées. Changement d'usage via pages Métropole / changementdusage.fr/nice ; enregistrement via portail taxe de séjour.",
    },
    sourceReviewedAt: "2026-03-25",
    steps: [
      {
        key: "nice-verify-rules",
        title: {
          en: "Check Nice STR rules for your situation",
          fr: "Vérifier la réglementation niçoise selon votre situation",
        },
        instruction: {
          en: "Nice requires separate change-of-use authorization and registration numbers. Primary residences are often capped at 90 rental nights per year. Review the Métropole rules page to determine which procedures apply to your property.",
          fr: "Nice exige des numéros distincts pour le changement d'usage et l'enregistrement. Les résidences principales sont souvent plafonnées à 90 nuitées de location par an. Consultez la page des règles de la Métropole pour déterminer les procédures applicables.",
        },
        officialUrls: [
          {
            url: NICE_CHANGE_OF_USE_RULES_URL,
            label: {
              en: "Métropole Nice Côte d'Azur — change-of-use rules for STR",
              fr: "Métropole Nice Côte d'Azur — règles changement d'usage location meublée",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Confirm primary vs non-primary residence status",
            "Property surface area and location",
            "Co-ownership bylaws (if applicable)",
          ],
          fr: [
            "Confirmer le statut résidence principale ou non",
            "Surface et localisation du bien",
            "Règlement de copropriété (le cas échéant)",
          ],
        },
        pitfalls: {
          en: "Change-of-use authorization number and registration number are DIFFERENT. You need both for non-primary properties.",
          fr: "Le numéro d'autorisation de changement d'usage et le numéro d'enregistrement sont DIFFÉRENTS. Vous avez besoin des deux pour les biens non principaux.",
        },
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      {
        key: "nice-change-of-use",
        title: {
          en: "Obtain change-of-use authorization (when required)",
          fr: "Obtenir l'autorisation de changement d'usage (si requis)",
        },
        instruction: {
          en: "For properties requiring change-of-use, apply via the Métropole Nice Côte d'Azur portal at changementdusage.fr/nice. This produces a separate authorization number — distinct from the registration number obtained later.",
          fr: "Pour les biens nécessitant un changement d'usage, déposez votre demande via le portail de la Métropole Nice Côte d'Azur sur changementdusage.fr/nice. Cela produit un numéro d'autorisation distinct — différent du numéro d'enregistrement obtenu ensuite.",
        },
        officialUrls: [
          {
            url: NICE_CHANGE_OF_USE_PORTAL_URL,
            label: {
              en: "Nice — change-of-use application portal",
              fr: "Nice — portail demande de changement d'usage",
            },
            role: "portal",
            urlVerified: true,
          },
          {
            url: NICE_CHANGE_OF_USE_RULES_URL,
            label: {
              en: "Métropole Nice Côte d'Azur — change-of-use rules",
              fr: "Métropole Nice Côte d'Azur — règles changement d'usage",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "Property deed and floor plans",
            "Co-ownership bylaws (if applicable)",
            "Compensation details (if required)",
          ],
          fr: [
            "Titre de propriété et plans",
            "Règlement de copropriété (le cas échéant)",
            "Détails de compensation (si requis)",
          ],
        },
        timeline: {
          en: "Change-of-use processing can take several weeks.",
          fr: "Le traitement du changement d'usage peut prendre plusieurs semaines.",
        },
        pitfalls: {
          en: "The change-of-use number and registration number are different — do not confuse them on your listings.",
          fr: "Le numéro de changement d'usage et le numéro d'enregistrement sont différents — ne les confondez pas sur vos annonces.",
        },
        appliesWhen: "nonPrimary",
        fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
      },
      {
        key: "nice-declare-registration",
        title: {
          en: "Register on the Nice Côte d'Azur tourist tax portal",
          fr: "S'inscrire sur le portail taxe de séjour Métropole NCA",
        },
        instruction: {
          en: "After any required change-of-use authorization, register your furnished rental on the Métropole Nice Côte d'Azur tourist tax portal. Create a host account to obtain your 13-character registration number for platform listings.",
          fr: "Après toute autorisation de changement d'usage requise, enregistrez votre location meublée sur le portail de taxe de séjour de la Métropole Nice Côte d'Azur. Créez un compte hébergeur pour obtenir votre numéro d'enregistrement à 13 caractères pour vos annonces.",
        },
        officialUrls: [
          {
            url: NICE_PORTAL_URL,
            label: {
              en: "Nice Côte d'Azur tourist tax portal — host registration",
              fr: "Portail taxe de séjour Métropole NCA — inscription hébergeur",
            },
            role: "portal",
            urlVerified: true,
          },
        ],
        documents: {
          en: [
            "National ID or passport",
            "Proof of ownership",
            "Change-of-use authorization number (if non-primary)",
            "Property address",
          ],
          fr: [
            "Pièce d'identité",
            "Justificatif de propriété",
            "Numéro d'autorisation de changement d'usage (si non principale)",
            "Adresse du bien",
          ],
        },
        timeline: {
          en: "Registration number issued after portal account setup.",
          fr: "Numéro d'enregistrement délivré après création du compte sur le portail.",
        },
        fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
      },
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
            url: "https://www.service-public.fr/particuliers/vosdroits/F2043",
            label: {
              en: "Service-Public — declare furnished tourist rental",
              fr: "Service-Public — déclarer une location meublée touristique",
            },
            role: "info",
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
