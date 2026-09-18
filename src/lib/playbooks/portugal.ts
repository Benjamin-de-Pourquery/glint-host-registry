import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  SIBA_FAQ_URL,
  SIBA_PORTAL_URL,
  TURISMO_PORTUGAL_URL,
} from "@/lib/portugal/official-links";

const ptSteps = {
  rnalRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-rnal-registration`,
    title: {
      en: "Obtain RNAL (Alojamento Local registration)",
      fr: "Obtenir le RNAL (enregistrement Alojamento Local)",
    },
    instruction: {
      en: "Register your short-term rental with Turismo de Portugal and your municipality (comunicação prévia). You receive a Registo Nacional de Alojamento Local (RNAL) number. From 20 May 2026, platforms verify RNAL under Regulation (EU) 2024/1028 and may depublish non-compliant listings.",
      fr: "Enregistrez votre location de courte durée auprès de Turismo de Portugal et de votre municipalité (comunicação prévia). Vous recevez un numéro RNAL. Depuis le 20 mai 2026, les plateformes vérifient le RNAL au titre du règlement (UE) 2024/1028.",
    },
    officialUrls: [
      {
        url: TURISMO_PORTUGAL_URL,
        label: {
          en: "Turismo de Portugal — Alojamento Local",
          fr: "Turismo de Portugal — Alojamento Local",
        },
        role: "portal",
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
        "Property ownership or management proof",
        "Municipal prior communication (comunicação prévia)",
        "RNAL registration confirmation",
      ],
      fr: [
        "Justificatif de propriété ou gestion",
        "Communication préalable municipale",
        "Confirmation d'enregistrement RNAL",
      ],
    },
    pitfalls: {
      en: "RNAL ≠ SIBA. RNAL is your listing registration; SIBA is foreign-guest police reporting. Fines apply for missing RNAL on platforms.",
      fr: "RNAL ≠ SIBA. Le RNAL est l'enregistrement de l'annonce ; SIBA est la déclaration police des voyageurs étrangers.",
    },
    fieldHints: ["name", "address", "city", "country", "propertyType"],
  }),

  displayRnalOnListings: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-rnal`,
    title: {
      en: "Display RNAL on all platform listings",
      fr: "Afficher le RNAL sur toutes les annonces",
    },
    instruction: {
      en: "Add your RNAL number to Airbnb, Booking.com, and other OTAs. Platforms verify registration numbers under EU 2024/1028 from May 2026.",
      fr: "Ajoutez votre numéro RNAL sur Airbnb, Booking.com et autres OTA. Les plateformes vérifient les numéros d'enregistrement depuis mai 2026.",
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
      en: ["RNAL number from Turismo de Portugal registration"],
      fr: ["Numéro RNAL issu de l'enregistrement Turismo de Portugal"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  sibaGuestReporting: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-siba-guest-reporting`,
    title: {
      en: "Register on SIBA and submit Boletim de Alojamento",
      fr: "S'inscrire sur SIBA et transmettre le Boletim de Alojamento",
    },
    instruction: {
      en: "Hosts who lodge foreign guests for pay must register the establishment on SIBA (SSI/UCFE) and submit a Boletim de Alojamento for each foreign guest arrival AND departure within 3 working days (dias úteis). Portuguese nationals are not reported to SIBA. Glint collects guest data via check-in link, validates fields, and prepares CSV/printable export — you submit manually on the official portal.",
      fr: "Les hôtes accueillant des voyageurs étrangers doivent enregistrer l'établissement sur SIBA et transmettre un Boletim de Alojamento pour chaque arrivée ET départ de voyageur étranger sous 3 jours ouvrés. Les ressortissants portugais ne sont pas déclarés. Glint collecte les données, valide et prépare l'export — vous soumettez manuellement sur le portail officiel.",
    },
    officialUrls: [
      {
        url: SIBA_PORTAL_URL,
        label: {
          en: "SIBA portal (SSI / UCFE)",
          fr: "Portail SIBA (SSI / UCFE)",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: SIBA_FAQ_URL,
        label: {
          en: "SIBA FAQ — official guidance",
          fr: "FAQ SIBA — orientations officielles",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "SIBA establishment registration",
        "Foreign guest identity document type and number",
        "Guest nationality (not Portuguese), sex, birth date/place",
        "Arrival and departure dates",
      ],
      fr: [
        "Enregistrement établissement SIBA",
        "Type et numéro de document voyageur étranger",
        "Nationalité (non portugaise), sexe, date/lieu de naissance",
        "Dates d'arrivée et de départ",
      ],
    },
    timeline: {
      en: "Within 3 working days of each foreign guest arrival and departure.",
      fr: "Sous 3 jours ouvrés après chaque arrivée et départ de voyageur étranger.",
    },
    pitfalls: {
      en: "SIBA is separate from RNAL. Fines €100–€2,000 for late/missing communication (Lei 23/2007 art. 203). Glint does not submit to SIBA — you remain responsible.",
      fr: "SIBA est distinct du RNAL. Amendes 100–2 000 € pour communication tardive (Lei 23/2007 art. 203). Glint ne soumet pas au SIBA.",
    },
    fieldHints: ["name", "address", "city", "country"],
  }),

  touristTax: (
    cityKey: string,
    cityLabel: { en: string; fr: string },
    municipalUrl: string,
    urlVerified: boolean
  ): PlaybookStep => ({
    key: `${cityKey}-tourist-tax`,
    title: {
      en: `Tourist tax (taxa turística) — ${cityLabel.en}`,
      fr: `Taxe de séjour (taxa turística) — ${cityLabel.fr}`,
    },
    instruction: {
      en: "Many Portuguese municipalities charge a nightly tourist tax (taxa municipal turística). Register with your Câmara Municipal, collect from guests, and remit per local rules.",
      fr: "De nombreuses municipalités portugaises prélèvent une taxe de séjour nocturne. Inscrivez-vous auprès de votre Câmara Municipal et reversez selon les règles locales.",
    },
    officialUrls: [
      {
        url: municipalUrl,
        label: {
          en: `${cityLabel.en} municipal tourism portal`,
          fr: `Portail tourisme municipal ${cityLabel.fr}`,
        },
        role: "tax",
        urlVerified,
      },
    ],
    timeline: {
      en: "Per stay — check municipal rates and collection method.",
      fr: "Par séjour — vérifiez les tarifs et modalités municipales.",
    },
    documents: {
      en: ["Municipal tourist tax registration", "Guest collection records"],
      fr: ["Inscription taxe de séjour municipale", "Justificatifs de perception"],
    },
    fieldHints: ["city", "address"],
  }),

  municipalRules: (
    cityKey: string,
    cityLabel: { en: string; fr: string },
    municipalUrl: string,
    urlVerified: boolean,
    customInstruction?: { en: string; fr: string }
  ): PlaybookStep => ({
    key: `${cityKey}-municipal-rules`,
    title: {
      en: `Municipal AL rules — ${cityLabel.en}`,
      fr: `Règles municipales AL — ${cityLabel.fr}`,
    },
    instruction: customInstruction ?? {
      en: `Check ${cityLabel.en} Câmara Municipal rules for Alojamento Local: zoning, caps, and comunicação prévia requirements.`,
      fr: `Consultez les règles de la Câmara Municipal de ${cityLabel.fr} pour l'Alojamento Local : zonage, plafonds et comunicação prévia.`,
    },
    officialUrls: [
      {
        url: municipalUrl,
        label: {
          en: `${cityLabel.en} municipal portal`,
          fr: `Portail municipal ${cityLabel.fr}`,
        },
        role: "info",
        urlVerified,
      },
    ],
    documents: {
      en: ["Municipal comunicação prévia confirmation", "Property address proof"],
      fr: ["Confirmation comunicação prévia municipale", "Justificatif d'adresse"],
    },
    fieldHints: ["address", "city"],
  }),
};

