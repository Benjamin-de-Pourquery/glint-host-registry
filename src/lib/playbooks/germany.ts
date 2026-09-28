import type { Playbook, PlaybookStep } from "./types";
import {
  BERLIN_SERVICE_ZWVB_URL,
  BERLIN_ZWVB_FORMS_URL,
  BERLIN_ZWVB_URL,
  EU_1028_URL,
  MUNICH_STR_REGISTRATION_INFOBLATT_URL,
  MUNICH_ZES_URL,
  MUNICH_ZWECKENTFREMUNG_SERVICE_URL,
} from "@/lib/germany/official-links";

const deSteps = {
  confirmBerlinStr: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-confirm-str`,
    title: {
      en: "Confirm Berlin ZwVbG short-term letting",
      fr: "Confirmer une LCD soumise au ZwVbG à Berlin",
    },
    instruction: {
      en: "Berlin's Zweckentfremdungsverbot (ZwVbG) requires Bezirksamt approval for temporary holiday letting of residential space. A registration number must be visible on listings (since 2018). Confirm this unit is a platform STR in Berlin, note Hauptwohnung vs Nebenwohnung, and whether you rely on Genehmigung, Anzeige (≤49% Hauptwohnung) or another path before dossier prep.",
      fr: "Le Zweckentfremdungsverbot (ZwVbG) berlinois impose une autorisation du Bezirksamt pour la location de vacances temporaire. Un numéro d'enregistrement doit figurer sur les annonces (depuis 2018). Confirmez une LCD sur plateforme à Berlin, Hauptwohnung ou Nebenwohnung, et Genehmigung, Anzeige (≤49 % Hauptwohnung) ou autre voie avant le dossier.",
    },
    officialUrls: [
      {
        url: BERLIN_ZWVB_URL,
        label: {
          en: "Berlin Senate: Zweckentfremdungsverbot overview",
          fr: "Sénat de Berlin : vue d'ensemble ZwVbG",
        },
        role: "rules",
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
      en: ["Property address in Berlin", "Listing platform URLs", "Host identity"],
      fr: ["Adresse du bien à Berlin", "URL des annonces plateforme", "Identité de l'hôte"],
    },
    fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
  }),

  berlinBezirk: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-bezirk`,
    title: {
      en: "Select your Berlin Bezirk",
      fr: "Sélectionner votre Bezirk berlinois",
    },
    instruction: {
      en: "ZwVbG applications are handled by the Bezirksamt for the district (Bezirk) where the apartment is located. Select the correct Bezirk in Glint so your dossier and next actions match the right authority.",
      fr: "Les demandes ZwVbG sont traitées par le Bezirksamt du quartier (Bezirk) où se trouve le logement. Sélectionnez le bon Bezirk dans Glint pour aligner dossier et prochaines actions.",
    },
    officialUrls: [
      {
        url: BERLIN_SERVICE_ZWVB_URL,
        label: {
          en: "service.berlin.de: Zweckentfremdung service",
          fr: "service.berlin.de : service Zweckentfremdung",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Full street address", "Bezirk confirmation"],
      fr: ["Adresse complète", "Confirmation du Bezirk"],
    },
    fieldHints: ["address", "city"],
  }),

  berlinDossier: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-dossier`,
    title: {
      en: "Gather ZwVbG dossier for your Bezirksamt",
      fr: "Constituer le dossier ZwVbG pour le Bezirksamt",
    },
    instruction: {
      en: "Prepare documents for Genehmigung or Anzeige: address, host identity, operator category (Hauptwohnung absences, Nebenwohnung typically capped around 90 days/year with approval, or ≤49% Hauptwohnung Anzeige). Track EU 2024/1028 readiness: the fourth ZwVbG amendment for EU STR data rules is in force, but digital EU-aligned registration number issuance is still in test and delayed. Hosts with existing Berlin registration numbers may keep using them until further notice; new issuance on the digital system is not live yet. Glint tracks readiness only. You file with the Bezirksamt yourself.",
      fr: "Préparez les pièces pour Genehmigung ou Anzeige : adresse, identité, catégorie (absences Hauptwohnung, Nebenwohnung souvent ~90 jours/an avec autorisation, ou Anzeige ≤49 % Hauptwohnung). Préparez l'UE 2024/1028 : la 4e modification ZwVbG est en vigueur, mais la délivrance numérique alignée UE est encore en test et retardée. Les hôtes avec un numéro berlinois existant peuvent le conserver ; les nouvelles délivrances numériques ne sont pas encore ouvertes. Glint suit la préparation. Vous déposez au Bezirksamt.",
    },
    officialUrls: [
      {
        url: BERLIN_ZWVB_FORMS_URL,
        label: {
          en: "ZwVbG rules and forms (Senate)",
          fr: "Textes et formulaires ZwVbG (Sénat)",
        },
        role: "form",
        urlVerified: true,
      },
      {
        url: BERLIN_ZWVB_URL,
        label: {
          en: "ZwVbG overview and EU transition notes",
          fr: "Vue d'ensemble ZwVbG et transition UE",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Proof of address and ownership or lawful use",
        "Host ID or company extract",
        "Floor plan / room allocation if required",
        "Platform listing screenshots",
        "Existing Berlin registration number (if any)",
      ],
      fr: [
        "Justificatif d'adresse et de droit d'usage",
        "Pièce d'identité ou extrait société",
        "Plan / répartition des pièces si requis",
        "Captures d'annonces plateforme",
        "Numéro berlinois existant (le cas échéant)",
      ],
    },
    pitfalls: {
      en: "Glint does not submit to Bezirksamt portals or issue government registration numbers. Do not wait for the delayed EU digital number if you already hold a valid Berlin number: keep displaying it on listings.",
      fr: "Glint ne dépose pas sur les portails Bezirksamt et ne délivre pas de numéros officiels. Si vous avez déjà un numéro berlinois valide, continuez à l'afficher plutôt que d'attendre le numéro numérique UE retardé.",
    },
    fieldHints: ["name", "address", "city", "residencyStatus"],
  }),

  officialRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-official-registration`,
    title: {
      en: "Apply at your Bezirksamt (you file)",
      fr: "Déposer auprès du Bezirksamt (vous déposez)",
    },
    instruction: {
      en: "Submit Genehmigung, Anzeige or related ZwVbG paperwork to the Bezirksamt for your Bezirk, in person or as the district instructs. Use service.berlin.de and Senate forms for the current process. If you already have a Berlin registration number, enter it in Host Registry and mark permit type accordingly while the EU-aligned digital issuance remains in test. New hosts should not assume the digital EU number portal is open yet.",
      fr: "Déposez Genehmigung, Anzeige ou pièces ZwVbG au Bezirksamt de votre Bezirk, selon les modalités du district. Utilisez service.berlin.de et les formulaires du Sénat. Si vous avez déjà un numéro berlinois, saisissez-le dans Host Registry pendant que la délivrance numérique UE reste en test. Les nouveaux hôtes ne doivent pas supposer que le portail numérique est ouvert.",
    },
    officialUrls: [
      {
        url: BERLIN_SERVICE_ZWVB_URL,
        label: {
          en: "service.berlin.de: Zweckentfremdung",
          fr: "service.berlin.de : Zweckentfremdung",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: BERLIN_ZWVB_FORMS_URL,
        label: {
          en: "Official forms and legal texts",
          fr: "Formulaires et textes officiels",
        },
        role: "form",
        urlVerified: true,
      },
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028: platform verification",
          fr: "UE 2024/1028 : vérification plateformes",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Bezirksamt confirmation", "Registration number when issued"],
      fr: ["Confirmation Bezirksamt", "Numéro une fois délivré"],
    },
    fieldHints: ["address", "city"],
  }),

  storeInGlint: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-store-registration`,
    title: {
      en: "Store registration number in Host Registry",
      fr: "Enregistrer le numéro dans Host Registry",
    },
    instruction: {
      en: "Enter your Berlin ZwVbG registration number in Glint Host Registry. Track status, EU transition deadline if set, operator category, permit type and whether the number is displayed on each OTA.",
      fr: "Saisissez votre numéro ZwVbG berlinois dans Glint Host Registry. Suivez le statut, l'échéance de transition UE, la catégorie d'exploitant, le type de permis et l'affichage sur chaque OTA.",
    },
    officialUrls: [],
    documents: {
      en: ["Registration number"],
      fr: ["Numéro d'enregistrement"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  displayRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-de-registration`,
    title: {
      en: "Display registration number on all listings",
      fr: "Afficher le numéro sur toutes les annonces",
    },
    instruction: {
      en: "Add the Berlin registration number to Airbnb, Booking.com and every OTA listing. Platforms must verify numbers under EU 2024/1028 where registration exists. Keep using your existing Berlin number until the Senate publishes new digital EU-aligned numbers.",
      fr: "Ajoutez le numéro berlinois sur Airbnb, Booking.com et toutes les OTA. Les plateformes doivent vérifier les numéros au titre de l'UE 2024/1028. Conservez votre numéro berlinois existant jusqu'à publication des nouveaux numéros numériques alignés UE.",
    },
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028: listing display",
          fr: "UE 2024/1028 : affichage annonces",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Berlin registration number"],
      fr: ["Numéro d'enregistrement berlinois"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  confirmMunichStr: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-confirm-str`,
    title: {
      en: "Confirm Munich ZeS short-term letting",
      fr: "Confirmer une LCD soumise au ZeS à Munich",
    },
    instruction: {
      en: "Munich's Wohnraumzweckentfremdungssatzung (ZeS) governs tourist use of housing. §5a requires registration before offering platform STRs and displaying the registration number on listings once issued. Whole-unit tourist use above roughly eight weeks per year typically needs a Zweckentfremdung Genehmigung from the Sozialreferat. Confirm this unit is a platform STR in Munich and note room vs whole unit before dossier prep.",
      fr: "La Wohnraumzweckentfremdungssatzung (ZeS) munichoise régit l'usage touristique du logement. Le §5a impose l'enregistrement avant toute LCD sur plateforme et l'affichage du numéro une fois délivré. L'usage touristique d'un logement entier au-delà d'environ huit semaines par an exige en principe une Genehmigung Zweckentfremdung du Sozialreferat. Confirmez une LCD sur plateforme à Munich et chambre vs logement entier avant le dossier.",
    },
    officialUrls: [
      {
        url: MUNICH_ZES_URL,
        label: {
          en: "Munich ZeS (incl. §5a)",
          fr: "ZeS Munich (incl. §5a)",
        },
        role: "rules",
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
      en: ["Property address in Munich", "Listing platform URLs", "Host identity"],
      fr: ["Adresse du bien à Munich", "URL des annonces plateforme", "Identité de l'hôte"],
    },
    fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
  }),

  munichUnitType: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-munich-unit`,
    title: {
      en: "Room vs whole unit in Munich",
      fr: "Chambre vs logement entier à Munich",
    },
    instruction: {
      en: "Select whether you rent a private room or the whole apartment on platforms. The eight-week Zweckentfremdung threshold and Genehmigung path mainly concern whole-unit tourist use. Private rooms still fall under §5a registration once the city portal opens.",
      fr: "Indiquez si vous louez une chambre privée ou le logement entier sur les plateformes. Le seuil d'environ huit semaines et la Genehmigung Zweckentfremdung concernent surtout le logement entier. Les chambres restent soumises au §5a une fois le portail municipal ouvert.",
    },
    officialUrls: [
      {
        url: MUNICH_STR_REGISTRATION_INFOBLATT_URL,
        label: {
          en: "Munich infoblatt: Kurzzeitvermietung registration",
          fr: "Infoblatt Munich : enregistrement LCD",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Rental layout (room vs whole unit)", "Floor plan if available"],
      fr: ["Configuration (chambre vs entier)", "Plan si disponible"],
    },
    fieldHints: ["address", "city", "propertyType"],
  }),

  munichDossier: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-dossier`,
    title: {
      en: "Gather ZeS dossier for Sozialreferat",
      fr: "Constituer le dossier ZeS pour le Sozialreferat",
    },
    instruction: {
      en: "Prepare documents for Zweckentfremdung Genehmigung when whole-unit tourist use may exceed about eight weeks per year: address, host identity, rental layout, platform listings. Track §5a registration readiness: as of late September 2026 the Sozialreferat is still preparing the IT registration portal. You cannot obtain a Munich registration number online today. Glint tracks readiness, Genehmigung path and portal status only. You file with the city yourself when channels open.",
      fr: "Préparez les pièces pour une Genehmigung Zweckentfremdung si l'usage touristique du logement entier peut dépasser environ huit semaines par an : adresse, identité, configuration, annonces. Suivez le §5a : fin septembre 2026, le Sozialreferat prépare encore le portail d'enregistrement. Vous ne pouvez pas obtenir un numéro munichois en ligne aujourd'hui. Glint suit la préparation, la Genehmigung et l'état du portail. Vous déposez auprès de la ville lorsque les canaux ouvrent.",
    },
    officialUrls: [
      {
        url: MUNICH_ZWECKENTFREMUNG_SERVICE_URL,
        label: {
          en: "stadt.muenchen.de: Zweckentfremdung service",
          fr: "stadt.muenchen.de : service Zweckentfremdung",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: MUNICH_STR_REGISTRATION_INFOBLATT_URL,
        label: {
          en: "Registration duty infoblatt (PDF)",
          fr: "Infoblatt obligation d'enregistrement (PDF)",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: MUNICH_ZES_URL,
        label: {
          en: "ZeS legal text",
          fr: "Texte ZeS",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Proof of address and lawful use",
        "Host ID or company extract",
        "Rental layout (room vs whole unit)",
        "Platform listing screenshots",
        "Genehmigung paperwork if whole unit >8 weeks/year",
      ],
      fr: [
        "Justificatif d'adresse et de droit d'usage",
        "Pièce d'identité ou extrait société",
        "Configuration chambre vs entier",
        "Captures d'annonces plateforme",
        "Dossier Genehmigung si logement entier >8 semaines/an",
      ],
    },
    pitfalls: {
      en: "Glint does not submit to Sozialreferat or city portals and does not issue government registration numbers. The §5a registration procedure is not live yet: do not claim hosts can register online today.",
      fr: "Glint ne dépose pas au Sozialreferat ni aux portails municipaux et ne délivre pas de numéros officiels. La procédure §5a n'est pas encore en ligne : n'annoncez pas un enregistrement en ligne aujourd'hui.",
    },
    fieldHints: ["name", "address", "city", "residencyStatus"],
  }),

  munichOfficialRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-official-registration`,
    title: {
      en: "Track §5a portal readiness (you file when live)",
      fr: "Suivre l'ouverture du portail §5a (vous déposez quand il est live)",
    },
    instruction: {
      en: "When the Munich registration portal opens, apply for your §5a registration number before listing on platforms and display it on every OTA. Until then, complete Zweckentfremdung Genehmigung if required and monitor Sozialreferat updates. Mark status awaiting_registration_portal in Host Registry while the IT portal is not live. Glint does not auto-register with the city.",
      fr: "Lorsque le portail munichois ouvrira, demandez votre numéro §5a avant de publier sur les plateformes et affichez-le sur chaque OTA. En attendant, finalisez la Genehmigung Zweckentfremdung si nécessaire et suivez les communications du Sozialreferat. Indiquez awaiting_registration_portal dans Host Registry tant que le portail n'est pas live. Glint n'enregistre pas automatiquement auprès de la ville.",
    },
    officialUrls: [
      {
        url: MUNICH_ZWECKENTFREMUNG_SERVICE_URL,
        label: {
          en: "Munich Zweckentfremdung service",
          fr: "Service Zweckentfremdung Munich",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: MUNICH_STR_REGISTRATION_INFOBLATT_URL,
        label: {
          en: "§5a registration infoblatt",
          fr: "Infoblatt enregistrement §5a",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028: platform verification",
          fr: "UE 2024/1028 : vérification plateformes",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["City confirmation when portal opens", "Registration number when issued"],
      fr: ["Confirmation ville à l'ouverture du portail", "Numéro une fois délivré"],
    },
    fieldHints: ["address", "city"],
  }),

  munichStoreInGlint: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-store-registration`,
    title: {
      en: "Store Munich registration number in Host Registry",
      fr: "Enregistrer le numéro munichois dans Host Registry",
    },
    instruction: {
      en: "Enter your Munich §5a registration number in Glint Host Registry once the Sozialreferat issues it. Track status, operator category, permit path (Genehmigung vs registration only) and whether the number is displayed on each OTA.",
      fr: "Saisissez votre numéro §5a munichois dans Glint Host Registry une fois délivré par le Sozialreferat. Suivez le statut, la catégorie d'exploitant, la voie Genehmigung vs enregistrement seul et l'affichage sur chaque OTA.",
    },
    officialUrls: [],
    documents: {
      en: ["Registration number"],
      fr: ["Numéro d'enregistrement"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  munichDisplayRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-de-registration`,
    title: {
      en: "Display registration number on all listings",
      fr: "Afficher le numéro sur toutes les annonces",
    },
    instruction: {
      en: "Add the Munich registration number to Airbnb, Booking.com and every OTA listing as required by §5a and EU 2024/1028. Platforms must verify numbers where registration exists.",
      fr: "Ajoutez le numéro munichois sur Airbnb, Booking.com et toutes les OTA comme l'exige le §5a et l'UE 2024/1028. Les plateformes doivent vérifier les numéros lorsque l'enregistrement existe.",
    },
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EU 2024/1028: listing display",
          fr: "UE 2024/1028 : affichage annonces",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Munich registration number"],
      fr: ["Numéro d'enregistrement munichois"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  federalStateSelection: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-de-federal-state`,
    title: {
      en: "Confirm Germany state / city",
      fr: "Confirmer l'État / la ville en Allemagne",
    },
    instruction: {
      en: "Germany has no single national STR registration number. Berlin ZwVbG applies in the capital; Munich ZeS and §5a apply in Bavaria's capital; other Länder and cities have their own rules. Select your city in Glint to unlock the Berlin or Munich playbook when applicable.",
      fr: "L'Allemagne n'a pas de numéro national unique pour les LCD. Le ZwVbG berlinois s'applique dans la capitale ; le ZeS et le §5a s'appliquent à Munich ; les autres Länder ont leurs propres règles. Sélectionnez votre ville dans Glint pour charger le playbook Berlin ou Munich le cas échéant.",
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

export const GERMANY_PLAYBOOKS: Playbook[] = [
  {
    id: "de-berlin",
    country: "Germany",
    city: "Berlin",
    title: {
      en: "Berlin: ZwVbG STR registration and EU transition",
      fr: "Berlin : enregistrement ZwVbG LCD et transition UE",
    },
    description: {
      en: "Bezirksamt approval, dossier tracking, existing Berlin numbers during delayed EU digital issuance, storage and platform display under EU 2024/1028.",
      fr: "Autorisation Bezirksamt, suivi dossier, numéros berlinois existants pendant le retard de délivrance numérique UE, stockage et affichage plateformes (UE 2024/1028).",
    },
    steps: [
      deSteps.confirmBerlinStr("berlin"),
      deSteps.berlinBezirk("berlin"),
      deSteps.berlinDossier("berlin"),
      deSteps.officialRegistration("berlin"),
      deSteps.storeInGlint("berlin"),
      deSteps.displayRegistration("berlin"),
    ],
  },
  {
    id: "de-munich",
    country: "Germany",
    city: "Munich",
    title: {
      en: "Munich: ZeS STR registration and §5a readiness",
      fr: "Munich : enregistrement ZeS LCD et préparation §5a",
    },
    description: {
      en: "Zweckentfremdung Genehmigung when needed, §5a registration tracking while the city portal is not live, number storage and platform display under EU 2024/1028.",
      fr: "Genehmigung Zweckentfremdung si nécessaire, suivi §5a tant que le portail municipal n'est pas live, stockage du numéro et affichage plateformes (UE 2024/1028).",
    },
    steps: [
      deSteps.confirmMunichStr("munich"),
      deSteps.munichUnitType("munich"),
      deSteps.munichDossier("munich"),
      deSteps.munichOfficialRegistration("munich"),
      deSteps.munichStoreInGlint("munich"),
      deSteps.munichDisplayRegistration("munich"),
    ],
  },
  {
    id: "de-generic",
    country: "Germany",
    title: {
      en: "Germany: federal STR registration overview",
      fr: "Allemagne : vue d'ensemble enregistrement LCD",
    },
    description: {
      en: "No fake national number. Berlin ZwVbG and Munich ZeS readiness, EU 2024/1028 listing display; other cities vary. Glint guides dossier tracking. You submit on official portals.",
      fr: "Pas de numéro national fictif. Préparation ZwVbG à Berlin et ZeS à Munich, affichage UE 2024/1028 ; autres villes variables. Glint guide le dossier. Vous déposez sur les portails officiels.",
    },
    steps: [
      deSteps.federalStateSelection("de"),
      {
        key: "de-choose-local-path",
        title: {
          en: "Follow your city registration path",
          fr: "Suivre le parcours d'enregistrement local",
        },
        instruction: {
          en: "Berlin: ZwVbG with Bezirksamt approval and visible registration numbers on listings. EU-aligned digital numbers are delayed; keep existing Berlin numbers. Munich: ZeS §5a registration before platform listing once the city portal is live (not open as of late September 2026). Whole-unit tourist use above about eight weeks per year typically needs Zweckentfremdung Genehmigung. Other cities: check municipal and Landes rules. Update city in Glint to load the Berlin or Munich playbook when applicable.",
          fr: "Berlin : ZwVbG avec autorisation Bezirksamt et numéro visible sur les annonces. Numéros numériques alignés UE retardés ; conservez les numéros berlinois existants. Munich : enregistrement §5a ZeS avant annonce plateforme une fois le portail ouvert (pas encore live fin septembre 2026). Logement entier > environ huit semaines/an : Genehmigung Zweckentfremdung en principe. Autres villes : règles municipales et des Länder. Mettez à jour la ville dans Glint pour le playbook Berlin ou Munich.",
        },
        officialUrls: [
          {
            url: BERLIN_ZWVB_URL,
            label: { en: "Berlin ZwVbG overview", fr: "Vue d'ensemble ZwVbG Berlin" },
            role: "rules",
            urlVerified: true,
          },
          {
            url: MUNICH_ZES_URL,
            label: { en: "Munich ZeS overview", fr: "Vue d'ensemble ZeS Munich" },
            role: "rules",
            urlVerified: true,
          },
        ],
        documents: {
          en: ["Local registration number once issued"],
          fr: ["Numéro local une fois délivré"],
        },
        fieldHints: ["address", "city", "country"],
      },
      deSteps.displayRegistration("de"),
    ],
  },
];
