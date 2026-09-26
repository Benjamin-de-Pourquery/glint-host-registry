import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  VIENNA_EU_STR_POLICY_URL,
  VIENNA_WKVRG_OTS_URL,
} from "@/lib/austria/official-links";

const atSteps = {
  confirmViennaStr: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-at-confirm-str`,
    title: {
      en: "Confirm platform STR in Vienna",
      fr: "Confirmer une LCD sur plateforme à Vienne",
    },
    instruction: {
      en: "The planned Wiener Kurzzeitvermietungsregistergesetz (WKVRG) targets short-term rentals offered on platforms such as Airbnb and Booking.com in Vienna. Confirm this property is a platform STR in Vienna (not a hotel or long-term lease) and note whether it is a Gemeindewohnung or another excluded category before building your dossier.",
      fr: "Le projet de Wiener Kurzzeitvermietungsregistergesetz (WKVRG) vise les locations de courte durée proposées sur des plateformes comme Airbnb et Booking.com à Vienne. Confirmez que ce bien est une LCD sur plateforme à Vienne (pas un hôtel ni un bail longue durée) et notez s'il s'agit d'un logement communal (Gemeindewohnung) ou d'une autre catégorie exclue avant de constituer le dossier.",
    },
    officialUrls: [
      {
        url: VIENNA_WKVRG_OTS_URL,
        label: {
          en: "City of Vienna — WKVRG announcement (Sep 2026)",
          fr: "Ville de Vienne — annonce WKVRG (sep. 2026)",
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
      en: ["Property address in Vienna", "Listing platform URLs", "Host identity"],
      fr: ["Adresse du bien à Vienne", "URL des annonces plateforme", "Identité de l'hôte"],
    },
    fieldHints: ["address", "city", "country", "propertyType"],
  }),

  viennaDossier: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-at-dossier`,
    title: {
      en: "Gather WKVRG readiness dossier",
      fr: "Constituer le dossier de préparation WKVRG",
    },
    instruction: {
      en: "WKVRG is announced and still pending Wiener Landtag passage (targeted November 2026). Prepare the dossier the city is expected to review: full address, host or entity identity, operator type (natural or legal person), whether the unit is a municipal flat (Gemeindewohnung) or subject to exclusions, and your existing 90-day home-sharing context (separate from the future registration number). Glint tracks readiness only. You file on the official register once the portal opens.",
      fr: "Le WKVRG est annoncé et reste en attente au Landtag de Vienne (objectif novembre 2026). Préparez le dossier que la ville devrait examiner : adresse complète, identité de l'hôte ou de l'entité, type d'exploitant (personne physique ou morale), logement communal (Gemeindewohnung) ou exclusions, et contexte du partage du logement 90 jours (distinct du futur numéro d'enregistrement). Glint suit la préparation uniquement. Vous déposez sur le registre officiel dès l'ouverture du portail.",
    },
    officialUrls: [
      {
        url: VIENNA_EU_STR_POLICY_URL,
        label: {
          en: "Stadt Wien — EU short-term rental policy",
          fr: "Stadt Wien — politique UE LCD",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Proof of address",
        "Host ID or company extract",
        "Platform listing screenshots",
        "Notes on 90-day rule / exclusions",
      ],
      fr: [
        "Justificatif d'adresse",
        "Pièce d'identité ou extrait société",
        "Captures d'annonces plateforme",
        "Notes sur règle 90 jours / exclusions",
      ],
    },
    pitfalls: {
      en: "Glint does not submit government forms or issue registration numbers. You remain responsible for official filing.",
      fr: "Glint ne dépose pas les formulaires officiels et ne délivre pas de numéro. Vous restez responsable du dépôt officiel.",
    },
    fieldHints: ["name", "address", "city", "residencyStatus"],
  }),

  officialRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-at-official-registration`,
    title: {
      en: "Register on the Vienna STR register (when live)",
      fr: "S'inscrire au registre LCD viennois (quand ouvert)",
    },
    instruction: {
      en: "Once WKVRG is adopted and the electronic Vienna short-term rental register opens, apply for a registration number per unit. New hosts: from 1 January 2027. Existing listings: transition until end of Q1 2027 (31 March 2027). The city may refuse registration where local rules prohibit STR. Fines up to €50,000 are proposed for non-compliance. Final law text may still change.",
      fr: "Une fois le WKVRG adopté et le registre électronique viennois ouvert, demandez un numéro d'enregistrement par logement. Nouveaux hôtes : à partir du 1er janvier 2027. Annonces existantes : transition jusqu'à fin T1 2027 (31 mars 2027). La ville peut refuser l'inscription si la LCD est interdite. Des amendes jusqu'à 50 000 € sont annoncées. Le texte final peut encore évoluer.",
    },
    officialUrls: [
      {
        url: VIENNA_WKVRG_OTS_URL,
        label: {
          en: "Official city announcement (portal TBD)",
          fr: "Annonce officielle de la ville (portail à venir)",
        },
        role: "info",
        urlVerified: true,
      },
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
      en: ["Complete application confirmation", "Registration number from the city"],
      fr: ["Confirmation de demande", "Numéro délivré par la ville"],
    },
    fieldHints: ["address", "city"],
  }),

  storeInGlint: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-at-store-registration`,
    title: {
      en: "Store registration number in Host Registry",
      fr: "Enregistrer le numéro dans Host Registry",
    },
    instruction: {
      en: "Enter the Vienna registration number in Glint Host Registry once received. Track status, transition deadline for existing listings, and whether the number is displayed on each OTA.",
      fr: "Saisissez le numéro viennois dans Glint Host Registry une fois reçu. Suivez le statut, la date limite de transition pour les annonces existantes et l'affichage sur chaque OTA.",
    },
    officialUrls: [],
    documents: {
      en: ["Registration number"],
      fr: ["Numéro d'enregistrement"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  displayRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-at-registration`,
    title: {
      en: "Display registration number on all listings",
      fr: "Afficher le numéro sur toutes les annonces",
    },
    instruction: {
      en: "Add the Vienna registration number to Airbnb, Booking.com and every OTA listing. Platforms must verify numbers under EU 2024/1028. Listings without a valid number may be removed after the transition period.",
      fr: "Ajoutez le numéro viennois sur Airbnb, Booking.com et toutes les OTA. Les plateformes doivent vérifier les numéros au titre du UE 2024/1028. Les annonces sans numéro valide pourront être retirées après la période de transition.",
    },
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028 — listing display",
          fr: "UE 2024/1028 — affichage annonces",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Vienna registration number"],
      fr: ["Numéro d'enregistrement viennois"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  federalStateSelection: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-at-federal-state`,
    title: {
      en: "Confirm Austria federal state / city",
      fr: "Confirmer l'État fédéral / la ville en Autriche",
    },
    instruction: {
      en: "Austria has no single national STR registration number. Vienna is preparing WKVRG (platform STR register from 2027). Other Bundesländer may already have tourism or municipal rules. Select your city in Glint to unlock the right checklist.",
      fr: "L'Autriche n'a pas de numéro national unique pour les LCD. Vienne prépare le WKVRG (registre LCD plateforme à partir de 2027). Les autres Länder peuvent déjà avoir des règles touristiques ou municipales. Sélectionnez votre ville dans Glint pour débloquer la bonne checklist.",
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
      en: ["City and Bundesland", "Property address"],
      fr: ["Ville et Bundesland", "Adresse du bien"],
    },
    fieldHints: ["address", "city", "country"],
  }),
};

