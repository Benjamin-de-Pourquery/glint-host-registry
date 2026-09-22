import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  RIJKSOVERHEID_TOURIST_RENTAL_URL,
  NATIONAL_REGISTRATION_PORTAL_URL,
  AMSTERDAM_HOME_SHARING_URL,
  AMSTERDAM_STAY_NOTIFICATION_URL,
  ROTTERDAM_TOURIST_RENTAL_URL,
  DEN_HAAG_TOURIST_RENTAL_URL,
  UTRECHT_TOURIST_RENTAL_URL,
} from "@/lib/netherlands/official-links";
import { AMSTERDAM_15_NIGHT_WIJKEN, AMSTERDAM_WIJK_LABELS } from "@/lib/netherlands/regions";

const wijkListEn = AMSTERDAM_15_NIGHT_WIJKEN
  .map((k) => AMSTERDAM_WIJK_LABELS[k].en)
  .join(", ");
const wijkListFr = AMSTERDAM_15_NIGHT_WIJKEN
  .map((k) => AMSTERDAM_WIJK_LABELS[k].fr)
  .join(", ");

const nlSteps = {
  nationalRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-nl-registration`,
    title: {
      en: "Obtain national tourist rental registration number",
      fr: "Obtenir le numéro d'enregistrement national (toeristische verhuur)",
    },
    instruction: {
      en: "Register your short-term rental on the national portal (registratietoeristischeverhuur.nl). The registration number is free and must be displayed on every listing. Under Regulation (EU) 2024/1028 (applicable from 20 May 2026), platforms verify and display registration numbers.",
      fr: "Enregistrez votre location de courte durée sur le portail national (registratietoeristischeverhuur.nl). Le numéro est gratuit et doit figurer sur chaque annonce. Le règlement (UE) 2024/1028 (applicable depuis le 20 mai 2026) impose la vérification par les plateformes.",
    },
    officialUrls: [
      {
        url: NATIONAL_REGISTRATION_PORTAL_URL,
        label: {
          en: "National registration portal — toeristische verhuur",
          fr: "Portail national — toeristische verhuur",
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
      en: ["BSN / ID", "Proof of primary residence", "Property address"],
      fr: ["BSN / pièce d'identité", "Justificatif de résidence principale", "Adresse du bien"],
    },
    fieldHints: ["name", "address", "city", "country", "residencyStatus"],
    appliesWhen: "primaryResidence",
  }),

  holidayPermit: (cityKey: string, cityName: string, portalUrl: string): PlaybookStep => ({
    key: `${cityKey}-nl-holiday-permit`,
    title: {
      en: `Apply for holiday-rental permit (${cityName})`,
      fr: `Demander la vergunning location de vacances (${cityName})`,
    },
    instruction: {
      en: `In addition to the national registration number, ${cityName} requires a separate holiday-rental permit (vergunning) for home sharing. In Amsterdam the permit fee is approximately €76 (2026) and must be renewed. Primary residence only; typically max 4 guests.`,
      fr: `En plus du numéro national, ${cityName} exige une vergunning distincte pour la location de vacances. À Amsterdam, les frais sont d'environ 76 € (2026) avec renouvellement. Résidence principale uniquement ; max. 4 voyageurs en général.`,
    },
    officialUrls: [
      {
        url: portalUrl,
        label: {
          en: `${cityName} — home sharing / permit`,
          fr: `${cityName} — home sharing / vergunning`,
        },
        role: "portal",
        urlVerified: false,
      },
    ],
    documents: {
      en: ["National registration number", "Proof of primary residence", "Bank account for permit fee"],
      fr: ["Numéro d'enregistrement national", "Justificatif résidence principale", "Compte bancaire pour les frais"],
    },
    pitfalls: {
      en: "Registration number ≠ permit. Both are required in Amsterdam. Operating without a valid permit risks fines.",
      fr: "Numéro d'enregistrement ≠ vergunning. Les deux sont requis à Amsterdam. Exploitation sans vergunning valide expose à des amendes.",
    },
    fieldHints: ["name", "address", "city", "residencyStatus"],
    appliesWhen: "primaryResidence",
  }),

  displayRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-nl-registration`,
    title: {
      en: "Display registration number on all listings",
      fr: "Afficher le numéro d'enregistrement sur toutes les annonces",
    },
    instruction: {
      en: "Add your national registration number to Airbnb, Booking.com, and all OTAs. Platforms must verify it under EU 2024/1028.",
      fr: "Ajoutez votre numéro national sur Airbnb, Booking.com et toutes les OTA. Les plateformes doivent le vérifier au titre du règlement UE 2024/1028.",
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
      en: ["National registration number"],
      fr: ["Numéro d'enregistrement national"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  stayNotification: (cityKey: string, cityName: string, notifyUrl: string): PlaybookStep => ({
    key: `${cityKey}-nl-stay-notification`,
    title: {
      en: `Notify municipality before each stay (${cityName})`,
      fr: `Notifier la municipalité avant chaque séjour (${cityName})`,
    },
    instruction: {
      en: `Before every guest stay, notify ${cityName} via the official portal. Glint tracks upcoming stays and prepares copy fields — you submit manually on the gemeente portal. No live API integration.`,
      fr: `Avant chaque séjour, notifiez ${cityName} via le portail officiel. Glint suit les séjours à venir et prépare les champs à copier — vous soumettez manuellement sur le portail municipal.`,
    },
    officialUrls: [
      {
        url: notifyUrl,
        label: {
          en: `${cityName} — stay notification portal`,
          fr: `${cityName} — portail notification de séjour`,
        },
        role: "portal",
        urlVerified: false,
      },
    ],
    documents: {
      en: ["Registration number", "Permit number", "Check-in/check-out dates", "Guest count"],
      fr: ["Numéro d'enregistrement", "Numéro de vergunning", "Dates arrivée/départ", "Nombre de voyageurs"],
    },
    fieldHints: ["name", "address", "city"],
    appliesWhen: "primaryResidence",
  }),

  nightCap: (cityKey: string, isAmsterdam: boolean): PlaybookStep => ({
    key: `${cityKey}-nl-night-cap`,
    title: {
      en: isAmsterdam
        ? "Track Amsterdam night caps (30 / 15 nights)"
        : "Verify municipal night caps",
      fr: isAmsterdam
        ? "Suivre les plafonds Amsterdam (30 / 15 nuitées)"
        : "Vérifier les plafonds municipaux de nuitées",
    },
    instruction: isAmsterdam
      ? {
          en: `Amsterdam primary residences: 30 rental nights per calendar year citywide. From 1 April 2026, eight wijken are capped at 15 nights/year: ${wijkListEn}. Glint counts nights from your calendar and alerts when approaching limits.`,
          fr: `Résidences principales Amsterdam : 30 nuitées/an dans toute la ville. Depuis le 1er avril 2026, huit wijken sont limitées à 15 nuitées/an : ${wijkListFr}. Glint compte les nuitées depuis votre calendrier.`,
        }
      : {
          en: "Many Dutch municipalities enforce night caps on tourist rentals. Check your gemeente rules and track nights in Glint.",
          fr: "De nombreuses municipalités néerlandaises imposent des plafonds de nuitées. Vérifiez les règles locales et suivez-les dans Glint.",
        },
    officialUrls: [
      {
        url: isAmsterdam ? AMSTERDAM_HOME_SHARING_URL : RIJKSOVERHEID_TOURIST_RENTAL_URL,
        label: {
          en: isAmsterdam ? "Amsterdam — home sharing rules" : "Dutch government — tourist rental",
          fr: isAmsterdam ? "Amsterdam — règles home sharing" : "Gouvernement néerlandais — location touristique",
        },
        role: "rules",
        urlVerified: isAmsterdam ? false : true,
      },
    ],
    documents: {
      en: ["Calendar of booked stays", "Wijk/neighborhood if in Amsterdam 15-night zone"],
      fr: ["Calendrier des séjours réservés", "Wijk/quartier si zone 15 nuitées Amsterdam"],
    },
    fieldHints: ["address", "city", "residencyStatus"],
    appliesWhen: "primaryResidence",
  }),

  touristTax: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-nl-tourist-tax`,
    title: {
      en: "Register for tourist tax (toeristenbelasting)",
      fr: "S'inscrire à la taxe de séjour (toeristenbelasting)",
    },
    instruction: {
      en: "Register with your municipality to collect and remit tourist tax on overnight stays.",
      fr: "Inscrivez-vous auprès de votre municipalité pour collecter et reverser la toeristenbelasting.",
    },
    officialUrls: [
      {
        url: RIJKSOVERHEID_TOURIST_RENTAL_URL,
        label: {
          en: "Dutch government — renting to tourists",
          fr: "Gouvernement néerlandais — location aux touristes",
        },
        role: "tax",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Registration number", "KvK number if applicable"],
      fr: ["Numéro d'enregistrement", "Numéro KvK le cas échéant"],
    },
    fieldHints: ["address", "city"],
  }),
};

