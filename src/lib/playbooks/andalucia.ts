import type { Playbook, PlaybookStep } from "./types";
import {
  ANDALUCIA_DECRETO_28_2016_PDF_URL,
  ANDALUCIA_DR_GUIA_PDF_URL,
  ANDALUCIA_SEDE_VUT_PROCEDURE_URL,
  ANDALUCIA_TURISMO_REGISTER_SEARCH_URL,
  ANDALUCIA_VUT_FAQ_URL,
  ANDALUCIA_VUT_INFO_URL,
  EU_1028_URL,
  MALAGA_AGENDA_URBANA_URL,
  MALAGA_AYUNTAMIENTO_URL,
  RD_933_URL,
  SES_HOSPEDAJES_PORTAL_URL,
  SES_HOSPEDAJES_TEST_URL,
  SEVILLE_TURISMO_URL,
} from "@/lib/spain/official-links";

const andaluciaRegistrationSteps = (cityKey: string): PlaybookStep[] => [
  {
    key: "es-post-nrua-context",
    title: {
      en: "Understand post-STS 620/2026 registration landscape",
      fr: "Comprendre le cadre post-STS 620/2026",
    },
    instruction: {
      en: "Spain's Supreme Court (STS 620/2026) annulled the national NRUA short-let register. Platforms verify your regional tourism number instead. In Andalucía this is your VUT inscription in the Registro de Turismo de Andalucía (declaración responsable through the Junta electronic office). VUDA or EU Regulation 2024/1028 data-sharing may still apply. Guest reporting for Andalusian properties uses SES.HOSPEDAJES (Ministry of Interior), not Mossos or Ertzaintza.",
      fr: "Le Tribunal suprême espagnol (STS 620/2026) a annulé le registre national NRUA. Les plateformes vérifient votre numéro touristique régional. En Andalousie, c'est l'inscription VUT au Registro de Turismo de Andalucía (déclaration responsable via la sede électronique de la Junta). Le partage VUDA ou le règlement UE 2024/1028 peut encore s'appliquer. La déclaration voyageurs passe par SES.HOSPEDAJES, pas par les Mossos ni l'Ertzaintza.",
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
        url: ANDALUCIA_VUT_INFO_URL,
        label: {
          en: "Junta de Andalucía — tourist dwellings (VUT)",
          fr: "Junta de Andalucía — logements touristiques (VUT)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Property address", "NIE/NIF", "Municipality and province"],
      fr: ["Adresse du bien", "NIE/NIF", "Municipalité et province"],
    },
    fieldHints: ["address", "city", "country"],
  },
  {
    key: `${cityKey}-es-autonomous-community`,
    title: {
      en: "Confirm Andalucía as your autonomous community",
      fr: "Confirmer l'Andalousie comme communauté autonome",
    },
    instruction: {
      en: "Host Registry tracks Andalucía (VUT) separately from Catalonia (HUT), Comunidad de Madrid (VUT), Comunitat Valenciana (VUT), and other regions. Confirm Andalucía in the registration card before preparing your dossier. Regional registration does not replace municipal urban planning, cambio de uso, or licence rules where your ayuntamiento requires them.",
      fr: "Host Registry suit l'Andalousie (VUT) séparément de la Catalogne (HUT), de la Communauté de Madrid (VUT), de la Communauté valencienne (VUT) et des autres régions. Confirmez l'Andalousie dans la fiche d'enregistrement avant le dossier. L'enregistrement régional ne remplace pas l'urbanisme municipal, le changement d'usage ou les licences exigées par votre mairie.",
    },
    officialUrls: [
      {
        url: ANDALUCIA_DECRETO_28_2016_PDF_URL,
        label: {
          en: "Decreto 28/2016 — VUT framework (PDF)",
          fr: "Décret 28/2016 — cadre VUT (PDF)",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: ANDALUCIA_VUT_FAQ_URL,
        label: {
          en: "Junta VUT FAQ",
          fr: "FAQ VUT Junta",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Property city and province confirmation"],
      fr: ["Confirmation ville et province du bien"],
    },
    fieldHints: ["city", "country"],
  },
  {
    key: `${cityKey}-es-municipal-prerequisites`,
    title: {
      en: "Confirm municipal urban compatibility and licences (address-specific)",
      fr: "Confirmer compatibilité urbanistique et licences municipales (selon adresse)",
    },
    instruction: {
      en: "Before filing with the Junta, confirm with your ayuntamiento whether urban planning compatibility, cambio de uso, opening licences, or other municipal steps apply to your address. Rules differ between new VUT registrations and dwellings already inscribed in the Registro de Turismo de Andalucía. Host Registry tracks dossier readiness only. We do not request municipal reports or auto-submit to the city.",
      fr: "Avant le dépôt auprès de la Junta, confirmez auprès de votre mairie si compatibilité urbanistique, changement d'usage, licences d'ouverture ou autres démarches municipales s'appliquent à votre adresse. Les règles diffèrent entre nouvelles inscriptions VUT et logements déjà inscrits au Registro de Turismo de Andalucía. Host Registry suit la préparation du dossier uniquement. Pas de demande municipale ni de dépôt automatique en mairie.",
    },
    officialUrls: [
      {
        url: ANDALUCIA_VUT_FAQ_URL,
        label: {
          en: "Junta FAQ — municipal and regional steps",
          fr: "FAQ Junta — étapes municipales et régionales",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Municipal urban compatibility status (to confirm)",
        "Cambio de uso or licence checklist for your address",
        "Comunidad de propietarios rules where applicable",
      ],
      fr: [
        "Statut compatibilité urbanistique municipale (à confirmer)",
        "Checklist changement d'usage ou licence pour votre adresse",
        "Règles de copropriété le cas échéant",
      ],
    },
    pitfalls: {
      en: "A Junta VUT code does not prove municipal zoning or licence compliance. Suspensions or PGOU changes are address-specific: confirm with your ayuntamiento before filing.",
      fr: "Un code VUT Junta ne prouve pas la conformité urbanistique ou licence municipale. Suspensions ou PGOU sont spécifiques à l'adresse : confirmez avec votre mairie avant le dépôt.",
    },
    fieldHints: ["address", "city", "propertyType", "residencyStatus"],
  },
  {
    key: `${cityKey}-es-dossier`,
    title: {
      en: "Prepare Registro de Turismo dossier (declaración responsable)",
      fr: "Préparer le dossier Registro de Turismo (déclaration responsable)",
    },
    instruction: {
      en: "Gather ownership or lawful use, technical and habitability requirements under Decreto 28/2016 and Junta guidance, digital certificate (FNMT or equivalent), and municipal confirmations from the prior step. Use the Junta declaración responsable guide to draft your dossier. Host Registry tracks readiness. You complete alta, modificación, or baja on the Junta Oficina Virtual yourself when ready.",
      fr: "Rassemblez titre ou usage légal, exigences techniques et d'habitabilité selon le Décret 28/2016 et les guides Junta, certificat numérique (FNMT ou équivalent), et confirmations municipales de l'étape précédente. Utilisez le guide déclaration responsable Junta pour le dossier. Host Registry suit la préparation. Vous effectuez alta, modificación ou baja sur la Oficina Virtual Junta vous-même.",
    },
    officialUrls: [
      {
        url: ANDALUCIA_DR_GUIA_PDF_URL,
        label: {
          en: "Junta guía — declaración responsable VUT (PDF)",
          fr: "Guide Junta — déclaration responsable VUT (PDF)",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: ANDALUCIA_SEDE_VUT_PROCEDURE_URL,
        label: {
          en: "Junta electronic office — tourism register procedure",
          fr: "Sede électronique Junta — procédure registre tourisme",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "NIE/NIF",
        "Declaración responsable draft",
        "Digital certificate ready",
        "Municipal confirmations (where required)",
        "Cadastral reference",
      ],
      fr: [
        "NIE/NIF",
        "Projet de déclaration responsable",
        "Certificat numérique prêt",
        "Confirmations municipales (si requises)",
        "Référence cadastrale",
      ],
    },
    pitfalls: {
      en: "Host Registry does not auto-submit to the Junta de Andalucía or your ayuntamiento. Glint does not issue VUT numbers.",
      fr: "Host Registry ne dépose pas automatiquement auprès de la Junta de Andalucía ni de la mairie. Glint ne délivre pas de numéros VUT.",
    },
    fieldHints: ["name", "address", "city", "propertyType", "residencyStatus"],
  },
  {
    key: `${cityKey}-es-official-registration`,
    title: {
      en: "File declaración responsable in Registro de Turismo (you file)",
      fr: "Déposer la déclaration responsable au Registro de Turismo (vous déposez)",
    },
    instruction: {
      en: "Submit your declaración responsable through the Junta de Andalucía electronic procedure (Oficina Virtual / Registro de Turismo de Andalucía) and obtain your VUT registration code. Andalusian listings typically use a VUT/province pattern (for example VUT/MA/##### for Málaga province or VUT/SE/##### for Sevilla province). Enter the code in Host Registry when issued. Platforms verify regional numbers under EU 2024/1028, not NRUA.",
      fr: "Soumettez votre déclaration responsable via la procédure électronique de la Junta de Andalucía (Oficina Virtual / Registro de Turismo de Andalucía) et obtenez votre code VUT. Les annonces andalouses utilisent typiquement un format VUT/province (par ex. VUT/MA/##### pour Málaga ou VUT/SE/##### pour Séville). Saisissez le code dans Host Registry une fois délivré. Les plateformes vérifient les numéros régionaux au titre de l'UE 2024/1028, pas le NRUA.",
    },
    officialUrls: [
      {
        url: ANDALUCIA_SEDE_VUT_PROCEDURE_URL,
        label: {
          en: "Junta sede — VUT registration procedure",
          fr: "Sede Junta — procédure inscription VUT",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: ANDALUCIA_TURISMO_REGISTER_SEARCH_URL,
        label: {
          en: "Registro de Turismo establishment search",
          fr: "Recherche établissements Registro de Turismo",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Issued VUT code", "Declaración responsable receipt"],
      fr: ["Code VUT délivré", "Accusé déclaration responsable"],
    },
    fieldHints: ["address", "city"],
  },
  {
    key: `${cityKey}-es-store-registration`,
    title: {
      en: "Store VUT code in Host Registry",
      fr: "Enregistrer le code VUT dans Host Registry",
    },
    instruction: {
      en: "Paste your Registro de Turismo de Andalucía VUT code, set status to active, confirm license kind VUT, and keep PDF receipts from the Junta procedure in your evidence pack.",
      fr: "Collez votre code VUT Registro de Turismo de Andalucía, passez le statut à actif, confirmez le type de licence VUT, et conservez les PDF de la procédure Junta dans votre dossier preuve.",
    },
    officialUrls: [],
    documents: {
      en: ["VUT registration code", "Junta portal receipt (optional)"],
      fr: ["Code VUT", "Accusé portail Junta (optionnel)"],
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
      en: "Add your Registro de Turismo VUT code to Airbnb, Booking.com, and other OTAs. Platforms validate regional numbers under EU 2024/1028. Mark listing display in Host Registry when done on each channel.",
      fr: "Ajoutez votre code VUT Registro de Turismo sur Airbnb, Booking.com et autres OTA. Les plateformes valident les numéros régionaux au titre de l'UE 2024/1028. Cochez l'affichage dans Host Registry une fois fait sur chaque canal.",
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
      en: "Andalucía uses the national SES portal (RD 933/2021), not Mossos or Ertzaintza. Configure SOAP credentials in the Register tab, collect Annex I guest data via check-in link, then prepare and submit (or dry-run) from the guest stay. Host Registry does not replace your legal obligation to file on SES.",
      fr: "L'Andalousie utilise le portail SES national (RD 933/2021), pas les Mossos ni l'Ertzaintza. Configurez les identifiants SOAP dans l'onglet Registre, collectez les données Annexe I via le lien check-in, puis préparez et soumettez (ou simulez) depuis le séjour. Host Registry ne remplace pas votre obligation de déposer sur SES.",
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
      en: "Do not submit Andalusian guests to Mossos or Ertzaintza.",
      fr: "Ne déclarez pas les voyageurs andalous aux Mossos ni à l'Ertzaintza.",
    },
    fieldHints: ["name", "address", "city", "country"],
  },
];

const malagaMunicipalStep: PlaybookStep = {
  key: "malaga-municipal-dossier",
  title: {
    en: "Málaga city municipal dossier (confirm with Ayuntamiento)",
    fr: "Dossier municipal Málaga (à confirmer auprès de la mairie)",
  },
  instruction: {
    en: "Málaga capital may apply additional urban planning, licensing, or zoning rules before or after regional VUT registration. Moratoriums, PGOU limits, and neighbourhood rules are address-specific and change over time: confirm current requirements with Ayuntamiento de Málaga (urbanismo and tourism channels) before filing your Junta declaración responsable. Host Registry tracks checklist status only.",
    fr: "Málaga capitale peut appliquer des règles d'urbanisme, de licence ou de zonage avant ou après l'inscription VUT régionale. Moratoires, PGOU et règles de quartier dépendent de l'adresse et évoluent : confirmez les exigences actuelles auprès de l'Ayuntamiento de Málaga (urbanismo et tourisme) avant votre déclaration responsable Junta. Host Registry suit uniquement la checklist.",
  },
  officialUrls: [
    {
      url: MALAGA_AYUNTAMIENTO_URL,
      label: {
        en: "Ayuntamiento de Málaga — portal",
        fr: "Ayuntamiento de Málaga — portail",
      },
      role: "info",
      urlVerified: true,
    },
    {
      url: MALAGA_AGENDA_URBANA_URL,
      label: {
        en: "Ayuntamiento de Málaga — urban agenda",
        fr: "Ayuntamiento de Málaga — agenda urbaine",
      },
      role: "info",
      urlVerified: true,
    },
    {
      url: ANDALUCIA_VUT_FAQ_URL,
      label: {
        en: "Junta VUT FAQ (regional vs municipal)",
        fr: "FAQ VUT Junta (régional vs municipal)",
      },
      role: "rules",
      urlVerified: true,
    },
  ],
  documents: {
    en: [
      "Municipal urban compatibility confirmation (to obtain)",
      "Any local licence or cambio de uso status",
    ],
    fr: [
      "Confirmation compatibilité urbanistique municipale (à obtenir)",
      "Statut licence locale ou changement d'usage",
    ],
  },
  fieldHints: ["address", "city"],
};

const sevilleMunicipalStep: PlaybookStep = {
  key: "seville-municipal-dossier",
  title: {
    en: "Seville city municipal dossier (confirm with Ayuntamiento)",
    fr: "Dossier municipal Séville (à confirmer auprès de la mairie)",
  },
  instruction: {
    en: "Seville capital may require urban compatibility, cambio de uso, saturation limits, or other municipal steps in addition to Junta VUT registration. Requirements are address-specific: confirm with Ayuntamiento de Sevilla (urbanismo and municipal tourism channels) before listing. Host Registry does not obtain municipal reports or auto-submit to the city.",
    fr: "Séville capitale peut exiger compatibilité urbanistique, changement d'usage, limites de saturation ou autres démarches municipales en plus du VUT Junta. Les exigences dépendent de l'adresse : confirmez auprès de l'Ayuntamiento de Sevilla (urbanismo et tourisme municipal) avant de publier. Host Registry ne demande pas de rapports municipaux ni ne dépose en mairie.",
  },
  officialUrls: [
    {
      url: SEVILLE_TURISMO_URL,
      label: {
        en: "Turismo de Sevilla — municipal tourism entry",
        fr: "Turismo de Sevilla — entrée tourisme municipal",
      },
      role: "info",
      urlVerified: true,
    },
    {
      url: ANDALUCIA_VUT_FAQ_URL,
      label: {
        en: "Junta VUT FAQ (regional vs municipal)",
        fr: "FAQ VUT Junta (régional vs municipal)",
      },
      role: "rules",
      urlVerified: true,
    },
  ],
  documents: {
    en: [
      "Municipal urban compatibility or cambio de uso status (to confirm)",
      "Saturation or zoning checklist for your district",
    ],
    fr: [
      "Statut compatibilité urbanistique ou changement d'usage (à confirmer)",
      "Checklist saturation ou zonage pour votre quartier",
    ],
  },
  fieldHints: ["address", "city"],
};

export const SPAIN_ANDALUCIA_COMMUNITY_PLAYBOOK: Playbook = {
  id: "es-andalucia",
  country: "Spain",
  sourceReviewedAt: "2026-10-04",
  title: {
    en: "Andalucía — VUT registration and SES guest reporting",
    fr: "Andalousie — enregistrement VUT et déclaration SES",
  },
  description: {
    en: "Junta de Andalucía VUT (declaración responsable, Registro de Turismo), municipal prerequisites, platform display under EU 2024/1028, and SES.HOSPEDAJES guest reporting.",
    fr: "VUT Junta de Andalucía (déclaration responsable, Registro de Turismo), prérequis municipaux, affichage plateformes (UE 2024/1028) et déclaration SES.HOSPEDAJES.",
  },
  steps: [
    ...andaluciaRegistrationSteps("andalucia-region"),
    ...sesGuestSteps("andalucia-region"),
  ],
};

export const SPAIN_SEVILLE_CAPITAL_PLAYBOOK: Playbook = {
  id: "es-seville",
  country: "Spain",
  city: "Seville",
  sourceReviewedAt: "2026-10-04",
  title: {
    en: "Seville — VUT, municipal dossier, and SES",
    fr: "Séville — VUT, dossier municipal et SES",
  },
  description: {
    en: "Seville capital and Andalucía: municipal urban dossier checks (address-specific), Junta Registro de Turismo VUT, platform display, and SES guest reporting. NRUA is not the listing number.",
    fr: "Séville capitale et Andalousie : contrôles dossier municipal (selon adresse), VUT Registro de Turismo Junta, affichage plateformes et déclaration SES. Le NRUA n'est pas le numéro d'annonce.",
  },
  steps: [
    ...andaluciaRegistrationSteps("seville"),
    sevilleMunicipalStep,
    ...sesGuestSteps("seville"),
  ],
};

export const SPAIN_MALAGA_PLAYBOOK: Playbook = {
  id: "es-malaga",
  country: "Spain",
  city: "Málaga",
  sourceReviewedAt: "2026-10-04",
  title: {
    en: "Málaga — VUT, municipal dossier, and SES",
    fr: "Málaga — VUT, dossier municipal et SES",
  },
  description: {
    en: "Málaga capital and Andalucía: confirm municipal urban rules with Ayuntamiento de Málaga, Junta VUT declaración responsable, platform display, and SES guest reporting.",
    fr: "Málaga capitale et Andalousie : confirmer l'urbanisme municipal auprès de l'Ayuntamiento de Málaga, déclaration responsable VUT Junta, affichage plateformes et déclaration SES.",
  },
  steps: [
    ...andaluciaRegistrationSteps("malaga"),
    malagaMunicipalStep,
    ...sesGuestSteps("malaga"),
  ],
};
