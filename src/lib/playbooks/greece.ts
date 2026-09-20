import type { Playbook, PlaybookStep } from "./types";
import {
  AADE_SHORT_TERM_HUB_URL,
  EU_1028_URL,
  MYAADE_URL,
} from "@/lib/greece/official-links";

const grSteps = {
  amaRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ama-registration`,
    title: {
      en: "Register property in AADE registry and obtain AMA",
      fr: "Enregistrer le bien au registre AADE et obtenir l'AMA",
    },
    instruction: {
      en: "Register each short-term rental unit in the AADE Short-Term Stay Property Registry (Μητρώο Ακινήτων Βραχυχρόνιας Διαμονής) via myAADE. You receive an AMA (Αριθμός Μητρώου Ακινήτου / Property Registration Number). Licensed tourist accommodations may use an ESL or Unique Notification Number instead. From 20 May 2026, platforms verify registration numbers under Regulation (EU) 2024/1028.",
      fr: "Enregistrez chaque unité de location de courte durée au registre AADE des biens en location de courte durée via myAADE. Vous recevez un AMA (numéro d'enregistrement du bien). Les hébergements touristiques agréés peuvent utiliser un numéro ESL ou de notification unique. Depuis le 20 mai 2026, les plateformes vérifient les numéros au titre du règlement (UE) 2024/1028.",
    },
    officialUrls: [
      {
        url: AADE_SHORT_TERM_HUB_URL,
        label: {
          en: "AADE — Short-term rental hub",
          fr: "AADE — Location de courte durée",
        },
        role: "portal",
        urlVerified: false,
      },
      {
        url: MYAADE_URL,
        label: {
          en: "myAADE portal",
          fr: "Portail myAADE",
        },
        role: "portal",
        urlVerified: false,
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
        "ATAK (property tax ID) if available",
        "AMA registration confirmation from myAADE",
      ],
      fr: [
        "Justificatif de propriété ou gestion",
        "ATAK (identifiant fiscal du bien) si disponible",
        "Confirmation d'enregistrement AMA via myAADE",
      ],
    },
    pitfalls: {
      en: "AMA ≠ AADE stay declaration. AMA is your listing registration; the Short-Term Stay Declaration is a separate monthly obligation per stay. Missing AMA on listings is commonly cited at €5,000.",
      fr: "AMA ≠ déclaration de séjour AADE. L'AMA est l'enregistrement de l'annonce ; la déclaration de séjour est une obligation distincte par séjour. L'absence d'AMA sur les annonces expose à des amendes (souvent citées à 5 000 €).",
    },
    fieldHints: ["name", "address", "city", "country", "propertyType"],
  }),

  displayAmaOnListings: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-ama`,
    title: {
      en: "Display AMA (or ESL) on all platform listings",
      fr: "Afficher l'AMA (ou ESL) sur toutes les annonces",
    },
    instruction: {
      en: "Add your AMA number to Airbnb, Booking.com, and other OTAs. Platforms verify registration numbers under EU 2024/1028 from May 2026. Licensed tourist accommodations may display ESL / Unique Notification Number instead.",
      fr: "Ajoutez votre numéro AMA sur Airbnb, Booking.com et autres OTA. Les plateformes vérifient les numéros d'enregistrement depuis mai 2026. Les hébergements touristiques agréés peuvent afficher un numéro ESL ou de notification unique.",
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
      en: ["AMA number from AADE registry (or ESL / Unique Notification for licensed tourist accommodation)"],
      fr: ["Numéro AMA du registre AADE (ou ESL / notification unique pour hébergement touristique agréé)"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  propertySafetyNote: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-property-safety`,
    title: {
      en: "Property safety and ops requirements (guidance)",
      fr: "Exigences sécurité et exploitation du bien (orientation)",
    },
    instruction: {
      en: "From October 2025, Greece applies updated short-term rental property safety and operational requirements (fire safety, equipment, guest information). Review AADE guidance and municipal rules for your property type. This step is operational guidance only — not a Glint checklist engine.",
      fr: "Depuis octobre 2025, la Grèce applique des exigences actualisées de sécurité et d'exploitation pour les locations de courte durée. Consultez les orientations AADE et les règles municipales. Étape d'orientation uniquement — pas un moteur de conformité Glint.",
    },
    officialUrls: [
      {
        url: AADE_SHORT_TERM_HUB_URL,
        label: {
          en: "AADE short-term rental guidance",
          fr: "Orientations AADE location courte durée",
        },
        role: "info",
        urlVerified: false,
      },
    ],
    documents: {
      en: ["Fire safety equipment checklist", "Guest information sheet", "Emergency contact details"],
      fr: ["Liste équipements sécurité incendie", "Fiche informations voyageurs", "Contacts d'urgence"],
    },
    fieldHints: ["address", "city"],
  }),

  aadeStayDeclaration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-aade-stay-declaration`,
    title: {
      en: "Submit Short-Term Stay Declaration (Δήλωση Βραχυχρόνιας Διαμονής)",
      fr: "Soumettre la déclaration de séjour de courte durée (AADE)",
    },
    instruction: {
      en: "For each short-term stay (≤59 nights), submit the AADE Short-Term Stay Declaration by the 20th of the month following guest departure (e.g. checkout 15 Jul → declare by 20 Aug). Stays of 60+ nights use the long-term lease declaration path instead. Glint collects guest data, validates fields, and prepares CSV/printable export — you submit manually on myAADE.",
      fr: "Pour chaque séjour de courte durée (≤59 nuits), soumettez la déclaration AADE avant le 20 du mois suivant le départ (ex. départ 15 juil. → déclaration avant le 20 août). Les séjours de 60+ nuits suivent la déclaration de bail longue durée. Glint collecte les données, valide et prépare l'export — vous soumettez manuellement sur myAADE.",
    },
    officialUrls: [
      {
        url: AADE_SHORT_TERM_HUB_URL,
        label: {
          en: "AADE short-term rental hub",
          fr: "AADE — location courte durée",
        },
        role: "portal",
        urlVerified: false,
      },
      {
        url: MYAADE_URL,
        label: {
          en: "myAADE — submit declaration",
          fr: "myAADE — soumettre la déclaration",
        },
        role: "form",
        urlVerified: false,
      },
    ],
    documents: {
      en: [
        "AMA number for the property",
        "Guest identity document type and number",
        "Guest nationality, sex, birth date/place",
        "Arrival and departure dates (check-in inclusive, check-out exclusive)",
      ],
      fr: [
        "Numéro AMA du bien",
        "Type et numéro de document voyageur",
        "Nationalité, sexe, date/lieu de naissance",
        "Dates d'arrivée et de départ",
      ],
    },
    timeline: {
      en: "By the 20th of the calendar month after guest departure (short-term stays ≤59 nights).",
      fr: "Avant le 20 du mois calendaire suivant le départ (séjours ≤59 nuits).",
    },
    pitfalls: {
      en: "AADE stay declaration is separate from AMA listing registration. Glint does not submit to AADE — you remain responsible. 60+ night stays require the long-term lease declaration path.",
      fr: "La déclaration de séjour AADE est distincte de l'enregistrement AMA. Glint ne soumet pas à l'AADE. Les séjours de 60+ nuits suivent la déclaration de bail longue durée.",
    },
    fieldHints: ["name", "address", "city", "country"],
  }),

  climateFeeNote: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-climate-fee`,
    title: {
      en: "Climate Crisis Resilience Fee reminder (ops note)",
      fr: "Rappel redevance résilience climatique (note ops)",
    },
    instruction: {
      en: "Greece applies a Climate Crisis Resilience Fee (formerly overnight stay tax) collected from guests. Register with AADE, display rates to guests, and remit per official rules. Glint does not calculate or file this tax — operational reminder only.",
      fr: "La Grèce applique une redevance de résilience climatique perçue auprès des voyageurs. Inscrivez-vous auprès de l'AADE et reversez selon les règles officielles. Glint ne calcule ni ne déclare cette taxe — rappel opérationnel uniquement.",
    },
    officialUrls: [
      {
        url: AADE_SHORT_TERM_HUB_URL,
        label: {
          en: "AADE — fees and obligations",
          fr: "AADE — redevances et obligations",
        },
        role: "tax",
        urlVerified: false,
      },
    ],
    documents: {
      en: ["AADE fee registration", "Guest collection records"],
      fr: ["Inscription redevance AADE", "Justificatifs de perception"],
    },
    fieldHints: ["city", "address"],
  }),

  municipalRestrictions: (
    cityKey: string,
    cityLabel: { en: string; fr: string },
    customPitfalls: { en: string; fr: string }
  ): PlaybookStep => ({
    key: `${cityKey}-municipal-restrictions`,
    title: {
      en: `Municipal registration restrictions — ${cityLabel.en}`,
      fr: `Restrictions municipales d'enregistrement — ${cityLabel.fr}`,
    },
    instruction: {
      en: `Check ${cityLabel.en} municipal rules for new short-term rental registrations. From 2026, several municipalities apply phased restrictions on first-time AMA registrations in certain zones. Guidance only — not legal advice.`,
      fr: `Consultez les règles municipales de ${cityLabel.fr} pour les nouveaux enregistrements de location de courte durée. Depuis 2026, plusieurs municipalités appliquent des restrictions par phases. Orientation uniquement — pas un conseil juridique.`,
    },
    officialUrls: [
      {
        url: AADE_SHORT_TERM_HUB_URL,
        label: {
          en: "AADE municipal guidance",
          fr: "Orientations AADE municipales",
        },
        role: "info",
        urlVerified: false,
      },
    ],
    pitfalls: customPitfalls,
    documents: {
      en: ["Municipal registration guidance", "Property address proof"],
      fr: ["Orientations municipales", "Justificatif d'adresse"],
    },
    fieldHints: ["address", "city"],
  }),
};

