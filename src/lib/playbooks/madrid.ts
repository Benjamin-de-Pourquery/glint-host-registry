import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  MADRID_AYUNTAMIENTO_TURISMO_URL,
  MADRID_DECRETO_79_2014_URL,
  MADRID_DECRETO_27_2026_URL,
  MADRID_VUT_REGISTER_URL,
  RD_933_URL,
  SES_HOSPEDAJES_PORTAL_URL,
  SES_HOSPEDAJES_TEST_URL,
} from "@/lib/spain/official-links";

const madridRegistrationSteps = (cityKey: string): PlaybookStep[] => [
  {
    key: "es-post-nrua-context",
    title: {
      en: "Understand post-STS 620/2026 registration landscape",
      fr: "Comprendre le cadre post-STS 620/2026",
    },
    instruction: {
      en: "Spain's Supreme Court (STS 620/2026) annulled the national NRUA short-let register. Platforms verify your regional tourism number instead. In Comunidad de Madrid this is your VUT registration in the Registro de Empresas Turísticas (declaración responsable). VUDA or SDEP data-sharing and EU Regulation 2024/1028 still apply. Guest reporting for Madrid properties uses SES.HOSPEDAJES (Ministry of Interior), not Mossos.",
      fr: "Le Tribunal suprême espagnol (STS 620/2026) a annulé le registre national NRUA. Les plateformes vérifient votre numéro touristique régional. En Communauté de Madrid, c'est l'enregistrement VUT au Registro de Empresas Turísticas (déclaration responsable). Le partage VUDA ou SDEP et le règlement UE 2024/1028 s'appliquent toujours. La déclaration voyageurs pour Madrid passe par SES.HOSPEDAJES, pas par les Mossos.",
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
        url: MADRID_VUT_REGISTER_URL,
        label: {
          en: "Comunidad de Madrid VUT register",
          fr: "Registre VUT Communauté de Madrid",
        },
        role: "portal",
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
      en: "Confirm Comunidad de Madrid as your autonomous community",
      fr: "Confirmer la Communauté de Madrid",
    },
    instruction: {
      en: "Host Registry tracks Comunidad de Madrid (VUT) separately from Catalonia (HUT) and other regions. Confirm Madrid in the registration card before preparing your dossier. Regional registration does not replace municipal urban planning rules where your city requires them.",
      fr: "Host Registry suit la Communauté de Madrid (VUT) séparément de la Catalogne (HUT) et des autres régions. Confirmez Madrid dans la fiche d'enregistrement avant le dossier. L'enregistrement régional ne remplace pas l'urbanisme municipal lorsque votre ville l'exige.",
    },
    officialUrls: [
      {
        url: MADRID_DECRETO_79_2014_URL,
        label: {
          en: "Decreto 79/2014 (VUT framework)",
          fr: "Décret 79/2014 (cadre VUT)",
        },
        role: "rules",
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
      en: "Prepare VUT dossier (CIVUT, owners, and technical rules)",
      fr: "Préparer le dossier VUT (CIVUT, copropriété, règles techniques)",
    },
    instruction: {
      en: "Under Decreto 79/2014 as amended by Decreto 27/2026 (BOCM, in force from 26 April 2026), gather your Certificado de Idoneidad (CIVUT), explicit comunidad de propietarios agreement where required (3/5 under LPH), confirm the unit is not in vivienda de protección pública, and meet updated technical minimums. Pre-existing VUTs may have up to 3 years to adapt. Host Registry tracks readiness. You file on Comunidad de Madrid and municipal channels yourself.",
      fr: "Sous le Décret 79/2014 modifié par le Décret 27/2026 (BOCM, en vigueur au 26 avril 2026), rassemblez le Certificado de Idoneidad (CIVUT), l'accord explicite de la communauté de propriétaires si requis (3/5 LPH), confirmez que le logement n'est pas en vivienda de protección pública, et respectez les minima techniques. Les VUT existants peuvent disposer de 3 ans pour s'adapter. Host Registry suit la préparation. Vous déposez vous-même auprès de la Communauté de Madrid et de la municipalité.",
    },
    officialUrls: [
      {
        url: MADRID_DECRETO_27_2026_URL,
        label: {
          en: "Decreto 27/2026 (BOCM amendments)",
          fr: "Décret 27/2026 (modifications BOCM)",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: MADRID_VUT_REGISTER_URL,
        label: {
          en: "Madrid VUT registration portal",
          fr: "Portail enregistrement VUT Madrid",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "NIE/NIF",
        "CIVUT (Certificado de Idoneidad)",
        "Comunidad de propietarios agreement (3/5 when applicable)",
        "Cadastral reference",
        "Energy certificate if required",
      ],
      fr: [
        "NIE/NIF",
        "CIVUT (Certificado de Idoneidad)",
        "Accord communauté de propriétaires (3/5 si applicable)",
        "Référence cadastrale",
        "Certificat énergétique si requis",
      ],
    },
    pitfalls: {
      en: "Host Registry does not file with the Comunidad de Madrid or your ayuntamiento and does not issue VUT numbers. A regional registration number is not proof that municipal urban rules are satisfied.",
      fr: "Host Registry ne dépose pas auprès de la Communauté de Madrid ni de la mairie et ne délivre pas de numéros VUT. Un numéro régional ne prouve pas que l'urbanisme municipal est respecté.",
    },
    fieldHints: ["name", "address", "city", "propertyType", "residencyStatus"],
  },
  {
    key: `${cityKey}-es-official-registration`,
    title: {
      en: "Register in Registro de Empresas Turísticas (you file)",
      fr: "S'inscrire au Registro de Empresas Turísticas (vous déposez)",
    },
    instruction: {
      en: "Complete the declaración responsable in the Comunidad de Madrid tourism business register and obtain your VUT registration reference for the property. Enter the number in Host Registry when issued. Platforms verify regional numbers under EU 2024/1028, not NRUA.",
      fr: "Finalisez la déclaration responsable au registre des entreprises touristiques de la Communauté de Madrid et obtenez votre référence VUT. Saisissez le numéro dans Host Registry une fois délivré. Les plateformes vérifient les numéros régionaux au titre de l'UE 2024/1028, pas le NRUA.",
    },
    officialUrls: [
      {
        url: MADRID_VUT_REGISTER_URL,
        label: {
          en: "Comunidad de Madrid VUT register",
          fr: "Registre VUT Communauté de Madrid",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Issued VUT registration number", "Declaración responsable receipt"],
      fr: ["Numéro VUT délivré", "Accusé déclaration responsable"],
    },
    fieldHints: ["address", "city"],
  },
  {
    key: `${cityKey}-es-store-registration`,
    title: {
      en: "Store VUT number in Host Registry",
      fr: "Enregistrer le numéro VUT dans Host Registry",
    },
    instruction: {
      en: "Paste your Comunidad de Madrid VUT registration number, set status to active, and confirm license kind VUT. Keep PDF receipts from the regional portal in your evidence pack.",
      fr: "Collez votre numéro VUT Communauté de Madrid, passez le statut à actif et confirmez le type de licence VUT. Conservez les PDF du portail régional dans votre dossier preuve.",
    },
    officialUrls: [],
    documents: {
      en: ["VUT registration number", "Regional portal receipt (optional)"],
      fr: ["Numéro VUT", "Accusé portail régional (optionnel)"],
    },
    fieldHints: ["notes"],
  },
  {
    key: `${cityKey}-display-es-registration`,
    title: {
      en: "Display VUT on every platform listing",
      fr: "Afficher le VUT sur chaque annonce",
    },
    instruction: {
      en: "Add your VUT registration number to Airbnb, Booking.com, and other OTAs. Platforms validate regional numbers under EU 2024/1028. Mark listing display in Host Registry when done on each channel.",
      fr: "Ajoutez votre numéro VUT sur Airbnb, Booking.com et autres OTA. Les plateformes valident les numéros régionaux au titre de l'UE 2024/1028. Cochez l'affichage dans Host Registry une fois fait sur chaque canal.",
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
      en: ["Screenshots of listing fields with VUT visible"],
      fr: ["Captures des champs d'annonce avec VUT visible"],
    },
    fieldHints: ["notes"],
  },
];

const sesGuestSteps = (cityKey: string): PlaybookStep[] => [
  {
    key: `${cityKey}-ses-hospedajes`,
    title: {
      en: "Declare guests to SES.HOSPEDAJES within 24h",
      fr: "Déclarer les voyageurs à SES.HOSPEDAJES sous 24h",
    },
    instruction: {
      en: "Comunidad de Madrid uses the national SES portal (RD 933/2021), not Mossos. Configure SOAP credentials in the Register tab, collect Annex I guest data via check-in link, then prepare and submit (or dry-run) from the guest stay. Host Registry does not replace your legal obligation to file on SES.",
      fr: "La Communauté de Madrid utilise le portail SES national (RD 933/2021), pas les Mossos. Configurez les identifiants SOAP dans l'onglet Registre, collectez les données Annexe I via le lien check-in, puis préparez et soumettez (ou simulez) depuis le séjour. Host Registry ne remplace pas votre obligation de déposer sur SES.",
    },
    officialUrls: [
      {
        url: SES_HOSPEDAJES_PORTAL_URL,
        label: {
          en: "SES.HOSPEDAJES portal (Spanish only)",
          fr: "Portail SES.HOSPEDAJES (espagnol uniquement)",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: SES_HOSPEDAJES_TEST_URL,
        label: {
          en: "SES test environment",
          fr: "Environnement test SES",
        },
        role: "info",
        urlVerified: true,
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
      en: "Within 24 hours of each check-in.",
      fr: "Sous 24 heures après chaque arrivée.",
    },
    documents: {
      en: [
        "SES landlord code",
        "WS username and password",
        "Establishment code",
        "Guest ID document, nationality, address",
      ],
      fr: [
        "Code arrendador SES",
        "Identifiant et mot de passe WS",
        "Code établissement",
        "Document d'identité, nationalité, adresse voyageur",
      ],
    },
    pitfalls: {
      en: "Do not submit Madrid guests to Mossos. Catalonia uses Mossos Hotels only.",
      fr: "Ne déclarez pas les voyageurs de Madrid aux Mossos. La Catalogne utilise uniquement Mossos Hotels.",
    },
    fieldHints: ["name", "address", "city", "country"],
  },
];

const madridCapitalMunicipalStep: PlaybookStep = {
  key: "madrid-capital-municipal-licence",
  title: {
    en: "Check Madrid city urban licence and PEH rules (to confirm per address)",
    fr: "Vérifier licence urbanistique Madrid et PEH (à confirmer par adresse)",
  },
  instruction: {
    en: "Madrid capital may require a municipal urbanistic activity licence in addition to regional VUT registration. The Plan Especial Hospedaje (PEH) and related rules can require independent access in many zones. Zoning is address-specific: confirm with Ayuntamiento de Madrid before listing. Host Registry tracks dossier checks only. We do not obtain municipal licences or auto-submit to the city.",
    fr: "Madrid capitale peut exiger une licence d'activité urbanistique municipale en plus du VUT régional. Le Plan Especial Hospedaje (PEH) peut imposer un accès indépendant dans de nombreuses zones. Le zonage dépend de l'adresse : confirmez auprès de l'Ayuntamiento de Madrid avant de publier. Host Registry suit les contrôles de dossier uniquement. Pas de licence municipale ni de dépôt automatique en mairie.",
  },
  officialUrls: [
    {
      url: MADRID_AYUNTAMIENTO_TURISMO_URL,
      label: {
        en: "Ayuntamiento de Madrid tourism / urban information",
        fr: "Tourisme / urbanisme Ayuntamiento de Madrid",
      },
      role: "info",
      urlVerified: true,
    },
  ],
  documents: {
    en: [
      "Municipal licence status (if required, to confirm)",
      "PEH / independent-access checklist for your address",
    ],
    fr: [
      "Statut licence municipale (si requise, à confirmer)",
      "Checklist PEH / accès indépendant pour votre adresse",
    ],
  },
  fieldHints: ["address", "city"],
};

export const SPAIN_MADRID_COMMUNITY_PLAYBOOK: Playbook = {
  id: "es-madrid-community",
  country: "Spain",
  sourceReviewedAt: "2026-09-29",
  title: {
    en: "Comunidad de Madrid — VUT registration and SES guest reporting",
    fr: "Communauté de Madrid — enregistrement VUT et déclaration SES",
  },
  description: {
    en: "Regional VUT declaración responsable after STS 620/2026, platform display under EU 2024/1028, and SES.HOSPEDAJES guest reporting (not Mossos).",
    fr: "VUT régional (déclaration responsable) post-STS 620/2026, affichage plateformes (UE 2024/1028) et déclaration SES.HOSPEDAJES (pas Mossos).",
  },
  steps: [
    ...madridRegistrationSteps("madrid-region"),
    ...sesGuestSteps("madrid-region"),
  ],
};

export const SPAIN_MADRID_CAPITAL_PLAYBOOK: Playbook = {
  id: "es-madrid",
  country: "Spain",
  city: "Madrid",
  sourceReviewedAt: "2026-09-29",
  title: {
    en: "Madrid — VUT, municipal licence checks and SES",
    fr: "Madrid — VUT, contrôles municipaux et SES",
  },
  description: {
    en: "Madrid capital: Comunidad de Madrid VUT registration, PEH / urban licence dossier checks (address-specific), SES guest reporting, and platform display. NRUA is not the listing number.",
    fr: "Madrid capitale : enregistrement VUT Communauté de Madrid, contrôles PEH / licence urbanistique (selon adresse), déclaration SES et affichage plateformes. Le NRUA n'est pas le numéro d'annonce.",
  },
  steps: [
    ...madridRegistrationSteps("madrid"),
    madridCapitalMunicipalStep,
    ...sesGuestSteps("madrid"),
  ],
};