export const PORTUGAL_GENERIC_PLAYBOOK: Playbook = {
  id: "pt-generic",
  country: "Portugal",
  sourceReviewedAt: "2026-09-18",
  title: {
    en: "Portugal — RNAL & SIBA compliance",
    fr: "Portugal — conformité RNAL et SIBA",
  },
  description: {
    en: "National Portugal STR compliance: RNAL registration, SIBA foreign-guest reporting, and municipal tourist tax.",
    fr: "Conformité LCD Portugal : enregistrement RNAL, déclaration SIBA voyageurs étrangers et taxe de séjour municipale.",
  },
  steps: [
    ptSteps.rnalRegistration("pt"),
    ptSteps.displayRnalOnListings("pt"),
    ptSteps.sibaGuestReporting("pt"),
    ptSteps.touristTax("pt", { en: "Portugal", fr: "Portugal" }, TURISMO_PORTUGAL_URL, true),
  ],
};

export const PORTUGAL_LISBOA_PLAYBOOK: Playbook = {
  id: "pt-lisboa",
  country: "Portugal",
  city: "Lisboa",
  sourceReviewedAt: "2026-09-18",
  title: {
    en: "Lisbon — RNAL, SIBA & municipal rules",
    fr: "Lisbonne — RNAL, SIBA et règles municipales",
  },
  description: {
    en: "Lisbon Alojamento Local: RNAL registration, SIBA boletim for foreign guests, and Câmara Municipal tourist tax.",
    fr: "Alojamento Local à Lisbonne : RNAL, boletim SIBA pour voyageurs étrangers et taxe municipale.",
  },
  steps: [
    ptSteps.municipalRules(
      "lisboa",
      { en: "Lisbon", fr: "Lisbonne" },
      "https://www.cm-lisboa.pt/",
      false,
      {
        en: "Lisbon applies specific Alojamento Local rules in certain zones. Check Câmara Municipal de Lisboa for comunicação prévia, caps, and taxa municipal turística.",
        fr: "Lisbonne applique des règles AL spécifiques dans certaines zones. Consultez la Câmara Municipal de Lisboa.",
      }
    ),
    ptSteps.rnalRegistration("lisboa"),
    ptSteps.displayRnalOnListings("lisboa"),
    ptSteps.sibaGuestReporting("lisboa"),
    ptSteps.touristTax("lisboa", { en: "Lisbon", fr: "Lisbonne" }, "https://www.cm-lisboa.pt/", false),
  ],
};

