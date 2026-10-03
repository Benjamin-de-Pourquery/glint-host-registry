import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  RIJKSOVERHEID_TOURIST_RENTAL_URL,
  NATIONAL_REGISTRATION_PORTAL_URL,
  AMSTERDAM_HOLIDAY_RENTALS_URL,
  AMSTERDAM_HOLIDAY_RENTAL_PERMIT_URL,
  AMSTERDAM_REPORTING_HOLIDAY_RENTALS_URL,
  AMSTERDAM_TOURIST_TAX_URL,
  AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL,
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
    instruction:
      cityKey === "amsterdam"
        ? {
            en: "You need a registration number before you can rent out your home. Amsterdam hosts request it on toeristischeverhuur.nl (linked from amsterdam.nl holiday rentals). You only register once and it is free. Display the number on every listing. Under Regulation (EU) 2024/1028 (applicable from 20 May 2026), platforms verify registration numbers.",
            fr: "Vous devez disposer d'un numéro d'enregistrement avant de louer votre logement. À Amsterdam, la demande passe par toeristischeverhuur.nl (lien depuis amsterdam.nl). Une seule inscription, gratuite. Affichez le numéro sur chaque annonce. Le règlement (UE) 2024/1028 (applicable depuis le 20 mai 2026) impose la vérification par les plateformes.",
          }
        : {
            en: "Register your short-term rental on the national portal (registratietoeristischeverhuur.nl). The registration number is free and must be displayed on every listing. Under Regulation (EU) 2024/1028 (applicable from 20 May 2026), platforms verify and display registration numbers.",
            fr: "Enregistrez votre location de courte durée sur le portail national (registratietoeristischeverhuur.nl). Le numéro est gratuit et doit figurer sur chaque annonce. Le règlement (UE) 2024/1028 (applicable depuis le 20 mai 2026) impose la vérification par les plateformes.",
          },
    officialUrls:
      cityKey === "amsterdam"
        ? [
            {
              url: AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL,
              label: {
                en: "toeristischeverhuur.nl: registration (Amsterdam)",
                fr: "toeristischeverhuur.nl: enregistrement (Amsterdam)",
              },
              role: "portal",
              urlVerified: true,
            },
            {
              url: AMSTERDAM_HOLIDAY_RENTALS_URL,
              label: {
                en: "Amsterdam: holiday rentals overview",
                fr: "Amsterdam: location de vacances (vue d'ensemble)",
              },
              role: "rules",
              urlVerified: true,
            },
          ]
        : [
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

  holidayPermit: (
    cityKey: string,
    cityName: string,
    portalUrl: string,
    options?: { urlVerified?: boolean },
  ): PlaybookStep => ({
    key: `${cityKey}-nl-holiday-permit`,
    title: {
      en: `Apply for holiday-rental permit (${cityName})`,
      fr: `Demander la vergunning location de vacances (${cityName})`,
    },
    instruction:
      cityKey === "amsterdam"
        ? {
            en: `In addition to the registration number, ${cityName} requires a holiday-rental permit (vergunning vakantieverhuur). The permit costs €76, as shown by the City of Amsterdam in October 2026. It is valid until 1 April of the following calendar year. You may host a maximum of 4 guests at a time. You must live at the address and be registered there. If you rent from a private landlord, you need the owner's permission. You cannot rent out a home owned by a housing association. Addresses where you do not live and register do not qualify.`,
            fr: `En plus du numéro d'enregistrement, ${cityName} exige une vergunning de location de vacances (vergunning vakantieverhuur). Les frais sont de 76 €, selon la Ville d'Amsterdam en octobre 2026. Validité jusqu'au 1er avril de l'année civile suivante. Maximum 4 voyageurs à la fois. Vous devez habiter l'adresse et y être enregistré(e). Location auprès d'un propriétaire privé : accord du propriétaire requis. Logement d'une association de logement : location touristique interdite. Les adresses où vous n'habitez pas et n'êtes pas enregistré(e) ne sont pas éligibles.`,
          }
        : {
            en: `In addition to the national registration number, ${cityName} requires a separate holiday-rental permit (vergunning) for home sharing. Check your gemeente for current fees and renewal rules.`,
            fr: `En plus du numéro national, ${cityName} exige une vergunning distincte pour la location de vacances. Vérifiez les frais et le renouvellement auprès de votre gemeente.`,
          },
    officialUrls: [
      {
        url: portalUrl,
        label: {
          en: `${cityName} — home sharing / permit`,
          fr: `${cityName} — home sharing / vergunning`,
        },
        role: "portal",
        urlVerified: options?.urlVerified ?? false,
      },
    ],
    documents: {
      en: ["National registration number", "Proof of primary residence", "Bank account for permit fee"],
      fr: ["Numéro d'enregistrement national", "Justificatif résidence principale", "Compte bancaire pour les frais"],
    },
    pitfalls:
      cityKey === "amsterdam"
        ? {
            en: "Registration number ≠ permit. Both are required before renting out. Permit transfer to a new owner, occupant, or address is not described on the live permit page: check with Gemeente Amsterdam before listing (adviser-only).",
            fr: "Numéro d'enregistrement ≠ vergunning. Les deux sont requis avant de louer. Le transfert de vergunning vers un nouveau propriétaire, occupant ou adresse n'apparaît pas sur la page officielle : confirmer avec la Gemeente Amsterdam (conseil uniquement).",
          }
        : {
            en: "Registration number ≠ permit. Both may be required. Operating without a valid permit risks fines. Confirm local rules with your gemeente.",
            fr: "Numéro d'enregistrement ≠ vergunning. Les deux peuvent être requis. Sans vergunning valide, amendes possibles. Confirmez les règles locales auprès de votre gemeente.",
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

  stayNotification: (
    cityKey: string,
    cityName: string,
    notifyUrl: string,
    options?: { urlVerified?: boolean; rulesUrl?: string },
  ): PlaybookStep => ({
    key: `${cityKey}-nl-stay-notification`,
    title: {
      en: `Notify municipality before each stay (${cityName})`,
      fr: `Notifier la municipalité avant chaque séjour (${cityName})`,
    },
    instruction:
      cityKey === "amsterdam"
        ? {
            en: `You must report each period that you rent out your home before your guests arrive. Use the online "Report a holiday rental" service on toeristischeverhuur.nl. The City of Amsterdam does not state a number of days or hours in advance on its reporting page. Host Registry tracks upcoming stays and prepares copy fields. You submit manually; there is no live Glint API to gemeente systems.`,
            fr: `Vous devez déclarer chaque période de location avant l'arrivée des voyageurs. Utilisez le service en ligne « Report a holiday rental » sur toeristischeverhuur.nl. La Ville d'Amsterdam ne précise pas de délai en jours ou heures sur sa page dédiée. Host Registry suit les séjours à venir et prépare les champs à copier. Vous soumettez manuellement ; pas d'API Glint vers la gemeente.`,
          }
        : {
            en: `Before every guest stay, notify ${cityName} via the official portal. Glint tracks upcoming stays and prepares copy fields. You submit manually on the gemeente portal. No live API integration.`,
            fr: `Avant chaque séjour, notifiez ${cityName} via le portail officiel. Glint suit les séjours à venir et prépare les champs à copier. Vous soumettez manuellement sur le portail municipal.`,
          },
    officialUrls: [
      {
        url: notifyUrl,
        label: {
          en: `${cityName}: report a holiday rental (toeristischeverhuur.nl)`,
          fr: `${cityName}: déclarer une location (toeristischeverhuur.nl)`,
        },
        role: "portal",
        urlVerified: options?.urlVerified ?? false,
      },
      ...(options?.rulesUrl
        ? [
            {
              url: options.rulesUrl,
              label: {
                en: `${cityName}: reporting holiday rentals (rules)`,
                fr: `${cityName}: déclaration des locations (règles)`,
              },
              role: "rules" as const,
              urlVerified: true,
            },
          ]
        : []),
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
          en: `Eligible Amsterdam homes may rent out up to 30 nights per calendar year. In parts of Centrum and De Pijp, the maximum is 15 nights. The permit page does not list an effective date for the 15-night rule; confirm how it applies to your address with the city. Host Registry Cap Guard also maps these inner-city areas to wijken (${wijkListEn}) for night counting. Glint counts nights from your calendar and alerts when approaching limits.`,
          fr: `À Amsterdam, jusqu'à 30 nuitées de location par année civile. Dans certaines parties de Centrum et De Pijp, le maximum est de 15 nuitées. La page vergunning ne mentionne pas de date d'entrée en vigueur pour la règle des 15 nuitées ; confirmez avec la ville. Cap Guard mappe aussi ces zones vers des wijken (${wijkListFr}) pour le comptage. Glint compte les nuitées depuis votre calendrier.`,
        }
      : {
          en: "Many Dutch municipalities enforce night caps on tourist rentals. Check your gemeente rules and track nights in Glint.",
          fr: "De nombreuses municipalités néerlandaises imposent des plafonds de nuitées. Vérifiez les règles locales et suivez-les dans Glint.",
        },
    officialUrls: [
      {
        url: isAmsterdam ? AMSTERDAM_HOLIDAY_RENTAL_PERMIT_URL : RIJKSOVERHEID_TOURIST_RENTAL_URL,
        label: {
          en: isAmsterdam ? "Amsterdam: holiday rental permit (night limits)" : "Dutch government — tourist rental",
          fr: isAmsterdam ? "Amsterdam: vergunning location de vacances (plafonds)" : "Gouvernement néerlandais — location touristique",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Calendar of booked stays", "Wijk/neighborhood if in Amsterdam 15-night zone"],
      fr: ["Calendrier des séjours réservés", "Wijk/quartier si zone 15 nuitées Amsterdam"],
    },
    fieldHints: ["address", "city", "residencyStatus"],
    appliesWhen: "primaryResidence",
  }),

  touristTax: (cityKey: string, taxRulesUrl?: string): PlaybookStep => ({
    key: `${cityKey}-nl-tourist-tax`,
    title: {
      en: "Register for tourist tax (toeristenbelasting)",
      fr: "S'inscrire à la taxe de séjour (toeristenbelasting)",
    },
    instruction:
      cityKey === "amsterdam"
        ? {
            en: "Register with the City of Amsterdam for toeristenbelasting. Amsterdam charges 12.5% of the overnight price (excluding VAT), as shown on amsterdam.nl. Collect and remit according to municipal rules.",
            fr: "Inscrivez-vous à la toeristenbelasting auprès de la Ville d'Amsterdam. Le taux est de 12,5 % du prix de la nuitée (hors TVA), selon amsterdam.nl. Collectez et reversez selon les règles municipales.",
          }
        : {
            en: "Register with your municipality to collect and remit tourist tax on overnight stays.",
            fr: "Inscrivez-vous auprès de votre municipalité pour collecter et reverser la toeristenbelasting.",
          },
    officialUrls: [
      {
        url: taxRulesUrl ?? RIJKSOVERHEID_TOURIST_RENTAL_URL,
        label: {
          en: cityKey === "amsterdam" ? "Amsterdam: tourist tax" : "Dutch government — renting to tourists",
          fr: cityKey === "amsterdam" ? "Amsterdam: taxe de séjour" : "Gouvernement néerlandais — location aux touristes",
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
    sourceReviewedAt: "2026-10-03",
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
      nlSteps.holidayPermit("amsterdam", "Amsterdam", AMSTERDAM_HOLIDAY_RENTAL_PERMIT_URL, {
        urlVerified: true,
      }),
      nlSteps.displayRegistration("amsterdam"),
      nlSteps.stayNotification("amsterdam", "Amsterdam", AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL, {
        urlVerified: true,
        rulesUrl: AMSTERDAM_REPORTING_HOLIDAY_RENTALS_URL,
      }),
      nlSteps.nightCap("amsterdam", true),
      nlSteps.touristTax("amsterdam", AMSTERDAM_TOURIST_TAX_URL),
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
