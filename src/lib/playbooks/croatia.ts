import type { Playbook, PlaybookStep } from "./types";
import {
  EVISITOR_PORTAL_URL,
  MINT_TOURISM_URL,
  EU_1028_URL,
} from "@/lib/croatia/official-links";

const hrSteps = {
  categorisationRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-categorisation-registration`,
    title: {
      en: "Obtain tourist accommodation categorisation / approval",
      fr: "Obtenir la catégorisation / l'agrément hébergement touristique",
    },
    instruction: {
      en: "Before advertising short-term rental accommodation in Croatia, obtain official approval and categorisation from the Ministry of Tourism and Sport (Ministarstvo turizma i sporta). Your property must be registered as a tourist accommodation facility. EU Regulation 2024/1028 platform verification applies from 20 May 2026; Croatia's unique listing registration numbers are expected from ~January 2027 under the new Hospitality Act / eTourism.",
      fr: "Avant de publier une annonce de location de courte durée en Croatie, obtenez l'agrément et la catégorisation officielle du Ministère du tourisme et du sport. Le règlement UE 2024/1028 s'applique depuis le 20 mai 2026 ; les numéros d'enregistrement uniques croates sont attendus vers janvier 2027.",
    },
    officialUrls: [
      {
        url: MINT_TOURISM_URL,
        label: {
          en: "Ministry of Tourism and Sport — Croatia",
          fr: "Ministère du tourisme et du sport — Croatie",
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
        "Tourist accommodation categorisation certificate",
        "Municipal / county tourism registration",
      ],
      fr: [
        "Justificatif de propriété ou gestion",
        "Certificat de catégorisation hébergement touristique",
        "Enregistrement tourisme municipal / départemental",
      ],
    },
    pitfalls: {
      en: "Categorisation ≠ eVisitor. Categorisation is your listing approval; eVisitor is mandatory guest check-in/out reporting since 2016. Advertising without approval can result in fines.",
      fr: "Catégorisation ≠ eVisitor. La catégorisation est l'agrément de l'annonce ; eVisitor est la déclaration obligatoire des voyageurs depuis 2016.",
    },
    fieldHints: ["name", "address", "city", "country", "propertyType"],
  }),

  displayCategorisationOnListings: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-categorisation`,
    title: {
      en: "Display categorisation number on all platform listings",
      fr: "Afficher le numéro de catégorisation sur toutes les annonces",
    },
    instruction: {
      en: "Add your categorisation / registration number to Airbnb, Booking.com, and other OTAs. From 20 May 2026, platforms verify registration under EU 2024/1028.",
      fr: "Ajoutez votre numéro de catégorisation sur Airbnb, Booking.com et autres OTA. Depuis le 20 mai 2026, les plateformes vérifient l'enregistrement au titre du règlement UE 2024/1028.",
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
      en: ["Categorisation number from Ministry of Tourism registration"],
      fr: ["Numéro de catégorisation issu de l'enregistrement ministériel"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  evisitorObjectSetup: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-evisitor-object-setup`,
    title: {
      en: "Register your property object on eVisitor",
      fr: "Enregistrer votre objet sur eVisitor",
    },
    instruction: {
      en: "Create an eVisitor account at https://www.evisitor.hr/ and register your accommodation object. You need the object ID for guest check-in and check-out. Glint tracks your object ID and categorisation separately — you submit manually on the portal.",
      fr: "Créez un compte eVisitor sur https://www.evisitor.hr/ et enregistrez votre objet d'hébergement. Vous avez besoin de l'ID objet pour l'enregistrement et la déclaration de départ des voyageurs.",
    },
    officialUrls: [
      {
        url: EVISITOR_PORTAL_URL,
        label: {
          en: "eVisitor portal",
          fr: "Portail eVisitor",
        },
        role: "portal",
        urlVerified: false,
      },
    ],
    documents: {
      en: ["eVisitor account credentials", "Accommodation object ID", "Categorisation certificate"],
      fr: ["Identifiants compte eVisitor", "ID objet d'hébergement", "Certificat de catégorisation"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  evisitorGuestReporting: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-evisitor-guest-reporting`,
    title: {
      en: "Register guests on eVisitor (check-in and check-out)",
      fr: "Enregistrer les voyageurs sur eVisitor (arrivée et départ)",
    },
    instruction: {
      en: "All vacation rental hosts must register every guest in eVisitor within 24 hours of arrival and deregister within 24 hours of departure. Sojourn tax (boravišna pristojba) is calculated from eVisitor data. Glint collects guest data via check-in link, validates fields, and prepares CSV/printable export — you submit manually on https://www.evisitor.hr/. Phase 2 may integrate the Rhetos API used by third parties; no live API in this release.",
      fr: "Tous les hôtes doivent enregistrer chaque voyageur sur eVisitor dans les 24 h suivant l'arrivée et le départ. La taxe de séjour est calculée à partir d'eVisitor. Glint collecte les données, valide et prépare l'export — vous soumettez manuellement sur le portail officiel.",
    },
    officialUrls: [
      {
        url: EVISITOR_PORTAL_URL,
        label: {
          en: "eVisitor portal",
          fr: "Portail eVisitor",
        },
        role: "portal",
        urlVerified: false,
      },
      {
        url: MINT_TOURISM_URL,
        label: {
          en: "Ministry of Tourism — eVisitor guidance",
          fr: "Ministère du tourisme — orientations eVisitor",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Guest identity document type and number",
        "Guest name, sex, date of birth, nationality",
        "Arrival and departure dates",
      ],
      fr: [
        "Type et numéro de document d'identité",
        "Nom, sexe, date de naissance, nationalité du voyageur",
        "Dates d'arrivée et de départ",
      ],
    },
    timeline: {
      en: "Within 24 hours of guest arrival (check-in) and within 24 hours of departure (check-out).",
      fr: "Dans les 24 h suivant l'arrivée (enregistrement) et le départ (déclaration de sortie).",
    },
    pitfalls: {
      en: "eVisitor is separate from categorisation. Fines for non-compliance can be severe; tourism inspectors check pre-season and peak season. Glint does not submit to eVisitor — you remain responsible.",
      fr: "eVisitor est distinct de la catégorisation. Les amendes peuvent être sévères ; les inspecteurs contrôlent en pré-saison et haute saison.",
    },
    fieldHints: ["name", "address", "city", "country"],
  }),

  sojournTaxReminder: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-sojourn-tax`,
    title: {
      en: "Sojourn tax (boravišna pristojba) reminder",
      fr: "Rappel taxe de séjour (boravišna pristojba)",
    },
    instruction: {
      en: "Sojourn tax is calculated from eVisitor guest data. Collect from guests and remit per municipal rules. Rates vary by municipality and accommodation category.",
      fr: "La taxe de séjour est calculée à partir des données eVisitor. Percevez-la auprès des voyageurs et reversez-la selon les règles municipales.",
    },
    officialUrls: [
      {
        url: MINT_TOURISM_URL,
        label: {
          en: "Ministry of Tourism — sojourn tax info",
          fr: "Ministère du tourisme — taxe de séjour",
        },
        role: "tax",
        urlVerified: true,
      },
    ],
    timeline: {
      en: "Per stay — collected from guests, remitted per local schedule.",
      fr: "Par séjour — perçue auprès des voyageurs, reversée selon le calendrier local.",
    },
    documents: {
      en: ["eVisitor guest records", "Municipal sojourn tax registration"],
      fr: ["Enregistrements eVisitor", "Inscription taxe de séjour municipale"],
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
      en: `Municipal STR rules — ${cityLabel.en}`,
      fr: `Règles LCD municipales — ${cityLabel.fr}`,
    },
    instruction: customInstruction ?? {
      en: `Check ${cityLabel.en} municipal tourism rules: zoning, caps, and local registration requirements.`,
      fr: `Consultez les règles touristiques municipales de ${cityLabel.fr} : zonage, plafonds et enregistrement local.`,
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
      en: ["Municipal tourism registration", "Property address proof"],
      fr: ["Enregistrement tourisme municipal", "Justificatif d'adresse"],
    },
    fieldHints: ["address", "city"],
  }),
};

export const CROATIA_GENERIC_PLAYBOOK: Playbook = {
  id: "hr-generic",
  country: "Croatia",
  sourceReviewedAt: "2026-09-21",
  title: {
    en: "Croatia — categorisation & eVisitor compliance",
    fr: "Croatie — catégorisation et conformité eVisitor",
  },
  description: {
    en: "National Croatia STR compliance: tourist accommodation categorisation, eVisitor guest check-in/out, and sojourn tax.",
    fr: "Conformité LCD Croatie : catégorisation hébergement touristique, enregistrement eVisitor et taxe de séjour.",
  },
  steps: [
    hrSteps.categorisationRegistration("hr"),
    hrSteps.displayCategorisationOnListings("hr"),
    hrSteps.evisitorObjectSetup("hr"),
    hrSteps.evisitorGuestReporting("hr"),
    hrSteps.sojournTaxReminder("hr"),
  ],
};

export const CROATIA_ZAGREB_PLAYBOOK: Playbook = {
  id: "hr-zagreb",
  country: "Croatia",
  city: "Zagreb",
  sourceReviewedAt: "2026-09-21",
  title: {
    en: "Zagreb — categorisation, eVisitor & municipal rules",
    fr: "Zagreb — catégorisation, eVisitor et règles municipales",
  },
  description: {
    en: "Zagreb short-term rental: Ministry categorisation, eVisitor guest reporting within 24h, and Grad Zagreb sojourn tax.",
    fr: "Location courte durée à Zagreb : catégorisation ministérielle, eVisitor sous 24 h et taxe de séjour municipale.",
  },
  steps: [
    hrSteps.municipalRules(
      "zagreb",
      { en: "Zagreb", fr: "Zagreb" },
      "https://www.zagreb.hr/",
      false,
      {
        en: "Check Grad Zagreb tourism rules for short-term rental zoning and local registration.",
        fr: "Consultez les règles de Grad Zagreb pour le zonage LCD et l'enregistrement local.",
      }
    ),
    hrSteps.categorisationRegistration("zagreb"),
    hrSteps.displayCategorisationOnListings("zagreb"),
    hrSteps.evisitorObjectSetup("zagreb"),
    hrSteps.evisitorGuestReporting("zagreb"),
    hrSteps.sojournTaxReminder("zagreb"),
  ],
};

export const CROATIA_SPLIT_PLAYBOOK: Playbook = {
  id: "hr-split",
  country: "Croatia",
  city: "Split",
  sourceReviewedAt: "2026-09-21",
  title: {
    en: "Split — categorisation, eVisitor & Dalmatia rules",
    fr: "Split — catégorisation, eVisitor et règles de Dalmatie",
  },
  description: {
    en: "Split and Split-Dalmatia County: categorisation, eVisitor 24h check-in/out, and local sojourn tax.",
    fr: "Split et comitat de Split-Dalmatie : catégorisation, eVisitor sous 24 h et taxe de séjour locale.",
  },
  steps: [
    hrSteps.municipalRules(
      "split",
      { en: "Split", fr: "Split" },
      "https://www.split.hr/",
      false,
      {
        en: "Split-Dalmatia County has high tourism volume — inspectors check eVisitor compliance pre-season and peak season.",
        fr: "Le comitat de Split-Dalmatie est très touristique — les inspecteurs contrôlent eVisitor en pré-saison et haute saison.",
      }
    ),
    hrSteps.categorisationRegistration("split"),
    hrSteps.displayCategorisationOnListings("split"),
    hrSteps.evisitorObjectSetup("split"),
    hrSteps.evisitorGuestReporting("split"),
    hrSteps.sojournTaxReminder("split"),
  ],
};

export const CROATIA_DUBROVNIK_PLAYBOOK: Playbook = {
  id: "hr-dubrovnik",
  country: "Croatia",
  city: "Dubrovnik",
  sourceReviewedAt: "2026-09-21",
  title: {
    en: "Dubrovnik — categorisation, eVisitor & UNESCO zone rules",
    fr: "Dubrovnik — catégorisation, eVisitor et zone UNESCO",
  },
  description: {
    en: "Dubrovnik-Neretva County: strict tourism rules, categorisation, eVisitor guest reporting, and sojourn tax.",
    fr: "Comitat de Dubrovnik-Neretva : règles touristiques strictes, catégorisation et eVisitor.",
  },
  steps: [
    hrSteps.municipalRules(
      "dubrovnik",
      { en: "Dubrovnik", fr: "Dubrovnik" },
      "https://www.dubrovnik.hr/",
      false,
      {
        en: "Dubrovnik applies specific rules in the UNESCO old town zone. Verify municipal caps and registration before advertising.",
        fr: "Dubrovnik applique des règles spécifiques dans la zone UNESCO. Vérifiez les plafonds et l'enregistrement municipal.",
      }
    ),
    hrSteps.categorisationRegistration("dubrovnik"),
    hrSteps.displayCategorisationOnListings("dubrovnik"),
    hrSteps.evisitorObjectSetup("dubrovnik"),
    hrSteps.evisitorGuestReporting("dubrovnik"),
    hrSteps.sojournTaxReminder("dubrovnik"),
  ],
};

export const CROATIA_ZADAR_PLAYBOOK: Playbook = {
  id: "hr-zadar",
  country: "Croatia",
  city: "Zadar",
  sourceReviewedAt: "2026-09-21",
  title: {
    en: "Zadar — categorisation, eVisitor & Adriatic coast rules",
    fr: "Zadar — catégorisation, eVisitor et côte adriatique",
  },
  description: {
    en: "Zadar County Adriatic coast: categorisation, eVisitor 24h obligations, and municipal sojourn tax.",
    fr: "Côte adriatique du comitat de Zadar : catégorisation, obligations eVisitor sous 24 h et taxe de séjour.",
  },
  steps: [
    hrSteps.municipalRules(
      "zadar",
      { en: "Zadar", fr: "Zadar" },
      "https://www.zadar.hr/",
      false
    ),
    hrSteps.categorisationRegistration("zadar"),
    hrSteps.displayCategorisationOnListings("zadar"),
    hrSteps.evisitorObjectSetup("zadar"),
    hrSteps.evisitorGuestReporting("zadar"),
    hrSteps.sojournTaxReminder("zadar"),
  ],
};

export const CROATIA_PLAYBOOKS = [
  CROATIA_ZAGREB_PLAYBOOK,
  CROATIA_SPLIT_PLAYBOOK,
  CROATIA_DUBROVNIK_PLAYBOOK,
  CROATIA_ZADAR_PLAYBOOK,
  CROATIA_GENERIC_PLAYBOOK,
];