export const PORTUGAL_PORTO_PLAYBOOK: Playbook = {
  id: "pt-porto",
  country: "Portugal",
  city: "Porto",
  sourceReviewedAt: "2026-09-18",
  title: {
    en: "Porto — RNAL, SIBA & municipal rules",
    fr: "Porto — RNAL, SIBA et règles municipales",
  },
  description: {
    en: "Porto Alojamento Local compliance: RNAL, SIBA foreign-guest reporting, and municipal tourist tax.",
    fr: "Conformité AL à Porto : RNAL, SIBA et taxe de séjour municipale.",
  },
  steps: [
    ptSteps.municipalRules(
      "porto",
      { en: "Porto", fr: "Porto" },
      "https://www.cm-porto.pt/",
      true
    ),
    ptSteps.rnalRegistration("porto"),
    ptSteps.displayRnalOnListings("porto"),
    ptSteps.sibaGuestReporting("porto"),
    ptSteps.touristTax("porto", { en: "Porto", fr: "Porto" }, "https://www.cm-porto.pt/", true),
  ],
};

export const PORTUGAL_FARO_PLAYBOOK: Playbook = {
  id: "pt-faro",
  country: "Portugal",
  city: "Faro",
  sourceReviewedAt: "2026-09-18",
  title: {
    en: "Faro / Algarve — RNAL, SIBA & tourist tax",
    fr: "Faro / Algarve — RNAL, SIBA et taxe de séjour",
  },
  description: {
    en: "Algarve STR compliance centred on Faro: RNAL, SIBA boletim, and regional tourist tax rules.",
    fr: "Conformité LCD Algarve (Faro) : RNAL, boletim SIBA et taxe de séjour régionale.",
  },
  steps: [
    ptSteps.municipalRules(
      "faro",
      { en: "Faro", fr: "Faro" },
      "https://www.cm-faro.pt/",
      true
    ),
    ptSteps.rnalRegistration("faro"),
    ptSteps.displayRnalOnListings("faro"),
    ptSteps.sibaGuestReporting("faro"),
    ptSteps.touristTax("faro", { en: "Faro / Algarve", fr: "Faro / Algarve" }, "https://www.cm-faro.pt/", true),
  ],
};

export const PORTUGAL_FUNCHAL_PLAYBOOK: Playbook = {
  id: "pt-funchal",
  country: "Portugal",
  city: "Funchal",
  sourceReviewedAt: "2026-09-18",
  title: {
    en: "Funchal / Madeira — RNAL, SIBA & island rules",
    fr: "Funchal / Madère — RNAL, SIBA et règles insulaires",
  },
  description: {
    en: "Madeira (Funchal) Alojamento Local: RNAL, SIBA foreign-guest reporting, and regional municipal requirements.",
    fr: "Alojamento Local à Funchal (Madère) : RNAL, SIBA et exigences municipales régionales.",
  },
  steps: [
    ptSteps.municipalRules(
      "funchal",
      { en: "Funchal", fr: "Funchal" },
      "https://www.cm-funchal.pt/",
      false,
      {
        en: "Madeira has regional tourism rules. Check Câmara Municipal do Funchal for Alojamento Local requirements and taxa municipal turística.",
        fr: "Madère a des règles touristiques régionales. Consultez la Câmara Municipal do Funchal.",
      }
    ),
    ptSteps.rnalRegistration("funchal"),
    ptSteps.displayRnalOnListings("funchal"),
    ptSteps.sibaGuestReporting("funchal"),
    ptSteps.touristTax("funchal", { en: "Funchal", fr: "Funchal" }, "https://www.cm-funchal.pt/", false),
  ],
};

export const PORTUGAL_PLAYBOOKS: Playbook[] = [
  PORTUGAL_LISBOA_PLAYBOOK,
  PORTUGAL_PORTO_PLAYBOOK,
  PORTUGAL_FARO_PLAYBOOK,
  PORTUGAL_FUNCHAL_PLAYBOOK,
  PORTUGAL_GENERIC_PLAYBOOK,
];
