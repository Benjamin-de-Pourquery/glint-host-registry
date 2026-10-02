import type { Playbook, PlaybookStep } from "./types";
import {
  CV_DECRETO_LEY_9_2024_URL,
  CV_VUT_CINDI_INFO_URL,
  CV_VUT_FAQ_PDF_URL,
  CV_VUT_REGISTER_PROCEDURE_URL,
  EU_1028_URL,
  RD_933_URL,
  SES_HOSPEDAJES_PORTAL_URL,
  SES_HOSPEDAJES_TEST_URL,
  VALENCIA_CITY_TURISME_URL,
} from "@/lib/spain/official-links";

const valencianRegistrationSteps = (cityKey: string): PlaybookStep[] => [
  {
    key: "es-post-nrua-context",
    title: {
      en: "Understand post-STS 620/2026 registration landscape",
      fr: "Comprendre le cadre post-STS 620/2026",
    },
    instruction: {
      en: "Spain's Supreme Court (STS 620/2026) annulled the national NRUA short-let register. Platforms verify your regional tourism number instead. In the Comunitat Valenciana this is your VUT inscription in the Registro de Turismo (declaración responsable / autoregistro). VUDA or EU Regulation 2024/1028 data-sharing may still apply; the listing identifier is the regional Registro Turismo code, not NRUA. Guest reporting for Valencian properties uses SES.HOSPEDAJES (Ministry of Interior), not Mossos.",
      fr: "Le Tribunal suprême espagnol (STS 620/2026) a annulé le registre national NRUA. Les plateformes vérifient votre numéro touristique régional. En Communauté valencienne, c'est l'inscription VUT au Registro de Turismo (déclaration responsable / autoregistro). Le partage VUDA ou le règlement UE 2024/1028 peut encore s'appliquer ; l'identifiant d'annonce est le code Registro Turismo régional, pas le NRUA. La déclaration voyageurs passe par SES.HOSPEDAJES, pas par les Mossos.",
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
        url: CV_VUT_FAQ_PDF_URL,
        label: {
          en: "Generalitat Valenciana VUT FAQ (PDF)",
          fr: "FAQ VUT Generalitat Valenciana (PDF)",
        },
        role: "rules",
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
      en: "Confirm Comunitat Valenciana as your autonomous community",
      fr: "Confirmer la Communauté valencienne",
    },
    instruction: {
      en: "Host Registry tracks Comunitat Valenciana (VUT) separately from Catalonia (HUT), Comunidad de Madrid (VUT), and other regions. Confirm the Valencian community in the registration card before preparing your dossier. Regional registration does not replace municipal urban planning rules (ICU) where your city requires them.",
      fr: "Host Registry suit la Communauté valencienne (VUT) séparément de la Catalogne (HUT), de la Communauté de Madrid (VUT) et des autres régions. Confirmez la communauté valencienne dans la fiche d'enregistrement avant le dossier. L'enregistrement régional ne remplace pas l'urbanisme municipal (ICU) lorsque votre ville l'exige.",
    },
    officialUrls: [
      {
        url: CV_VUT_CINDI_INFO_URL,
        label: {
          en: "Turisme GVA — tourist housing (VUT)",
          fr: "Turisme GVA — logements touristiques (VUT)",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: CV_DECRETO_LEY_9_2024_URL,
        label: {
          en: "Decreto-ley 9/2024 (DOGV VUT rules)",
          fr: "Décret-loi 9/2024 (règles VUT DOGV)",
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
    key: `${cityKey}-es-municipal-icu`,
    title: {
      en: "Obtain favourable municipal ICU (urban compatibility report)",
      fr: "Obtenir un ICU municipal favorable (compatibilité urbanistique)",
    },
    instruction: {
      en: "Under Decreto-ley 9/2024 (DOGV), you need a favourable informe de compatibilidad urbanística para uso turístico (ICU) from your ayuntamiento before regional Registro Turismo inscription. Whole dwelling only (no room rental), max 10 consecutive nights to the same guest, and inscription validity is 5 years (renew before expiry). Host Registry tracks ICU and dossier readiness. You request the ICU and file with the Generalitat yourself.",
      fr: "Sous le Décret-loi 9/2024 (DOGV), vous devez obtenir un informe de compatibilidad urbanística para uso turístico (ICU) favorable de votre mairie avant l'inscription au Registro de Turismo régional. Logement entier uniquement (pas de location de chambre), max. 10 nuits consécutives pour le même voyageur, validité de l'inscription 5 ans (renouveler avant expiration). Host Registry suit l'ICU et le dossier. Vous demandez l'ICU et déposez auprès de la Generalitat vous-même.",
    },
    officialUrls: [
      {
        url: CV_VUT_FAQ_PDF_URL,
        label: {
          en: "VUT FAQ — ICU and municipal steps",
          fr: "FAQ VUT — ICU et étapes municipales",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: CV_DECRETO_LEY_9_2024_URL,
        label: {
          en: "Decreto-ley 9/2024 consolidated text",
          fr: "Texte consolidé Décret-loi 9/2024",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Favourable ICU (informe de compatibilidad urbanística)",
        "Cadastral reference",
        "NIE/NIF",
        "Energy certificate if required",
      ],
      fr: [
        "ICU favorable (informe de compatibilidad urbanística)",
        "Référence cadastrale",
        "NIE/NIF",
        "Certificat énergétique si requis",
      ],
    },
    pitfalls: {
      en: "Host Registry does not request ICU from your ayuntamiento or file with Turisme GVA. Without a favourable ICU, regional autoregistro should not proceed.",
      fr: "Host Registry ne demande pas l'ICU en mairie ni ne dépose auprès de Turisme GVA. Sans ICU favorable, l'autoregistro régional ne doit pas être engagé.",
    },
    fieldHints: ["address", "city", "propertyType", "residencyStatus"],
  },
  {
    key: `${cityKey}-es-dossier`,
    title: {
      en: "Prepare Registro Turismo dossier (declaración responsable)",
      fr: "Préparer le dossier Registro de Turismo (déclaration responsable)",
    },
    instruction: {
      en: "Gather ICU, ownership or lawful use, technical and habitability requirements, and any comunidad de propietarios rules for your building. Confirm whole-unit rental and the 10-night consecutive stay cap for the same guest. Host Registry tracks readiness. You complete autoregistro (alta, modificación, or cese) on the Generalitat electronic procedure yourself when ready.",
      fr: "Rassemblez l'ICU, le titre ou l'usage légal, les exigences techniques et d'habitabilité, et les règles de copropriété le cas échéant. Confirmez la location du logement entier et la limite de 10 nuits consécutives pour le même voyageur. Host Registry suit la préparation. Vous effectuez l'autoregistro (alta, modification ou cessation) sur la procédure électronique de la Generalitat vous-même.",
    },
    officialUrls: [
      {
        url: CV_VUT_REGISTER_PROCEDURE_URL,
        label: {
          en: "GVA electronic procedure — VUT autoregistro",
          fr: "Procédure électronique GVA — autoregistro VUT",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: CV_VUT_CINDI_INFO_URL,
        label: {
          en: "Turisme GVA VUT information",
          fr: "Informations VUT Turisme GVA",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Favourable ICU",
        "NIE/NIF",
        "Declaración responsable draft",
        "Proof of 5-year renewal timeline (calendar reminder)",
      ],
      fr: [
        "ICU favorable",
        "NIE/NIF",
        "Projet de déclaration responsable",
        "Rappel calendrier renouvellement 5 ans",
      ],
    },
    pitfalls: {
      en: "Host Registry does not auto-submit to Turisme GVA or your ayuntamiento. A regional number is not proof that municipal zoning or ICU conditions are met.",
      fr: "Host Registry ne dépose pas automatiquement auprès de Turisme GVA ni de la mairie. Un numéro régional ne prouve pas que le zonage municipal ou l'ICU est respecté.",
    },
    fieldHints: ["name", "address", "city", "propertyType", "residencyStatus"],
  },
  {
    key: `${cityKey}-es-official-registration`,
    title: {
      en: "Complete autoregistro in Registro de Turismo (you file)",
      fr: "Finaliser l'autoregistro au Registro de Turismo (vous déposez)",
    },
    instruction: {
      en: "Submit your declaración responsable through the Generalitat Valenciana autoregistro procedure and obtain your Registro Turismo inscription number for the dwelling. Validity is 5 years under current rules: note the expiry date. Enter the number in Host Registry when issued. Platforms verify regional numbers under EU 2024/1028, not NRUA.",
      fr: "Soumettez votre déclaration responsable via l'autoregistro de la Generalitat Valenciana et obtenez votre numéro d'inscription Registro de Turismo pour le logement. Validité 5 ans selon les règles actuelles : notez la date d'expiration. Saisissez le numéro dans Host Registry une fois délivré. Les plateformes vérifient les numéros régionaux au titre de l'UE 2024/1028, pas le NRUA.",
    },
    officialUrls: [
      {
        url: CV_VUT_REGISTER_PROCEDURE_URL,
        label: {
          en: "GVA autoregistro — VUT alta / modificación / cese",
          fr: "Autoregistro GVA — alta / modificación / cese VUT",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Issued Registro Turismo number", "Declaración responsable receipt"],
      fr: ["Numéro Registro de Turismo délivré", "Accusé déclaration responsable"],
    },
    fieldHints: ["address", "city"],
  },
  {
    key: `${cityKey}-es-store-registration`,
    title: {
      en: "Store Registro Turismo number in Host Registry",
      fr: "Enregistrer le numéro Registro de Turismo dans Host Registry",
    },
    instruction: {
      en: "Paste your Comunitat Valenciana Registro Turismo VUT number, set status to active, confirm license kind VUT, and record your 5-year renewal date in notes or dossier. Keep PDF receipts from the GVA procedure in your evidence pack.",
      fr: "Collez votre numéro VUT Registro de Turismo Communauté valencienne, passez le statut à actif, confirmez le type de licence VUT, et notez la date de renouvellement 5 ans. Conservez les PDF de la procédure GVA dans votre dossier preuve.",
    },
    officialUrls: [],
    documents: {
      en: ["Registro Turismo number", "Regional portal receipt (optional)"],
      fr: ["Numéro Registro de Turismo", "Accusé portail régional (optionnel)"],
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
      en: "Add your Registro Turismo VUT number to Airbnb, Booking.com, and other OTAs. Platforms validate regional numbers under EU 2024/1028. Mark listing display in Host Registry when done on each channel.",
      fr: "Ajoutez votre numéro VUT Registro de Turismo sur Airbnb, Booking.com et autres OTA. Les plateformes valident les numéros régionaux au titre de l'UE 2024/1028. Cochez l'affichage dans Host Registry une fois fait sur chaque canal.",
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
      en: "Comunitat Valenciana uses the national SES portal (RD 933/2021), not Mossos. Configure SOAP credentials in the Register tab, collect Annex I guest data via check-in link, then prepare and submit (or dry-run) from the guest stay. Host Registry does not replace your legal obligation to file on SES.",
      fr: "La Communauté valencienne utilise le portail SES national (RD 933/2021), pas les Mossos. Configurez les identifiants SOAP dans l'onglet Registre, collectez les données Annexe I via le lien check-in, puis préparez et soumettez (ou simulez) depuis le séjour. Host Registry ne remplace pas votre obligation de déposer sur SES.",
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
      en: "Do not submit Valencian guests to Mossos. Catalonia uses Mossos Hotels only.",
      fr: "Ne déclarez pas les voyageurs valenciens aux Mossos. La Catalogne utilise uniquement Mossos Hotels.",
    },
    fieldHints: ["name", "address", "city", "country"],
  },
];

const valenciaCapitalMunicipalStep: PlaybookStep = {
  key: "valencia-capital-municipal-icu",
  title: {
    en: "València city ICU and local rules (address-specific)",
    fr: "Valence ville : ICU et règles locales (selon adresse)",
  },
  instruction: {
    en: "València capital processes ICU and municipal tourism rules through Ajuntament de València channels. Zoning and building rules are address-specific: confirm ICU requirements and any local ordinances before listing. Host Registry tracks dossier checks only. We do not obtain ICU or auto-submit to the ayuntamiento.",
    fr: "Valence capitale traite l'ICU et les règles touristiques municipales via l'Ajuntament de València. Le zonage et le bâtiment dépendent de l'adresse : confirmez l'ICU et les ordonnances locales avant de publier. Host Registry suit les contrôles de dossier uniquement. Pas d'ICU ni de dépôt automatique en mairie.",
  },
  officialUrls: [
    {
      url: VALENCIA_CITY_TURISME_URL,
      label: {
        en: "Ajuntament de València — tourism",
        fr: "Ajuntament de València — tourisme",
      },
      role: "info",
      urlVerified: true,
    },
    {
      url: CV_VUT_FAQ_PDF_URL,
      label: {
        en: "Generalitat VUT FAQ (ICU reference)",
        fr: "FAQ VUT Generalitat (référence ICU)",
      },
      role: "rules",
      urlVerified: true,
    },
  ],
  documents: {
    en: [
      "Municipal ICU status",
      "Local ordinance checklist for your district",
    ],
    fr: [
      "Statut ICU municipal",
      "Checklist ordonnances locales pour votre quartier",
    ],
  },
  fieldHints: ["address", "city"],
};

export const SPAIN_VALENCIAN_COMMUNITY_PLAYBOOK: Playbook = {
  id: "es-valencian-community",
  country: "Spain",
  sourceReviewedAt: "2026-10-01",
  title: {
    en: "Comunitat Valenciana — VUT registration and SES guest reporting",
    fr: "Communauté valencienne — enregistrement VUT et déclaration SES",
  },
  description: {
    en: "Regional VUT (ICU, declaración responsable, 5-year Registro Turismo) after STS 620/2026, platform display under EU 2024/1028, and SES.HOSPEDAJES guest reporting (not Mossos).",
    fr: "VUT régional (ICU, déclaration responsable, Registro de Turismo 5 ans) post-STS 620/2026, affichage plateformes (UE 2024/1028) et déclaration SES.HOSPEDAJES (pas Mossos).",
  },
  steps: [
    ...valencianRegistrationSteps("valencian-region"),
    ...sesGuestSteps("valencian-region"),
  ],
};

export const SPAIN_VALENCIA_CAPITAL_PLAYBOOK: Playbook = {
  id: "es-valencia",
  country: "Spain",
  city: "Valencia",
  sourceReviewedAt: "2026-10-01",
  title: {
    en: "València — VUT, ICU, and SES",
    fr: "Valence — VUT, ICU et SES",
  },
  description: {
    en: "València capital and Comunitat Valenciana: municipal ICU, Registro Turismo VUT (5-year validity), platform display, and SES guest reporting. NRUA is not the listing number.",
    fr: "Valence capitale et Communauté valencienne : ICU municipal, VUT Registro de Turismo (validité 5 ans), affichage plateformes et déclaration SES. Le NRUA n'est pas le numéro d'annonce.",
  },
  steps: [
    ...valencianRegistrationSteps("valencia"),
    valenciaCapitalMunicipalStep,
    ...sesGuestSteps("valencia"),
  ],
};