export const AUSTRIA_PLAYBOOKS: Playbook[] = [
  {
    id: "at-vienna",
    country: "Austria",
    city: "Vienna",
    title: {
      en: "Vienna — WKVRG platform STR readiness",
      fr: "Vienne — préparation WKVRG LCD plateforme",
    },
    description: {
      en: "Pending Wiener Kurzzeitvermietungsregistergesetz: dossier tracking, official register filing (when live), number storage and EU platform display from 2027.",
      fr: "Projet WKVRG : suivi dossier, inscription au registre officiel (à l'ouverture), stockage du numéro et affichage plateformes UE à partir de 2027.",
    },
    steps: [
      atSteps.confirmViennaStr("vienna"),
      atSteps.viennaDossier("vienna"),
      atSteps.officialRegistration("vienna"),
      atSteps.storeInGlint("vienna"),
      atSteps.displayRegistration("vienna"),
    ],
  },
  {
    id: "at-generic",
    country: "Austria",
    title: {
      en: "Austria — federal STR registration overview",
      fr: "Autriche — vue d'ensemble enregistrement LCD",
    },
    description: {
      en: "No fake national number. Vienna WKVRG readiness from 2027; other Länder vary. Glint guides dossier tracking. You submit on official portals.",
      fr: "Pas de numéro national fictif. Préparation WKVRG à Vienne à partir de 2027 ; autres Länder variables. Glint guide le dossier. Vous déposez sur les portails officiels.",
    },
    steps: [
      atSteps.federalStateSelection("at"),
      {
        key: "at-choose-local-path",
        title: {
          en: "Follow your city registration path",
          fr: "Suivre le parcours d'enregistrement local",
        },
        instruction: {
          en: "Vienna: planned WKVRG register for platform STR from 1 January 2027 (existing listings until 31 March 2027). Other cities: check Bundesland tourism or municipal rules. Update city in Glint to load the Vienna playbook when applicable.",
          fr: "Vienne : registre WKVRG prévu pour les LCD plateforme dès le 1er janvier 2027 (annonces existantes jusqu'au 31 mars 2027). Autres villes : vérifiez les règles touristiques ou municipales du Bundesland. Mettez à jour la ville dans Glint pour charger le playbook Vienne le cas échéant.",
        },
        officialUrls: [
          {
            url: VIENNA_WKVRG_OTS_URL,
            label: { en: "Vienna WKVRG announcement", fr: "Annonce WKVRG Vienne" },
            role: "info",
            urlVerified: true,
          },
        ],
        documents: {
          en: ["Local registration number once issued"],
          fr: ["Numéro local une fois délivré"],
        },
        fieldHints: ["address", "city", "country"],
      },
      atSteps.displayRegistration("at"),
    ],
  },
];
