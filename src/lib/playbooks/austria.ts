import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  VIENNA_AUSNAHMEBEWILLIGUNG_URL,
  VIENNA_ORTSTAXE_URL,
  VIENNA_PRIVATE_TOURIST_RENTAL_URL,
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
      en: "The planned Wiener Kurzzeitvermietungsregistergesetz (WKVRG) adds a future platform registration number from 2027. That is separate from today's building-law rules: up to 90 days per year home-sharing without Ausnahmebewilligung, Ortstaxe and tourism statistics (VIETour), and Ausnahmebewilligung if you exceed 90 days. Confirm this unit is a platform STR in Vienna and note Gemeindewohnung or other exclusions before WKVRG dossier prep.",
      fr: "Le projet WKVRG ajoutera un futur numéro d'enregistrement plateforme à partir de 2027. C'est distinct des règles actuelles : partage du logement jusqu'à 90 jours/an sans Ausnahmebewilligung, Ortstaxe et statistiques touristiques (VIETour), et Ausnahmebewilligung au-delà de 90 jours. Confirmez une LCD sur plateforme à Vienne et les exclusions (ex. Gemeindewohnung) avant le dossier WKVRG.",
    },
    officialUrls: [
      {
        url: VIENNA_PRIVATE_TOURIST_RENTAL_URL,
        label: {
          en: "Stadt Wien — private tourist rental (current rules)",
          fr: "Stadt Wien — location touristique privée (règles actuelles)",
        },
        role: "rules",
        urlVerified: true,
      },
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
      en: "WKVRG is announced and pending Wiener Landtag passage (targeted November 2026). Prepare the dossier for the future register: address, host or entity identity, operator type, exclusions. Track today's obligations separately: 90-day home-sharing limit, Ortstaxe account (not the WKVRG number), VIETour reporting, and Ausnahmebewilligung if you rent beyond 90 days. The WKVRG portal is not live yet. Glint tracks readiness only. You file on the official register when the city opens it.",
      fr: "Le WKVRG est annoncé et en attente au Landtag (objectif novembre 2026). Préparez le dossier pour le futur registre : adresse, identité, type d'exploitant, exclusions. Suivez à part les obligations actuelles : limite 90 jours, compte Ortstaxe (pas le numéro WKVRG), VIETour, Ausnahmebewilligung au-delà de 90 jours. Le portail WKVRG n'est pas encore ouvert. Glint suit la préparation. Vous déposez quand la ville ouvrira le registre.",
    },
    officialUrls: [
      {
        url: VIENNA_PRIVATE_TOURIST_RENTAL_URL,
        label: {
          en: "Stadt Wien — private tourist rental overview",
          fr: "Stadt Wien — vue d'ensemble location touristique",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: VIENNA_AUSNAHMEBEWILLIGUNG_URL,
        label: {
          en: "Ausnahmebewilligung (beyond 90 days)",
          fr: "Ausnahmebewilligung (au-delà de 90 jours)",
        },
        role: "form",
        urlVerified: true,
      },
      {
        url: VIENNA_ORTSTAXE_URL,
        label: {
          en: "Ortstaxe account (local tax)",
          fr: "Compte Ortstaxe (taxe locale)",
        },
        role: "tax",
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
      en: "Do not confuse Ortstaxe with the future WKVRG registration number. Glint does not submit government forms or issue registration numbers.",
      fr: "Ne confondez pas l'Ortstaxe avec le futur numéro WKVRG. Glint ne dépose pas les formulaires officiels et ne délivre pas de numéro.",
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
      en: "Once WKVRG is adopted and the electronic Vienna platform STR register opens, apply for a WKVRG registration number per unit. There is no public registry portal URL yet: use the city announcement and current Wien.gv.at pages until the register goes live. New hosts: from 1 January 2027. Existing listings: transition until 31 March 2027. This number is additional to Ortstaxe and 90-day rules. Fines up to €50,000 are proposed. Final law text may still change.",
      fr: "Une fois le WKVRG adopté et le registre LCD plateforme ouvert, demandez un numéro WKVRG par logement. Aucun portail public n'existe encore : utilisez l'annonce municipale et les pages Wien.gv.at actuelles. Nouveaux hôtes : 1er janvier 2027. Annonces existantes : jusqu'au 31 mars 2027. Ce numéro s'ajoute à l'Ortstaxe et aux règles 90 jours. Amendes jusqu'à 50 000 € annoncées. Texte final susceptible d'évoluer.",
    },
    officialUrls: [
      {
        url: VIENNA_WKVRG_OTS_URL,
        label: {
          en: "WKVRG announcement (register portal not live yet)",
          fr: "Annonce WKVRG (portail registre pas encore ouvert)",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: VIENNA_PRIVATE_TOURIST_RENTAL_URL,
        label: {
          en: "Current Stadt Wien STR guidance",
          fr: "Guidage LCD actuel Stadt Wien",
        },
        role: "rules",
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
