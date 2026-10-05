import type { Playbook, PlaybookStep } from "./types";
import {
  EU_1028_URL,
  GOV_IE_STL_REGISTER_PRESS_URL,
  DETE_STL_EXPLAINER_URL,
  FAILTE_STL_REGISTER_URL,
  FAILTE_STL_FAQ_URL,
  CITIZENS_INFO_STL_URL,
} from "@/lib/ireland/official-links";

const ieSteps = {
  confirmScope: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-scope`,
    title: {
      en: "Confirm the unit is in scope for the STL register",
      fr: "Confirmer que le logement entre dans le registre LCD",
    },
    instruction: {
      en: "Ireland's national short-term letting (STL) register applies to paid accommodation for stays up to and including 21 nights. Each unit is registered separately. Fáilte Ireland lists exclusions including hotels, apartment hotels, hostels and camping, RV or trailer parks. Citizens Information also lists motels and guesthouses among excluded types. Being on the STL register is not Fáilte Quality Assured; self-catering under the Welcome Standard must still register. Confirm this listing is in scope before preparing your dossier.",
      fr: "Le registre national irlandais des locations de courte durée (LCD) couvre l'hébergement payant pour des séjours jusqu'à 21 nuits incluses. Chaque logement est enregistré séparément. Fáilte Ireland cite parmi les exclusions hôtels, résidences hôtelières, auberges de jeunesse et campings ou parcs pour camping-cars. Citizens Information cite aussi motels et maisons d'hôtes. L'inscription au registre LCD n'est pas l'assurance qualité Fáilte ; l'auto-hébergement sous le Welcome Standard doit quand même s'inscrire. Confirmez que cette annonce est concernée avant de préparer le dossier.",
    },
    officialUrls: [
      {
        url: DETE_STL_EXPLAINER_URL,
        label: {
          en: "DETE: short-term letting in Ireland",
          fr: "DETE : location de courte durée en Irlande",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: FAILTE_STL_REGISTER_URL,
        label: { en: "Fáilte Ireland STL register page", fr: "Page registre LCD Fáilte Ireland" },
        role: "portal",
        urlVerified: true,
      },
      {
        url: FAILTE_STL_FAQ_URL,
        label: { en: "Fáilte Ireland STL FAQ", fr: "FAQ registre LCD Fáilte Ireland" },
        role: "info",
        urlVerified: true,
      },
      {
        url: CITIZENS_INFO_STL_URL,
        label: { en: "Citizens Information: exclusions", fr: "Citizens Information : exclusions" },
        role: "rules",
        urlVerified: true,
      },
      {
        url: EU_1028_URL,
        label: { en: "EU Regulation 2024/1028", fr: "Règlement UE 2024/1028" },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Property address", "Listing platform URLs", "Unit type"],
      fr: ["Adresse du bien", "URL des annonces", "Type de logement"],
    },
    fieldHints: ["address", "city", "country", "propertyType"],
  }),

  planningPosition: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-planning`,
    title: {
      en: "Check planning position with your local authority",
      fr: "Vérifier la situation urbanistique auprès de l'autorité locale",
    },
    instruction: {
      en: "Fáilte Ireland has no planning role. Planning is for your local authority. Under the 2019 regulations still in force today, a short-term let is under 14 days. In Rent Pressure Zones, planning permission (change of use) may be needed for second properties or letting your whole principal private residence for more than 90 days per year while you are away. Exempt principal-private-residence hosts must file Form 15 (within 4 weeks of the year start and at least 2 weeks before the first let), Form 16 (within 2 weeks after reaching 90 days) and Form 17 (between 1 and 28 January of the following year), with proof of principal private residence. A proposed new planning regime (STL under 21 days) is announced only and not yet law. Under that proposal, hosts in towns over 20,000 population would confirm planning compliance at registration, while towns of 20,000 or fewer would have two years to meet planning compliance. Glint tracks readiness and reminders. You file with your local authority.",
      fr: "Fáilte Ireland n'a pas de rôle en urbanisme. L'urbanisme relève de votre autorité locale. Sous le règlement de 2019 toujours en vigueur, une LCD dure moins de 14 jours. Dans les zones de pression locative, un permis (changement d'usage) peut être requis pour un second bien ou la location entière de votre résidence principale privée plus de 90 jours par an pendant votre absence. Les hôtes exemptés en résidence principale privée doivent déposer le formulaire 15 (dans les 4 semaines suivant le début d'année et au moins 2 semaines avant la première location), le formulaire 16 (dans les 2 semaines après 90 jours) et le formulaire 17 (entre le 1er et le 28 janvier de l'année suivante), avec justificatif de résidence principale privée. Un nouveau régime urbanistique (LCD moins de 21 jours) est annoncé seulement et n'est pas encore loi. Ce projet prévoit, pour les villes de plus de 20 000 habitants, une confirmation de conformité urbanistique à l'inscription, et deux ans pour les villes de 20 000 habitants ou moins. Glint suit la préparation et les rappels. Vous déposez auprès de l'autorité locale.",
    },
    officialUrls: [
      {
        url: CITIZENS_INFO_STL_URL,
        label: {
          en: "Citizens Information: short-term lets and Forms 15/16/17",
          fr: "Citizens Information : LCD et formulaires 15/16/17",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: DETE_STL_EXPLAINER_URL,
        label: {
          en: "DETE explainer (register vs planning)",
          fr: "Note DETE (registre vs urbanisme)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "Local authority contact",
        "Planning permission or exemption proof",
        "Principal private residence proof if claiming exemption",
      ],
      fr: [
        "Contact autorité locale",
        "Permis ou preuve d'exemption",
        "Justificatif de résidence principale privée si exemption",
      ],
    },
    fieldHints: ["address", "city", "residencyStatus"],
  }),

  registerData: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-register-data`,
    title: {
      en: "Prepare Fáilte Ireland register data",
      fr: "Préparer les données pour le registre Fáilte Ireland",
    },
    instruction: {
      en: "Gather the data you will enter on the Fáilte Ireland portal when it opens: for individuals, full name, email, phone, PPSN, date of birth, country of residence and host address including Eircode. For companies, business name, company number, business email, country of business residence, registered address and legal representative with phone. For the unit: full address including Eircode, unit type, whether you let part or all of a primary or secondary residence or other accommodation, maximum guests and bed places. enterprise.gov.ie states a nominal annual registration fee will apply; the amount is not yet published. Agents cannot register on behalf of a host unless the unit belongs to a company. Property managers should plan company registration paths or host-led filing. Glint stores your readiness fields. You submit on the official portal.",
      fr: "Rassemblez les données pour le portail Fáilte Ireland à l'ouverture : pour un particulier, nom complet, e-mail, téléphone, PPSN, date de naissance, pays de résidence et adresse de l'hôte avec Eircode. Pour une société, nom commercial, numéro d'entreprise, e-mail professionnel, pays du siège, adresse enregistrée et représentant légal avec téléphone. Pour le logement : adresse complète avec Eircode, type, location partielle ou totale d'une résidence principale ou secondaire ou autre hébergement, nombre maximal de voyageurs et de couchages. enterprise.gov.ie indique des frais d'inscription annuels nominaux ; le montant n'est pas encore publié. Un agent ne peut pas inscrire au nom d'un hôte sauf si le logement appartient à une société. Les gestionnaires doivent prévoir une inscription société ou un dépôt par l'hôte. Glint conserve vos champs de préparation. Vous déposez sur le portail officiel.",
    },
    officialUrls: [
      {
        url: FAILTE_STL_FAQ_URL,
        label: { en: "Fáilte Ireland STL FAQ (data fields)", fr: "FAQ Fáilte (champs de données)" },
        role: "info",
        urlVerified: true,
      },
      {
        url: DETE_STL_EXPLAINER_URL,
        label: { en: "DETE: what hosts must provide", fr: "DETE : informations requises" },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["PPSN or company number", "Eircode", "Capacity details"],
      fr: ["PPSN ou numéro d'entreprise", "Eircode", "Capacité d'accueil"],
    },
    fieldHints: ["name", "address", "city", "residencyStatus"],
  }),

  selfDeclaration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-self-declaration`,
    title: {
      en: "Self-declaration readiness (planning, building, fire safety)",
      fr: "Préparation à l'auto-déclaration (urbanisme, bâtiment, incendie)",
    },
    instruction: {
      en: "At registration you must make a legal self-declaration that the unit meets statutory obligations, including planning, building and fire safety. No documents are uploaded at registration; Fáilte Ireland may contact you afterwards. Citizens Information notes that hosts and platforms can face fines for non-compliance, but official sources read do not publish penalty amounts. Use your local authority planning position and property checks before you tick the declaration on the portal. Glint does not submit the declaration for you.",
      fr: "À l'inscription, vous devez signer une auto-déclaration légale que le logement respecte les obligations légales, dont l'urbanisme, le bâtiment et la sécurité incendie. Aucun document n'est téléversé à l'inscription ; Fáilte Ireland peut vous contacter ensuite. Citizens Information indique que hôtes et plateformes peuvent encourir des amendes en cas de non-conformité, sans montants publiés dans les sources officielles consultées. Vérifiez votre situation urbanistique et le logement avant de cocher la déclaration sur le portail. Glint ne dépose pas la déclaration pour vous.",
    },
    officialUrls: [
      {
        url: CITIZENS_INFO_STL_URL,
        label: {
          en: "Citizens Information: obligations and declaration",
          fr: "Citizens Information : obligations et déclaration",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: FAILTE_STL_FAQ_URL,
        label: { en: "Fáilte Ireland FAQ", fr: "FAQ Fáilte Ireland" },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Planning status notes", "Fire safety checklist", "Building compliance notes"],
      fr: ["Notes urbanisme", "Checklist incendie", "Notes conformité bâtiment"],
    },
    fieldHints: ["notes", "address", "city"],
  }),

  officialRegistration: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-official-registration`,
    title: {
      en: "Register on the Fáilte Ireland STL portal (when open)",
      fr: "S'inscrire sur le portail LCD Fáilte Ireland (à l'ouverture)",
    },
    instruction: {
      en: "As of October 2026, failteireland.ie states registration is not yet open and that the portal will open once the Short Term Letting and Tourism Bill has passed (no date on that page). The government announced, via gov.ie (updated 6 August 2026) and enterprise.gov.ie, that the register would open on 1 December 2026 with a legal obligation to register by 31 December 2026. Treat those dates as announced targets until the bill passes and Fáilte confirms the portal is live. A nominal annual fee will apply; the amount is not yet published. You receive one STL registration number per unit. Glint tracks readiness only. You file on failteireland.ie yourself.",
      fr: "En octobre 2026, failteireland.ie indique que l'inscription n'est pas encore ouverte et que le portail ouvrira une fois le Short Term Letting and Tourism Bill adopté (pas de date sur cette page). Le gouvernement a annoncé, via gov.ie (mis à jour le 6 août 2026) et enterprise.gov.ie, une ouverture le 1er décembre 2026 et une obligation légale d'inscription avant le 31 décembre 2026. Considérez ces dates comme des objectifs annoncés jusqu'à adoption du texte et confirmation par Fáilte que le portail est live. Des frais annuels nominaux s'appliqueront ; le montant n'est pas encore publié. Vous recevez un numéro LCD par logement. Glint suit la préparation seulement. Vous déposez vous-même sur failteireland.ie.",
    },
    officialUrls: [
      {
        url: FAILTE_STL_REGISTER_URL,
        label: { en: "Fáilte Ireland STL register", fr: "Registre LCD Fáilte Ireland" },
        role: "portal",
        urlVerified: true,
      },
      {
        url: GOV_IE_STL_REGISTER_PRESS_URL,
        label: {
          en: "gov.ie: register from December 2026",
          fr: "gov.ie : registre à partir de décembre 2026",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: DETE_STL_EXPLAINER_URL,
        label: { en: "DETE explainer", fr: "Note DETE" },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Prepared host and unit data", "Payment method when fee is published"],
      fr: ["Données hôte et logement préparées", "Moyen de paiement quand les frais seront publiés"],
    },
    pitfalls: {
      en: "Glint does not submit to Fáilte Ireland or local authorities and does not issue STL numbers.",
      fr: "Glint ne dépose pas auprès de Fáilte Ireland ni des autorités locales et ne délivre pas de numéros LCD.",
    },
    fieldHints: ["name", "address", "city"],
  }),

  storeNumber: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-store-stl-number`,
    title: {
      en: "Store your STL number in Host Registry",
      fr: "Enregistrer votre numéro LCD dans Host Registry",
    },
    instruction: {
      en: "Enter the STL registration number issued for this unit in Glint Host Registry, with registration and renewal dates. Track status and whether the number appears on each OTA listing.",
      fr: "Saisissez le numéro LCD délivré pour ce logement dans Glint Host Registry, avec les dates d'inscription et de renouvellement. Suivez le statut et la présence du numéro sur chaque annonce OTA.",
    },
    officialUrls: [
      {
        url: FAILTE_STL_FAQ_URL,
        label: { en: "Fáilte Ireland FAQ (renewal)", fr: "FAQ Fáilte (renouvellement)" },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["STL registration number"],
      fr: ["Numéro d'enregistrement LCD"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  displayNumber: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-display-ie-stl-number`,
    title: {
      en: "Display the STL number on every listing and ad",
      fr: "Afficher le numéro LCD sur chaque annonce et publicité",
    },
    instruction: {
      en: "From 31 December 2026 (government-announced date on gov.ie and enterprise.gov.ie), platforms must facilitate and display your STL registration number on listings and advertisements. enterprise.gov.ie states platforms will run random checks, share monthly data with Fáilte Ireland, and Fáilte can order platforms to remove listings with an invalid or missing number. Add the number to Airbnb, Booking.com, direct booking pages and every channel. Regulation (EU) 2024/1028 also requires platform verification where registration exists.",
      fr: "À partir du 31 décembre 2026 (date annoncée par le gouvernement sur gov.ie et enterprise.gov.ie), les plateformes doivent faciliter et afficher votre numéro LCD sur les annonces et publicités. enterprise.gov.ie indique des contrôles aléatoires, un partage mensuel de données avec Fáilte Ireland, et la possibilité pour Fáilte d'ordonner le retrait d'annonces sans numéro valide. Ajoutez le numéro sur Airbnb, Booking.com, réservation directe et chaque canal. Le règlement (UE) 2024/1028 impose aussi la vérification par les plateformes lorsque l'enregistrement existe.",
    },
    officialUrls: [
      {
        url: GOV_IE_STL_REGISTER_PRESS_URL,
        label: {
          en: "gov.ie: platform display from 31 Dec 2026",
          fr: "gov.ie : affichage plateformes dès le 31 déc. 2026",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: EU_1028_URL,
        label: { en: "EU Regulation 2024/1028", fr: "Règlement UE 2024/1028" },
        role: "rules",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["STL registration number"],
      fr: ["Numéro LCD"],
    },
    fieldHints: ["name", "address", "city"],
  }),

  annualRenewal: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ie-renewal`,
    title: {
      en: "Annual STL register renewal",
      fr: "Renouvellement annuel du registre LCD",
    },
    instruction: {
      en: "Fáilte Ireland states registration is renewed annually. enterprise.gov.ie notes a nominal annual registration fee will apply (amount not yet published). If you do not renew, the number expires, the unit is removed from the register and the number becomes invalid. Fáilte sends reminders. Track your renewal due date in Glint and renew on the official portal yourself.",
      fr: "Fáilte Ireland indique un renouvellement annuel. enterprise.gov.ie mentionne des frais d'inscription annuels nominaux (montant non encore publié). Sans renouvellement, le numéro expire, le logement est retiré du registre et le numéro devient invalide. Fáilte envoie des rappels. Suivez l'échéance dans Glint et renouvelez sur le portail officiel vous-même.",
    },
    officialUrls: [
      {
        url: FAILTE_STL_FAQ_URL,
        label: { en: "Fáilte Ireland FAQ (annual renewal)", fr: "FAQ Fáilte (renouvellement annuel)" },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Renewal confirmation"],
      fr: ["Confirmation de renouvellement"],
    },
    fieldHints: ["name", "address", "city"],
  }),
};

const dublinSteps: PlaybookStep[] = [
  ieSteps.confirmScope("dublin"),
  ieSteps.planningPosition("dublin"),
  ieSteps.registerData("dublin"),
  ieSteps.selfDeclaration("dublin"),
  ieSteps.officialRegistration("dublin"),
  ieSteps.storeNumber("dublin"),
  ieSteps.displayNumber("dublin"),
  ieSteps.annualRenewal("dublin"),
];

const nationalSteps: PlaybookStep[] = [
  ieSteps.confirmScope("ie"),
  ieSteps.planningPosition("ie"),
  ieSteps.registerData("ie"),
  ieSteps.selfDeclaration("ie"),
  ieSteps.officialRegistration("ie"),
  ieSteps.storeNumber("ie"),
  ieSteps.displayNumber("ie"),
  ieSteps.annualRenewal("ie"),
];

export const IRELAND_PLAYBOOKS: Playbook[] = [
  {
    id: "ie-dublin",
    country: "Ireland",
    city: "Dublin",
    title: {
      en: "Dublin: Fáilte Ireland STL register readiness",
      fr: "Dublin : préparation au registre LCD Fáilte Ireland",
    },
    description: {
      en: "Fáilte STL register (portal not yet open as of Oct 2026; government announced Dec 2026 dates), local planning (2019 rules), dossier prep, portal filing when live, number display and annual renewal. Glint prepares and reminds. You file.",
      fr: "Registre LCD Fáilte (portail pas encore ouvert en oct. 2026 ; dates déc. 2026 annoncées par le gouvernement), urbanisme local (règles 2019), dossier, dépôt quand le portail sera live, affichage et renouvellement annuel. Glint prépare et rappelle. Vous déposez.",
    },
    steps: dublinSteps,
  },
  {
    id: "ie-national",
    country: "Ireland",
    title: {
      en: "Ireland: Fáilte Ireland STL register readiness",
      fr: "Irlande : préparation au registre LCD Fáilte Ireland",
    },
    description: {
      en: "National STL register for stays up to 21 nights, planning with your local authority, self-declaration, portal registration when Fáilte opens (government announced December 2026 targets), listing display and annual renewal.",
      fr: "Registre national LCD pour séjours jusqu'à 21 nuits, urbanisme local, auto-déclaration, inscription quand Fáilte ouvrira le portail (objectifs décembre 2026 annoncés par le gouvernement), affichage et renouvellement annuel.",
    },
    steps: nationalSteps,
  },
];