export const GREECE_GENERIC_PLAYBOOK: Playbook = {
  id: "gr-generic",
  country: "Greece",
  sourceReviewedAt: "2026-09-20",
  title: {
    en: "Greece — AMA & AADE compliance",
    fr: "Grèce — conformité AMA et AADE",
  },
  description: {
    en: "National Greece STR compliance: AADE AMA registration, stay declarations, and operational reminders.",
    fr: "Conformité LCD Grèce : enregistrement AMA AADE, déclarations de séjour et rappels opérationnels.",
  },
  steps: [
    grSteps.amaRegistration("gr"),
    grSteps.displayAmaOnListings("gr"),
    grSteps.propertySafetyNote("gr"),
    grSteps.aadeStayDeclaration("gr"),
    grSteps.climateFeeNote("gr"),
  ],
};

export const GREECE_ATHINA_PLAYBOOK: Playbook = {
  id: "gr-athina",
  country: "Greece",
  city: "Athina",
  sourceReviewedAt: "2026-09-20",
  title: {
    en: "Athens — AMA, AADE & municipal restrictions",
    fr: "Athènes — AMA, AADE et restrictions municipales",
  },
  description: {
    en: "Athens short-term rental: AADE AMA registration, monthly stay declarations, and 2026 municipal zone restrictions.",
    fr: "Location courte durée à Athènes : AMA AADE, déclarations mensuelles et restrictions municipales 2026.",
  },
  steps: [
    grSteps.municipalRestrictions(
      "athina",
      { en: "Athens", fr: "Athènes" },
      {
        en: "Athens applies registration restrictions in certain municipal zones from 2026. New first-time AMA registrations may be paused or limited in restricted areas — verify with the City of Athens and AADE before listing.",
        fr: "Athènes applique des restrictions d'enregistrement dans certaines zones municipales depuis 2026. Les nouveaux enregistrements AMA peuvent être limités — vérifiez auprès de la municipalité et de l'AADE.",
      }
    ),
    grSteps.amaRegistration("athina"),
    grSteps.displayAmaOnListings("athina"),
    grSteps.propertySafetyNote("athina"),
    grSteps.aadeStayDeclaration("athina"),
    grSteps.climateFeeNote("athina"),
  ],
};

