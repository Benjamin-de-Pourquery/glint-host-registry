import type { Playbook, PlaybookStep } from "./types";
import {
  ALLOGGIATI_PORTAL_URL,
  BDSR_PORTAL_URL,
  EU_1028_URL,
  ISTAT_ROSS1000_URL,
  MINISTERO_TURISMO_URL,
} from "@/lib/italy/official-links";

const itSteps = {
  cinBdsr: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-cin-bdsr`,
    title: {
      en: "Obtain CIN via BDSR (national listing code)",
      fr: "Obtenir le CIN via BDSR (code national d'annonce)",
    },
    instruction: {
      en: "From 20 May 2026, platforms verify your Codice Identificativo Nazionale (CIN) under Regulation (EU) 2024/1028 and may depublish non-compliant listings. Register on the Ministry of Tourism BDSR portal with SPID or CIE. The CIN is mandatory on all listings — separate from regional CIR/SCIA and from Alloggiati Web police reporting.",
      fr: "Depuis le 20 mai 2026, les plateformes vérifient votre Codice Identificativo Nazionale (CIN) au titre du règlement (UE) 2024/1028 et peuvent dépublier les annonces non conformes. Inscrivez-vous sur le portail BDSR du Ministère du Tourisme avec SPID ou CIE. Le CIN est obligatoire sur toutes les annonces — distinct du CIR/SCIA régional et de la déclaration police Alloggiati Web.",
    },
    officialUrls: [
      {
        url: BDSR_PORTAL_URL,
        label: {
          en: "BDSR — national STR register (CIN)",
          fr: "BDSR — registre national LCD (CIN)",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: MINISTERO_TURISMO_URL,
        label: {
          en: "Ministry of Tourism — CIN guidance",
          fr: "Ministère du Tourisme — orientations CIN",
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
        "SPID or CIE digital identity",
        "Codice fiscale",
        "Property cadastral data",
        "Proof of ownership or authorised management",
      ],
      fr: [
        "Identité numérique SPID ou CIE",
        "Codice fiscale",
        "Données cadastrales",
        "Justificatif de propriété ou gestion autorisée",
      ],
    },
    pitfalls: {
      en: "CIN ≠ CIR/SCIA ≠ Alloggiati. Fines up to €8,000 for missing CIN on listings. SPID is required for BDSR — plan ahead if you only have paper ID.",
      fr: "CIN ≠ CIR/SCIA ≠ Alloggiati. Amendes jusqu'à 8 000 € pour CIN manquant sur les annonces. SPID requis pour BDSR — anticipez si vous n'avez qu'une pièce papier.",
    },
    fieldHints: ["name", "address", "city", "country", "propertyType"],
  }),

  alloggiatiWeb: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-alloggiati-web`,
    title: {
      en: "Register on Alloggiati Web and submit guest schedules",
      fr: "S'inscrire sur Alloggiati Web et transmettre les schedine voyageurs",
    },
    instruction: {
      en: "Under TULPS art. 109, communicate each guest's schedule to Polizia di Stato within 24 hours of check-in via Alloggiati Web. Complete the establishment alta (first submission) on the portal, then file each schedina. Glint collects guest data via check-in link, validates fields, and prepares CSV/printable export — you submit manually on the official portal.",
      fr: "Au titre de l'art. 109 TULPS, communiquez la schedina de chaque voyageur à la Polizia di Stato sous 24h après l'arrivée via Alloggiati Web. Effectuez l'alta de l'établissement sur le portail, puis déposez chaque schedina. Glint collecte les données via le lien check-in, valide les champs et prépare l'export CSV/imprimable — vous soumettez manuellement sur le portail officiel.",
    },
    officialUrls: [
      {
        url: ALLOGGIATI_PORTAL_URL,
        label: {
          en: "Alloggiati Web portal (Polizia di Stato)",
          fr: "Portail Alloggiati Web (Polizia di Stato)",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Alloggiati Web credentials (questura enrollment)",
        "Guest ID document type and number",
        "Guest nationality, birth date and place",
        "Arrival date",
      ],
      fr: [
        "Identifiants Alloggiati Web (inscription questura)",
        "Type et numéro de document voyageur",
        "Nationalité, date et lieu de naissance",
        "Date d'arrivée",
      ],
    },
    timeline: {
      en: "Within 24 hours of each check-in.",
      fr: "Sous 24 heures après chaque arrivée.",
    },
    pitfalls: {
      en: "Alloggiati is separate from CIN/BDSR. Do not confuse the police schedina with the tourism CIN displayed on Airbnb. Children may require separate entries — check questura guidance.",
      fr: "Alloggiati est distinct du CIN/BDSR. Ne confondez pas la schedina police avec le CIN tourisme affiché sur Airbnb. Les enfants peuvent nécessiter des entrées séparées.",
    },
    fieldHints: ["name", "address", "city", "country"],
  }),

  istatMonthly: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-istat-monthly`,
    title: {
      en: "Monthly tourist flows — ISTAT / regional portal",
      fr: "Flux touristiques mensuels — ISTAT / portail régional",
    },
    instruction: {
      en: "Many regions require monthly tourist flow statistics (e.g. ROSS 1000, Sinfonia, regional equivalents). Glint tracks this as a monthly reminder — submit on your region's ISTAT or regional tourism portal. No automated API integration.",
      fr: "De nombreuses régions exigent des statistiques mensuelles de flux touristiques (ROSS 1000, Sinfonia, équivalents régionaux). Glint suit cela comme rappel mensuel — soumettez sur le portail ISTAT ou tourisme régional. Pas d'intégration API automatisée.",
    },
    officialUrls: [
      {
        url: ISTAT_ROSS1000_URL,
        label: {
          en: "ISTAT — verify regional ROSS 1000 / Sinfonia access",
          fr: "ISTAT — vérifier l'accès ROSS 1000 / Sinfonia régional",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: MINISTERO_TURISMO_URL,
        label: {
          en: "Ministry of Tourism — regional statistics links",
          fr: "Ministère du Tourisme — liens statistiques régionales",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Monthly guest nights count", "Nationality breakdown if required", "CIN or regional code"],
      fr: ["Nombre de nuitées mensuelles", "Répartition par nationalité si requis", "CIN ou code régional"],
    },
    fieldHints: ["address", "city", "country"],
  }),

  displayCinOnListings: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-cin`,
    title: {
      en: "Display CIN on all platform listings",
      fr: "Afficher le CIN sur toutes les annonces plateformes",
    },
    instruction: {
      en: "Add your CIN to Airbnb, Booking.com, Vrbo, and other channels. Under EU 2024/1028, platforms auto-verify from 20 May 2026. Use Glint Listings tab to track display status per channel.",
      fr: "Ajoutez votre CIN sur Airbnb, Booking.com, Vrbo et autres canaux. Au titre du règlement UE 2024/1028, les plateformes vérifient automatiquement depuis le 20 mai 2026. Utilisez l'onglet Annonces Glint pour suivre l'affichage par canal.",
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
        url: BDSR_PORTAL_URL,
        label: {
          en: "BDSR — retrieve your CIN",
          fr: "BDSR — récupérer votre CIN",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["CIN code from BDSR"],
      fr: ["Code CIN depuis BDSR"],
    },
    fieldHints: ["name", "notes"],
  }),

  municipalRules: (
    cityKey: string,
    cityName: { en: string; fr: string },
    municipalUrl: string,
    municipalVerified: boolean,
    extraInstruction?: { en: string; fr: string }
  ): PlaybookStep => ({
    key: `${cityKey}-municipal-rules`,
    title: {
      en: `${cityName.en} — municipal STR rules`,
      fr: `${cityName.fr} — règles LCD municipales`,
    },
    instruction: extraInstruction ?? {
      en: `Check ${cityName.en} municipal caps, zoning, SCIA/CIR requirements, and tourist tax (imposta di soggiorno). Rules change frequently — verify on the official comune portal.`,
      fr: `Vérifiez les plafonds municipaux, zonage, exigences SCIA/CIR et taxe de séjour (imposta di soggiorno) à ${cityName.fr}. Les règles changent souvent — vérifiez sur le portail officiel de la commune.`,
    },
    officialUrls: [
      {
        url: municipalUrl,
        label: {
          en: `${cityName.en} — official tourism / STR page`,
          fr: `${cityName.fr} — page officielle tourisme / LCD`,
        },
        role: "rules",
        urlVerified: municipalVerified,
      },
    ],
    documents: {
      en: ["Property address", "Co-ownership rules (regolamento condominiale) if applicable"],
      fr: ["Adresse du bien", "Règlement de copropriété le cas échéant"],
    },
    fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
  }),
};