export const NETHERLANDS_PLAYBOOKS: Playbook[] = [
  {
    id: "nl-amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    title: {
      en: "Amsterdam — tourist rental compliance",
      fr: "Amsterdam — conformité location touristique",
    },
    description: {
      en: "National registration + Amsterdam holiday permit + per-stay notification + 30/15 night caps for primary residences.",
      fr: "Enregistrement national + vergunning Amsterdam + notification par séjour + plafonds 30/15 nuitées (résidence principale).",
    },
    steps: [
      nlSteps.nationalRegistration("amsterdam"),
      nlSteps.holidayPermit("amsterdam", "Amsterdam", AMSTERDAM_HOME_SHARING_URL),
      nlSteps.displayRegistration("amsterdam"),
      nlSteps.stayNotification("amsterdam", "Amsterdam", AMSTERDAM_STAY_NOTIFICATION_URL),
      nlSteps.nightCap("amsterdam", true),
      nlSteps.touristTax("amsterdam"),
    ],
  },
  {
    id: "nl-rotterdam",
    country: "Netherlands",
    city: "Rotterdam",
    title: {
      en: "Rotterdam — tourist rental compliance",
      fr: "Rotterdam — conformité location touristique",
    },
    description: {
      en: "National registration, municipal permit, stay notifications, and local night-cap rules.",
      fr: "Enregistrement national, vergunning municipale, notifications de séjour et plafonds locaux.",
    },
    steps: [
      nlSteps.nationalRegistration("rotterdam"),
      nlSteps.holidayPermit("rotterdam", "Rotterdam", ROTTERDAM_TOURIST_RENTAL_URL),
      nlSteps.displayRegistration("rotterdam"),
      nlSteps.stayNotification("rotterdam", "Rotterdam", ROTTERDAM_TOURIST_RENTAL_URL),
      nlSteps.nightCap("rotterdam", false),
      nlSteps.touristTax("rotterdam"),
    ],
  },
  {
    id: "nl-den-haag",
    country: "Netherlands",
    city: "Den Haag",
    title: {
      en: "Den Haag — tourist rental compliance",
      fr: "La Haye — conformité location touristique",
    },
    description: {
      en: "National registration, municipal permit, and stay notification for The Hague hosts.",
      fr: "Enregistrement national, vergunning municipale et notification de séjour pour La Haye.",
    },
    steps: [
      nlSteps.nationalRegistration("den-haag"),
      nlSteps.holidayPermit("den-haag", "Den Haag", DEN_HAAG_TOURIST_RENTAL_URL),
      nlSteps.displayRegistration("den-haag"),
      nlSteps.stayNotification("den-haag", "Den Haag", DEN_HAAG_TOURIST_RENTAL_URL),
      nlSteps.nightCap("den-haag", false),
      nlSteps.touristTax("den-haag"),
    ],
  },
  {
    id: "nl-utrecht",
    country: "Netherlands",
    city: "Utrecht",
    title: {
      en: "Utrecht — tourist rental compliance",
      fr: "Utrecht — conformité location touristique",
    },
    description: {
      en: "National registration, municipal permit, and stay notification for Utrecht hosts.",
      fr: "Enregistrement national, vergunning municipale et notification de séjour pour Utrecht.",
    },
    steps: [
      nlSteps.nationalRegistration("utrecht"),
      nlSteps.holidayPermit("utrecht", "Utrecht", UTRECHT_TOURIST_RENTAL_URL),
      nlSteps.displayRegistration("utrecht"),
      nlSteps.stayNotification("utrecht", "Utrecht", UTRECHT_TOURIST_RENTAL_URL),
      nlSteps.nightCap("utrecht", false),
      nlSteps.touristTax("utrecht"),
    ],
  },
  {
    id: "nl-generic",
    country: "Netherlands",
    title: {
      en: "Netherlands — holiday rental compliance",
      fr: "Pays-Bas — conformité location de vacances",
    },
    description: {
      en: "Country-level guide for Dutch municipalities with tourist rental registration. Rules vary by gemeente — verify locally.",
      fr: "Guide national pour les municipalités néerlandaises. Les règles varient par gemeente — vérifiez localement.",
    },
    steps: [
      nlSteps.nationalRegistration("nl"),
      {
        key: "nl-check-gemeente",
        title: {
          en: "Check your gemeente rules",
          fr: "Vérifier les règles de votre gemeente",
        },
        instruction: {
          en: "Many Dutch cities require registration, permits, per-stay notifications, and enforce night caps. Verify rules for your address before listing.",
          fr: "De nombreuses villes exigent enregistrement, vergunning, notifications par séjour et plafonds de nuitées.",
        },
        officialUrls: [
          {
            url: RIJKSOVERHEID_TOURIST_RENTAL_URL,
            label: {
              en: "Dutch government — renting to tourists",
              fr: "Gouvernement néerlandais — location aux touristes",
            },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: ["Property address", "Homeowner association rules if applicable"],
          fr: ["Adresse du bien", "Règlement VvE le cas échéant"],
        },
        fieldHints: ["address", "city", "country"],
      },
      nlSteps.displayRegistration("nl"),
      nlSteps.touristTax("nl"),
    ],
  },
];
