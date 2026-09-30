import type { Playbook, PlaybookStep } from "./types";
import {
  BARCELONA_TOURISM_HOUSING_URL,
  CATALONIA_OPEN_DATA_PORTAL_URL,
  CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
  EU_1028_URL,
  MOSSOS_LOGIN_URL,
  MOSSOS_PORTAL_URL,
  RD_933_URL,
} from "@/lib/spain/official-links";

const cataloniaRegistrationSteps = (cityKey: string): PlaybookStep[] => [
  {
    key: "es-post-nrua-context",
    title: {
      en: "Understand post-STS 620/2026 registration landscape",
      fr: "Comprendre le cadre post-STS 620/2026",
    },
    instruction: {
      en: "Spain's Supreme Court (STS 620/2026) annulled the national NRUA short-let register. Platforms verify your regional tourism number instead. In Catalonia this is your HUT from the Registre de Turisme de Catalunya. VUDA or SDEP data-sharing and EU Regulation 2024/1028 still apply. Guest reporting uses Mossos Hotels in Catalonia, not SES.HOSPEDAJES.",
      fr: "Le Tribunal suprême espagnol (STS 620/2026) a annulé le registre national NRUA. Les plateformes vérifient votre numéro touristique régional. En Catalogne, c'est votre HUT au Registre de Turisme de Catalunya. Le partage VUDA ou SDEP et le règlement UE 2024/1028 s'appliquent toujours. La déclaration voyageurs passe par Mossos Hotels en Catalogne, pas par SES.HOSPEDAJES.",
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
      {
        url: CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
        label: {
          en: "Catalan Tourism Register (open data list)",
          fr: "Registre de Turisme de Catalunya (données ouvertes)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Property address", "NIE/NIF", "Municipality"],
      fr: ["Adresse du bien", "NIE/NIF", "Municipalité"],
    },
    fieldHints: ["address", "city", "country"],
  },
  {
    key: `${cityKey}-es-autonomous-community`,
    title: {
      en: "Confirm Catalonia as your autonomous community",
      fr: "Confirmer la Catalogne comme communauté autonome",
    },
    instruction: {
      en: "Host Registry tracks Catalonia (HUT) separately from Comunidad de Madrid (VUT) and other Spanish regions. Confirm Catalonia in the registration card before preparing your dossier. Madrid hosts should use the Madrid VUT playbook instead.",
      fr: "Host Registry suit la Catalogne (HUT) séparément de la Communauté de Madrid (VUT) et des autres régions. Confirmez la Catalogne dans la fiche d'enregistrement avant le dossier. Les hôtes à Madrid doivent utiliser le playbook VUT Madrid.",
    },
    officialUrls: [
      {
        url: CATALONIA_OPEN_DATA_PORTAL_URL,
        label: {
          en: "Generalitat open-data portal",
          fr: "Portail open data Generalitat",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Property city and region confirmation"],
      fr: ["Confirmation ville et région du bien"],
    },
    fieldHints: ["city", "country"],
  },
  {
    key: `${cityKey}-es-dossier`,
    title: {
      en: "Prepare HUT dossier (Canal Empresa and municipality)",
      fr: "Préparer le dossier HUT (Canal Empresa et municipalité)",
    },
    instruction: {
      en: "Catalan HUT registration is handled through the Generalitat tourism register and your municipality (responsible declaration, urban planning, and zone rules). Gather NIE/NIF, cadastral reference, ownership or lawful use, energy certificate if required, and community approval when applicable. Host Registry helps you track readiness. You submit on official Generalitat and municipal channels yourself.",
      fr: "L'enregistrement HUT catalan passe par le registre touristique de la Generalitat et votre municipalité (déclaration responsable, urbanisme, zones). Rassemblez NIE/NIF, référence cadastrale, titre ou usage légal, certificat énergétique si requis, et accord de copropriété le cas échéant. Host Registry suit la préparation. Vous déposez vous-même sur les canaux officiels Generalitat et municipalité.",
    },
    officialUrls: [
      {
        url: CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
        label: {
          en: "Registre de Turisme de Catalunya (reference list)",
          fr: "Registre de Turisme de Catalunya (liste de référence)",
        },
        role: "info",
        urlVerified: true,
      },
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
      en: [
        "NIE/NIF",
        "Cadastral reference",
        "Responsible declaration to municipality",
        "Energy certificate (if required)",
      ],
      fr: [
        "NIE/NIF",
        "Référence cadastrale",
        "Déclaration responsable en municipalité",
        "Certificat énergétique (si requis)",
      ],
    },
    pitfalls: {
      en: "Host Registry does not file with the Generalitat or your city hall and does not issue HUT numbers. Do not use a defunct NRUA code as your listing number after STS 620/2026.",
      fr: "Host Registry ne dépose pas auprès de la Generalitat ni de la mairie et ne délivre pas de numéros HUT. N'utilisez pas un code NRUA obsolète comme numéro d'annonce après STS 620/2026.",
    },
    fieldHints: ["name", "address", "city", "propertyType", "residencyStatus"],
  },
  {
    key: `${cityKey}-es-official-registration`,
    title: {
      en: "Obtain HUT from the Catalan register (you file)",
      fr: "Obtenir le HUT au registre catalan (vous déposez)",
    },
    instruction: {
      en: "Complete registration with the Registre de Turisme de Catalunya and receive your HUT number (prefix HUT). Use Canal Empresa or municipal procedures as the Generalitat currently publishes. Enter the number in Host Registry when issued. This is the number Airbnb and Booking verify under EU 2024/1028, not NRUA.",
      fr: "Finalisez l'inscription au Registre de Turisme de Catalunya et recevez votre numéro HUT (préfixe HUT). Utilisez Canal Empresa ou les procédures municipales publiées par la Generalitat. Saisissez le numéro dans Host Registry une fois délivré. C'est ce numéro qu'Airbnb et Booking vérifient au titre de l'UE 2024/1028, pas le NRUA.",
    },
    officialUrls: [
      {
        url: CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
        label: {
          en: "Catalan Tourism Register data",
          fr: "Données Registre de Turisme de Catalunya",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Issued HUT number", "Municipal approval if required"],
      fr: ["Numéro HUT délivré", "Autorisation municipale si requise"],
    },
    fieldHints: ["address", "city"],
  },
  {
    key: `${cityKey}-es-store-registration`,
    title: {
      en: "Store HUT in Host Registry",
      fr: "Enregistrer le HUT dans Host Registry",
    },
    instruction: {
      en: "Paste your HUT number, set status to active, and confirm license kind HUT. Keep a PDF certificate from Canal Empresa in your evidence pack if you have one.",
      fr: "Collez votre numéro HUT, passez le statut à actif et confirmez le type de licence HUT. Conservez le certificat PDF Canal Empresa dans votre dossier preuve si disponible.",
    },
    officialUrls: [],
    documents: {
      en: ["HUT number", "Canal Empresa certificate (optional)"],
      fr: ["Numéro HUT", "Certificat Canal Empresa (optionnel)"],
    },
    fieldHints: ["notes"],
  },
  {
    key: `${cityKey}-display-es-registration`,
    title: {
      en: "Display HUT on every platform listing",
      fr: "Afficher le HUT sur chaque annonce",
    },
    instruction: {
      en: "Add your HUT to Airbnb, Booking.com, and other OTAs. Platforms validate regional numbers under EU 2024/1028. Mark listing display in Host Registry when done on each channel.",
      fr: "Ajoutez votre HUT sur Airbnb, Booking.com et autres OTA. Les plateformes valident les numéros régionaux au titre de l'UE 2024/1028. Cochez l'affichage dans Host Registry une fois fait sur chaque canal.",
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
      en: ["Screenshots of listing fields with HUT visible"],
      fr: ["Captures des champs d'annonce avec HUT visible"],
    },
    fieldHints: ["notes"],
  },
];

const mossosGuestSteps = (cityKey: string): PlaybookStep[] => [
  {
    key: `${cityKey}-mossos-enrollment`,
    title: {
      en: "Enroll establishment with Mossos (PI-15 alta)",
      fr: "Inscrire l'établissement auprès des Mossos (alta PI-15)",
    },
    instruction: {
      en: "Before your first guest report, register your establishment with Mossos d'Esquadra via the PI-15 procedure. Obtain your establishment code. Do not also submit to SES.HOSPEDAJES. Catalonia uses Mossos Hotels only.",
      fr: "Avant votre première déclaration, inscrivez votre établissement auprès des Mossos d'Esquadra via la procédure PI-15. Obtenez votre code établissement. Ne soumettez pas aussi à SES.HOSPEDAJES. La Catalogne utilise uniquement Mossos Hotels.",
    },
    officialUrls: [
      {
        url: MOSSOS_PORTAL_URL,
        label: {
          en: "Mossos Hotels guest register (verify access)",
          fr: "Mossos Hotels registre voyageurs (vérifier l'accès)",
        },
        role: "portal",
        urlVerified: false,
      },
    ],
    documents: {
      en: ["HUT number", "NIE/NIF", "Property address"],
      fr: ["Numéro HUT", "NIE/NIF", "Adresse du bien"],
    },
    fieldHints: ["address", "city"],
  },
  {
    key: `${cityKey}-mossos-guest-reporting`,
    title: {
      en: "Report guests via Mossos Hotels within 24h",
      fr: "Déclarer les voyageurs via Mossos Hotels sous 24h",
    },
    instruction: {
      en: "Collect Annex I guest data via the Host Registry check-in link, export fitxa or CSV, and enter data on the Mossos Hotels portal. Host Registry prepares and validates. You submit on the official portal. Retain records 3 years (RD 933/2021). SES.HOSPEDAJES is a separate national system and does not replace Mossos in Catalonia.",
      fr: "Collectez les données Annexe I via le lien check-in Host Registry, exportez fitxa ou CSV, et saisissez les données sur le portail Mossos Hotels. Host Registry prépare et valide. Vous soumettez sur le portail officiel. Conservez les registres 3 ans (RD 933/2021). SES.HOSPEDAJES est un système national distinct et ne remplace pas Mossos en Catalogne.",
    },
    officialUrls: [
      {
        url: MOSSOS_LOGIN_URL,
        label: {
          en: "Mossos Hotels login (verify access)",
          fr: "Connexion Mossos Hotels (vérifier l'accès)",
        },
        role: "portal",
        urlVerified: false,
      },
      {
        url: RD_933_URL,
        label: {
          en: "RD 933/2021 guest reporting rules",
          fr: "RD 933/2021 déclaration voyageurs",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    timeline: {
      en: "Within 24 hours of check-in. Retain register 3 years.",
      fr: "Sous 24 heures après l'arrivée. Conserver le registre 3 ans.",
    },
    documents: {
      en: ["Annex I guest export", "Establishment code"],
      fr: ["Export voyageurs Annexe I", "Code établissement"],
    },
    fieldHints: ["address", "city"],
  },
];

const barcelonaMunicipalStep: PlaybookStep = {
  key: "barcelona-municipal-rules",
  title: {
    en: "Check Barcelona municipal tourism housing rules",
    fr: "Vérifier les règles municipales Barcelone",
  },
  instruction: {
    en: "Barcelona applies additional zone restrictions and municipal requirements on top of the Catalan HUT. Review current city rules before listing. Host Registry does not obtain municipal permits for you.",
    fr: "Barcelone applique des restrictions de zone et exigences municipales en plus du HUT catalan. Consultez les règles municipales avant de publier. Host Registry n'obtient pas les autorisations municipales pour vous.",
  },
  officialUrls: [
    {
      url: BARCELONA_TOURISM_HOUSING_URL,
      label: {
        en: "Barcelona City Council tourism",
        fr: "Tourisme — Ajuntament de Barcelona",
      },
      role: "rules",
      urlVerified: true,
    },
  ],
  documents: {
    en: ["Municipal compliance checklist"],
    fr: ["Checklist conformité municipale"],
  },
  fieldHints: ["address", "city"],
};

export const SPAIN_CATALONIA_PLAYBOOK: Playbook = {
  id: "es-catalonia",
  country: "Spain",
  sourceReviewedAt: "2026-09-28",
  title: {
    en: "Catalonia — HUT registration and Mossos guest reporting",
    fr: "Catalogne — enregistrement HUT et déclaration Mossos",
  },
  description: {
    en: "Regional HUT registration after STS 620/2026, platform display under EU 2024/1028, and Mossos Hotels guest reporting (not SES).",
    fr: "Enregistrement HUT régional post-STS 620/2026, affichage plateformes (UE 2024/1028) et déclaration Mossos Hotels (pas SES).",
  },
  steps: [
    ...cataloniaRegistrationSteps("catalonia"),
    ...mossosGuestSteps("catalonia"),
  ],
};

export const SPAIN_BARCELONA_REGISTRATION_PLAYBOOK: Playbook = {
  id: "es-barcelona",
  country: "Spain",
  city: "Barcelona",
  sourceReviewedAt: "2026-09-28",
  title: {
    en: "Barcelona — HUT, municipal rules and Mossos",
    fr: "Barcelone — HUT, règles municipales et Mossos",
  },
  description: {
    en: "Barcelona properties in Catalonia: HUT from the Generalitat register, city restrictions, Mossos guest reporting, and platform display. NRUA is not the listing number.",
    fr: "Biens à Barcelone en Catalogne : HUT au registre Generalitat, restrictions municipales, déclaration Mossos et affichage plateformes. Le NRUA n'est pas le numéro d'annonce.",
  },
  steps: [
    ...cataloniaRegistrationSteps("barcelona"),
    barcelonaMunicipalStep,
    ...mossosGuestSteps("barcelona"),
  ],
};