export const ITALY_GENERIC_PLAYBOOK: Playbook = {
  id: "it-generic",
  country: "Italy",
  sourceReviewedAt: "2026-09-16",
  title: {
    en: "Italy — CIN, Alloggiati Web & regional STR",
    fr: "Italie — CIN, Alloggiati Web et LCD régionale",
  },
  description: {
    en: "National guide for Italian short-term rentals: BDSR CIN (platform compliance), Alloggiati Web police schedules (24h), ISTAT monthly flows, and regional CIR/SCIA where applicable.",
    fr: "Guide national pour les locations courte durée en Italie : CIN BDSR (conformité plateformes), schedine police Alloggiati Web (24h), flux ISTAT mensuels et CIR/SCIA régional le cas échéant.",
  },
  steps: [
    itSteps.municipalRules(
      "it",
      { en: "Italy", fr: "Italie" },
      MINISTERO_TURISMO_URL,
      true,
      {
        en: "Italian STR rules vary by region and comune. Confirm whether your property needs SCIA, regional CIR, or municipal registration in addition to the national CIN.",
        fr: "Les règles LCD italiennes varient par région et commune. Confirmez si votre bien nécessite une SCIA, un CIR régional ou un enregistrement municipal en plus du CIN national.",
      }
    ),
    itSteps.cinBdsr("it"),
    itSteps.alloggiatiWeb("it"),
    itSteps.istatMonthly("it"),
    itSteps.displayCinOnListings("it"),
  ],
};