export const GREECE_THESSALONIKI_PLAYBOOK: Playbook = {
  id: "gr-thessaloniki",
  country: "Greece",
  city: "Thessaloniki",
  sourceReviewedAt: "2026-09-20",
  title: {
    en: "Thessaloniki — AMA, AADE & municipal rules",
    fr: "Thessalonique — AMA, AADE et règles municipales",
  },
  description: {
    en: "Thessaloniki STR compliance: AMA registration, AADE stay declarations, and 2026 municipal community restrictions.",
    fr: "Conformité LCD Thessalonique : AMA, déclarations AADE et restrictions communales 2026.",
  },
  steps: [
    grSteps.municipalRestrictions(
      "thessaloniki",
      { en: "Thessaloniki", fr: "Thessalonique" },
      {
        en: "Thessaloniki 1st municipal community: new first-time AMA registrations restricted Jul–Dec 2026 (guidance only). Check municipal announcements before registering.",
        fr: "1ère communauté municipale de Thessalonique : nouveaux enregistrements AMA limités juil.–déc. 2026 (orientation). Consultez les annonces municipales.",
      }
    ),
    grSteps.amaRegistration("thessaloniki"),
    grSteps.displayAmaOnListings("thessaloniki"),
    grSteps.propertySafetyNote("thessaloniki"),
    grSteps.aadeStayDeclaration("thessaloniki"),
    grSteps.climateFeeNote("thessaloniki"),
  ],
};

