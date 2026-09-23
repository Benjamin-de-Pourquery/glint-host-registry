import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  BRUSSELS_RULES_URL,
  BRUSSELS_PRIVATE_FORM_URL,
  BRUSSELS_PROFESSIONAL_FORM_URL,
  BRUSSELS_TOURIST_TAX_URL,
  FLANDERS_AANMELDING_URL,
  WALLONIA_TOURISM_URL,
  TOURISME_WALLONIE_URL,
} from "@/lib/belgium/official-links";

const beSteps = {
  regionSelection: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-be-region-selection`,
    title: {
      en: "Confirm your Belgium region",
      fr: "Confirmer votre région en Belgique",
    },
    instruction: {
      en: "Belgium has no single national STR registration. Rules differ between Brussels-Capital, Flanders and Wallonia. Confirm your region in Glint before starting your dossier.",
      fr: "La Belgique n'a pas d'enregistrement national unique pour les locations de courte durée. Les règles diffèrent entre Bruxelles-Capitale, la Flandre et la Wallonie. Confirmez votre région dans Glint avant de constituer le dossier.",
    },
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EU Regulation 2024/1028",
          fr: "Règlement UE 2024/1028",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Property address", "Postal code", "Municipality"],
      fr: ["Adresse du bien", "Code postal", "Commune"],
    },
    fieldHints: ["address", "city", "country"],
  }),

  brusselsDossier: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-be-dossier`,
    title: {
      en: "Gather Brussels prior-declaration dossier",
      fr: "Constituer le dossier de déclaration préalable (Bruxelles)",
    },
    instruction: {
      en: "Before renting (1–90 consecutive nights, including occasional stays and principal residence), submit a prior declaration dossier to Brussels Economy and Employment. Gather ID, criminal record extract, insurance proof, fire safety certificate (ASI/ACS), urban planning compliance, floor plans and entrance photos. Registration number is issued only after a complete conforming file. Display the official logo near the entrance once approved.",
      fr: "Avant toute location (1 à 90 nuits consécutives, y compris location occasionnelle et résidence principale), déposez un dossier de déclaration préalable auprès de Bruxelles Économie et Emploi. Rassemblez pièce d'identité, extrait de casier judiciaire, assurance, certificat incendie (ASI/ACS), conformité urbanistique, plans et photos de l'entrée. Le numéro n'est délivré qu'après dossier complet conforme. Affichez le logo officiel près de l'entrée une fois approuvé.",
    },
    officialUrls: [
      {
        url: BRUSSELS_RULES_URL,
        label: {
          en: "Brussels — tourist accommodation rules",
          fr: "Bruxelles — règles hébergement touristique",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: BRUSSELS_PRIVATE_FORM_URL,
        label: {
          en: "Private host declaration form",
          fr: "Formulaire hôte privé",
        },
        role: "form",
        urlVerified: true,
      },
      {
        url: BRUSSELS_PROFESSIONAL_FORM_URL,
        label: {
          en: "Professional operator declaration form",
          fr: "Formulaire exploitant professionnel",
        },
        role: "form",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "ID / passport",
        "Criminal record extract",
        "Insurance certificate",
        "Fire safety certificate (ASI/ACS)",
        "Urban planning compliance",
        "Floor plans and entrance photos",
      ],
      fr: [
        "Pièce d'identité / passeport",
        "Extrait de casier judiciaire",
        "Attestation d'assurance",
        "Certificat incendie (ASI/ACS)",
        "Conformité urbanistique",
        "Plans et photos de l'entrée",
      ],
    },
    pitfalls: {
      en: "Glint does not submit government forms. You file manually on the official Brussels portal and track your dossier status here.",
      fr: "Glint ne dépose pas les formulaires officiels. Vous déposez manuellement sur le portail bruxellois et suivez l'état du dossier ici.",
    },
    fieldHints: ["name", "address", "city", "residencyStatus"],
  }),

  flandersDossier: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-be-dossier`,
    title: {
      en: "Register with Toerisme Vlaanderen (aanmelding)",
      fr: "S'enregistrer auprès de Toerisme Vlaanderen (aanmelding)",
    },
    instruction: {
      en: "Under the Logiesdecreet, every short-term rental in Flanders requires aanmelding — even occasional Airbnb stays. Register via the online uitbatersportaal for an immediate registration number by email, or submit the paper form (processing takes several days). Check exploitatievoorwaarden and stedenbouwkundige (planning) rules for your municipality.",
      fr: "Au titre du Logiesdecreet, toute location de courte durée en Flandre exige une aanmelding — y compris les locations Airbnb occasionnelles. Inscrivez-vous via le portail uitbatersportaal en ligne pour un numéro immédiat par e-mail, ou le formulaire papier (délai de quelques jours). Vérifiez les exploitatievoorwaarden et règles d'urbanisme locales.",
    },
    officialUrls: [
      {
        url: FLANDERS_AANMELDING_URL,
        label: {
          en: "Toerisme Vlaanderen — aanmelding",
          fr: "Toerisme Vlaanderen — aanmelding",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028 — platform verification (2026)",
          fr: "UE 2024/1028 — vérification plateformes (2026)",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Property address and description",
        "Operator details",
        "Insurance proof",
        "Fire safety documentation where required",
      ],
      fr: [
        "Adresse et description du bien",
        "Coordonnées de l'exploitant",
        "Preuve d'assurance",
        "Documentation incendie si requise",
      ],
    },
    fieldHints: ["name", "address", "city", "propertyType"],
  }),

  walloniaDossier: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-be-dossier`,
    title: {
      en: "Register with Tourisme Wallonie before guests arrive",
      fr: "S'enregistrer auprès de Tourisme Wallonie avant l'arrivée des voyageurs",
    },
    instruction: {
      en: "Compulsory registration with Walloon Tourism before receiving guests. Prepare fire safety (ASI/ACS), insurance, criminal record extract and planning compliance documents. Registration must be completed before any paid stay.",
      fr: "Enregistrement obligatoire auprès de Tourisme Wallonie avant d'accueillir des voyageurs. Préparez sécurité incendie (ASI/ACS), assurance, extrait de casier judiciaire et conformité urbanistique. L'enregistrement doit être finalisé avant tout séjour payant.",
    },
    officialUrls: [
      {
        url: WALLONIA_TOURISM_URL,
        label: {
          en: "Wallonia — tourist accommodation business",
          fr: "Wallonie — hébergement touristique",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: TOURISME_WALLONIE_URL,
        label: {
          en: "Tourisme Wallonie",
          fr: "Tourisme Wallonie",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "ID / passport",
        "Criminal record extract",
        "Insurance certificate",
        "Fire safety certificate (ASI/ACS)",
        "Planning / urban compliance",
      ],
      fr: [
        "Pièce d'identité / passeport",
        "Extrait de casier judiciaire",
        "Attestation d'assurance",
        "Certificat incendie (ASI/ACS)",
        "Conformité urbanistique",
      ],
    },
    fieldHints: ["name", "address", "city", "propertyType"],
  }),

  submitRegistration: (cityKey: string, regionLabel: string): PlaybookStep => ({
    key: `${cityKey}-be-registration`,
    title: {
      en: `Submit dossier and obtain registration number (${regionLabel})`,
      fr: `Déposer le dossier et obtenir le numéro (${regionLabel})`,
    },
    instruction: {
      en: "Submit your complete dossier on the official regional portal. Enter the registration number in Glint once received. Under EU 2024/1028 (from 20 May 2026), platforms verify registration numbers via SDEP where Member States require it.",
      fr: "Déposez votre dossier complet sur le portail régional officiel. Saisissez le numéro dans Glint une fois reçu. Au titre du règlement UE 2024/1028 (depuis le 20 mai 2026), les plateformes vérifient les numéros via SDEP.",
    },
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EU Regulation 2024/1028",
          fr: "Règlement UE 2024/1028",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Complete dossier confirmation", "Registration number from authority"],
      fr: ["Confirmation de dossier complet", "Numéro d'enregistrement de l'autorité"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  displayRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-be-registration`,
    title: {
      en: "Display registration number on all listings",
      fr: "Afficher le numéro d'enregistrement sur toutes les annonces",
    },
    instruction: {
      en: "Add your regional registration number to Airbnb, Booking.com and all OTAs. Platforms must verify it under EU 2024/1028. In Brussels, also display the official logo near the property entrance.",
      fr: "Ajoutez votre numéro régional sur Airbnb, Booking.com et toutes les OTA. Les plateformes doivent le vérifier au titre du UE 2024/1028. À Bruxelles, affichez aussi le logo officiel près de l'entrée.",
    },
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028 — platform verification",
          fr: "UE 2024/1028 — vérification plateformes",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Regional registration number"],
      fr: ["Numéro d'enregistrement régional"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  brusselsTouristTax: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-be-tourist-tax`,
    title: {
      en: "Brussels tourist tax (taxe de séjour)",
      fr: "Taxe de séjour bruxelloise",
    },
    instruction: {
      en: "Register with Brussels Fiscality for tourist tax on overnight stays. Glint links to official guidance — no automatic tax declaration engine.",
      fr: "Inscrivez-vous auprès de la Fiscalité bruxelloise pour la taxe de séjour. Glint fournit le lien officiel — pas de déclaration automatique.",
    },
    officialUrls: [
      {
        url: BRUSSELS_TOURIST_TAX_URL,
        label: {
          en: "Brussels Fiscality — tourist tax",
          fr: "Fiscalité bruxelloise — taxe de séjour",
        },
        role: "tax",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Registration number", "Rental calendar"],
      fr: ["Numéro d'enregistrement", "Calendrier des séjours"],
    },
    fieldHints: ["address", "city"],
  }),
};

export const BELGIUM_PLAYBOOKS: Playbook[] = [
  {
    id: "be-brussels",
    country: "Belgium",
    city: "Brussels",
    title: {
      en: "Brussels — prior declaration & STR compliance",
      fr: "Bruxelles — déclaration préalable et conformité LCD",
    },
    description: {
      en: "Prior declaration dossier, registration number, entrance logo, platform display and tourist tax links for Brussels-Capital hosts.",
      fr: "Dossier de déclaration préalable, numéro, logo à l'entrée, affichage plateformes et taxe de séjour pour Bruxelles-Capitale.",
    },
    steps: [
      beSteps.brusselsDossier("brussels"),
      beSteps.submitRegistration("brussels", "Brussels-Capital"),
      beSteps.displayRegistration("brussels"),
      beSteps.brusselsTouristTax("brussels"),
    ],
  },
  {
    id: "be-antwerp",
    country: "Belgium",
    city: "Antwerp",
    title: {
      en: "Antwerp — Flanders aanmelding compliance",
      fr: "Anvers — conformité aanmelding (Flandre)",
    },
    description: {
      en: "Toerisme Vlaanderen aanmelding, registration number and EU platform display for Antwerp hosts.",
      fr: "Aanmelding Toerisme Vlaanderen, numéro d'enregistrement et affichage plateformes UE pour Anvers.",
    },
    steps: [
      beSteps.flandersDossier("antwerp"),
      beSteps.submitRegistration("antwerp", "Flanders"),
      beSteps.displayRegistration("antwerp"),
    ],
  },
  {
    id: "be-ghent",
    country: "Belgium",
    city: "Ghent",
    title: {
      en: "Ghent — Flanders aanmelding compliance",
      fr: "Gand — conformité aanmelding (Flandre)",
    },
    description: {
      en: "Toerisme Vlaanderen aanmelding and platform registration display for Ghent hosts.",
      fr: "Aanmelding Toerisme Vlaanderen et affichage du numéro pour Gand.",
    },
    steps: [
      beSteps.flandersDossier("ghent"),
      beSteps.submitRegistration("ghent", "Flanders"),
      beSteps.displayRegistration("ghent"),
    ],
  },
  {
    id: "be-bruges",
    country: "Belgium",
    city: "Bruges",
    title: {
      en: "Bruges — Flanders aanmelding compliance",
      fr: "Bruges — conformité aanmelding (Flandre)",
    },
    description: {
      en: "Toerisme Vlaanderen aanmelding and platform registration display for Bruges hosts.",
      fr: "Aanmelding Toerisme Vlaanderen et affichage du numéro pour Bruges.",
    },
    steps: [
      beSteps.flandersDossier("bruges"),
      beSteps.submitRegistration("bruges", "Flanders"),
      beSteps.displayRegistration("bruges"),
    ],
  },
  {
    id: "be-liege",
    country: "Belgium",
    city: "Liège",
    title: {
      en: "Liège — Wallonia registration compliance",
      fr: "Liège — conformité enregistrement (Wallonie)",
    },
    description: {
      en: "Tourisme Wallonie registration, fire safety and platform display for Liège hosts.",
      fr: "Enregistrement Tourisme Wallonie, sécurité incendie et affichage plateformes pour Liège.",
    },
    steps: [
      beSteps.walloniaDossier("liege"),
      beSteps.submitRegistration("liege", "Wallonia"),
      beSteps.displayRegistration("liege"),
    ],
  },
  {
    id: "be-namur",
    country: "Belgium",
    city: "Namur",
    title: {
      en: "Namur — Wallonia registration compliance",
      fr: "Namur — conformité enregistrement (Wallonie)",
    },
    description: {
      en: "Tourisme Wallonie registration and platform display for Namur hosts.",
      fr: "Enregistrement Tourisme Wallonie et affichage plateformes pour Namur.",
    },
    steps: [
      beSteps.walloniaDossier("namur"),
      beSteps.submitRegistration("namur", "Wallonia"),
      beSteps.displayRegistration("namur"),
    ],
  },
  {
    id: "be-generic",
    country: "Belgium",
    title: {
      en: "Belgium — tri-regional STR registration",
      fr: "Belgique — enregistrement LCD tri-régional",
    },
    description: {
      en: "Belgium has no single national registration. Select your region (Brussels-Capital, Flanders or Wallonia) and follow the regional playbook. Glint guides dossier preparation — you submit on official portals.",
      fr: "La Belgique n'a pas d'enregistrement national unique. Sélectionnez votre région (Bruxelles-Capitale, Flandre ou Wallonie) et suivez le playbook régional. Glint guide la préparation du dossier — vous déposez sur les portails officiels.",
    },
    steps: [
      beSteps.regionSelection("be"),
      {
        key: "be-choose-regional-path",
        title: {
          en: "Follow your regional registration path",
          fr: "Suivre le parcours régional d'enregistrement",
        },
        instruction: {
          en: "Brussels: prior declaration dossier to Brussels Economy and Employment. Flanders: aanmelding at Toerisme Vlaanderen. Wallonia: registration with Tourisme Wallonie. Update your region in Glint to unlock the correct checklist.",
          fr: "Bruxelles : dossier de déclaration préalable auprès de Bruxelles Économie et Emploi. Flandre : aanmelding Toerisme Vlaanderen. Wallonie : enregistrement Tourisme Wallonie. Mettez à jour votre région dans Glint pour débloquer la bonne checklist.",
        },
        officialUrls: [
          {
            url: BRUSSELS_RULES_URL,
            label: { en: "Brussels rules", fr: "Règles Bruxelles" },
            role: "rules",
            urlVerified: true,
          },
          {
            url: FLANDERS_AANMELDING_URL,
            label: { en: "Flanders aanmelding", fr: "Aanmelding Flandre" },
            role: "portal",
            urlVerified: true,
          },
          {
            url: WALLONIA_TOURISM_URL,
            label: { en: "Wallonia tourism", fr: "Tourisme Wallonie" },
            role: "portal",
            urlVerified: true,
          },
        ],
        documents: {
          en: ["Regional registration number once issued"],
          fr: ["Numéro d'enregistrement régional une fois délivré"],
        },
        fieldHints: ["address", "city", "country"],
      },
      beSteps.displayRegistration("be"),
    ],
  },
];