export const ITALY_ROMA_PLAYBOOK: Playbook = {
  id: "it-roma",
  country: "Italy",
  city: "Roma",
  sourceReviewedAt: "2026-09-16",
  title: {
    en: "Rome — CIN, Alloggiati & municipal STR",
    fr: "Rome — CIN, Alloggiati et LCD municipale",
  },
  description: {
    en: "Rome (Lazio) short-term rental compliance: municipal tourist-rental rules, BDSR CIN, Alloggiati Web within 24h, and ISTAT Lazio flows.",
    fr: "Conformité LCD à Rome (Latium) : règles municipales, CIN BDSR, Alloggiati Web sous 24h et flux ISTAT Latium.",
  },
  steps: [
    itSteps.municipalRules(
      "roma",
      { en: "Rome", fr: "Rome" },
      "https://www.comune.roma.it/turismo",
      true,
      {
        en: "Rome applies municipal caps and zoning for affitti brevi. Verify current limits, SCIA requirements, and imposta di soggiorno on the official Comune di Roma tourism page before listing.",
        fr: "Rome applique des plafonds et zonages pour les affitti brevi. Vérifiez les limites, SCIA et imposta di soggiorno sur la page tourisme officielle du Comune di Roma.",
      }
    ),
    itSteps.cinBdsr("roma"),
    itSteps.alloggiatiWeb("roma"),
    itSteps.istatMonthly("roma"),
    itSteps.displayCinOnListings("roma"),
  ],
};