export const GREECE_HERAKLION_PLAYBOOK: Playbook = {
  id: "gr-heraklion",
  country: "Greece",
  city: "Heraklion",
  sourceReviewedAt: "2026-09-20",
  title: {
    en: "Heraklion / Crete — AMA & AADE",
    fr: "Héraklion / Crète — AMA et AADE",
  },
  description: {
    en: "Crete (Heraklion) short-term rental: AADE AMA registration and monthly stay declarations.",
    fr: "Location courte durée en Crète (Héraklion) : AMA AADE et déclarations mensuelles.",
  },
  steps: [
    grSteps.amaRegistration("heraklion"),
    grSteps.displayAmaOnListings("heraklion"),
    grSteps.propertySafetyNote("heraklion"),
    grSteps.aadeStayDeclaration("heraklion"),
    grSteps.climateFeeNote("heraklion"),
  ],
};

export const GREECE_RHODES_PLAYBOOK: Playbook = {
  id: "gr-rhodes",
  country: "Greece",
  city: "Rhodes",
  sourceReviewedAt: "2026-09-20",
  title: {
    en: "Rhodes — AMA & AADE",
    fr: "Rhodes — AMA et AADE",
  },
  description: {
    en: "Rhodes island STR compliance: AADE AMA registration and monthly stay declarations.",
    fr: "Conformité LCD à Rhodes : AMA AADE et déclarations mensuelles.",
  },
  steps: [
    grSteps.amaRegistration("rhodes"),
    grSteps.displayAmaOnListings("rhodes"),
    grSteps.propertySafetyNote("rhodes"),
    grSteps.aadeStayDeclaration("rhodes"),
    grSteps.climateFeeNote("rhodes"),
  ],
};

export const GREECE_CORFU_PLAYBOOK: Playbook = {
  id: "gr-corfu",
  country: "Greece",
  city: "Corfu",
  sourceReviewedAt: "2026-09-20",
  title: {
    en: "Corfu — AMA & AADE",
    fr: "Corfou — AMA et AADE",
  },
  description: {
    en: "Corfu island STR compliance: AADE AMA registration and monthly stay declarations.",
    fr: "Conformité LCD à Corfou : AMA AADE et déclarations mensuelles.",
  },
  steps: [
    grSteps.amaRegistration("corfu"),
    grSteps.displayAmaOnListings("corfu"),
    grSteps.propertySafetyNote("corfu"),
    grSteps.aadeStayDeclaration("corfu"),
    grSteps.climateFeeNote("corfu"),
  ],
};

export const GREECE_PLAYBOOKS: Playbook[] = [
  GREECE_ATHINA_PLAYBOOK,
  GREECE_THESSALONIKI_PLAYBOOK,
  GREECE_HERAKLION_PLAYBOOK,
  GREECE_RHODES_PLAYBOOK,
  GREECE_CORFU_PLAYBOOK,
  GREECE_GENERIC_PLAYBOOK,
];