export const ITALY_MILANO_PLAYBOOK: Playbook = {
  id: "it-milano",
  country: "Italy",
  city: "Milano",
  sourceReviewedAt: "2026-09-16",
  title: {
    en: "Milan — CIN, Alloggiati & Lombardy rules",
    fr: "Milan — CIN, Alloggiati et règles Lombardie",
  },
  description: {
    en: "Milan (Lombardy) STR compliance: Comune di Milano registration zones, BDSR CIN, Alloggiati Web, and regional statistics.",
    fr: "Conformité LCD à Milan (Lombardie) : zones d'enregistrement, CIN BDSR, Alloggiati Web et statistiques régionales.",
  },
  steps: [
    itSteps.municipalRules(
      "milano",
      { en: "Milan", fr: "Milan" },
      "https://www.comune.milano.it/turismo",
      false,
      {
        en: "Milan enforces strict short-term rental zones and registration. Check Comune di Milano tourism pages for current affitti brevi rules, CIR Lombardia, and tourist tax.",
        fr: "Milan applique des zones LCD strictes. Consultez les pages tourisme du Comune di Milano pour les règles affitti brevi, CIR Lombardia et taxe de séjour.",
      }
    ),
    itSteps.cinBdsr("milano"),
    itSteps.alloggiatiWeb("milano"),
    itSteps.istatMonthly("milano"),
    itSteps.displayCinOnListings("milano"),
  ],
};

export const ITALY_FIRENZE_PLAYBOOK: Playbook = {
  id: "it-firenze",
  country: "Italy",
  city: "Firenze",
  sourceReviewedAt: "2026-09-16",
  title: {
    en: "Florence — CIN, Alloggiati & Tuscany rules",
    fr: "Florence — CIN, Alloggiati et règles Toscane",
  },
  description: {
    en: "Florence (Tuscany) STR compliance: historic-centre restrictions, BDSR CIN, Alloggiati Web, and regional tourist flows.",
    fr: "Conformité LCD à Florence (Toscane) : restrictions centre historique, CIN BDSR, Alloggiati Web et flux touristiques régionaux.",
  },
  steps: [
    itSteps.municipalRules(
      "firenze",
      { en: "Florence", fr: "Florence" },
      "https://www.comune.fi.it/turismo",
      true,
      {
        en: "Florence has specific rules for the historic centre and UNESCO zone. Verify Comune di Firenze affitti brevi requirements, regional CIR Toscana, and imposta di soggiorno.",
        fr: "Florence a des règles spécifiques pour le centre historique et la zone UNESCO. Vérifiez les exigences affitti brevi, CIR Toscana et imposta di soggiorno.",
      }
    ),
    itSteps.cinBdsr("firenze"),
    itSteps.alloggiatiWeb("firenze"),
    itSteps.istatMonthly("firenze"),
    itSteps.displayCinOnListings("firenze"),
  ],
};

export const ITALY_VENEZIA_PLAYBOOK: Playbook = {
  id: "it-venezia",
  country: "Italy",
  city: "Venezia",
  sourceReviewedAt: "2026-09-16",
  title: {
    en: "Venice — CIN, Alloggiati & lagoon rules",
    fr: "Venise — CIN, Alloggiati et règles lagunaires",
  },
  description: {
    en: "Venice STR compliance: lagoon municipal caps, BDSR CIN, Alloggiati Web within 24h, and Veneto regional requirements.",
    fr: "Conformité LCD à Venise : plafonds municipaux lagunaires, CIN BDSR, Alloggiati Web sous 24h et exigences Vénétie.",
  },
  steps: [
    itSteps.municipalRules(
      "venezia",
      { en: "Venice", fr: "Venise" },
      "https://www.comune.venezia.it/turismo",
      true,
      {
        en: "Venice applies strict caps on tourist rentals in the lagoon. Check Comune di Venezia for current affitti brevi limits, CIR Veneto, and entry-fee/tourist tax rules.",
        fr: "Venise applique des plafonds stricts sur les locations touristiques dans la lagune. Consultez le Comune di Venezia pour les limites affitti brevi et CIR Veneto.",
      }
    ),
    itSteps.cinBdsr("venezia"),
    itSteps.alloggiatiWeb("venezia"),
    itSteps.istatMonthly("venezia"),
    itSteps.displayCinOnListings("venezia"),
  ],
};

export const ITALY_PLAYBOOKS: Playbook[] = [
  ITALY_ROMA_PLAYBOOK,
  ITALY_MILANO_PLAYBOOK,
  ITALY_FIRENZE_PLAYBOOK,
  ITALY_VENEZIA_PLAYBOOK,
  ITALY_GENERIC_PLAYBOOK,
];
