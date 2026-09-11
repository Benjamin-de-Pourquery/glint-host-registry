import type { Playbook } from "./types";

export const SPAIN_PLAYBOOK: Playbook = {
  id: "es-generic",
  country: "Spain",
  title: {
    en: "Spain — tourist accommodation registration",
    fr: "Espagne — enregistrement hébergement touristique",
  },
  description: {
    en: "Country-level guide for Spanish regional tourist registry requirements. Procedures vary by autonomous community — verify locally.",
    fr: "Guide au niveau national pour les exigences d'enregistrement touristique en Espagne. Les procédures varient par communauté autonome — vérifiez localement.",
  },
  steps: [
    {
      key: "es-verify-regional",
      title: {
        en: "Identify your regional requirements",
        fr: "Identifier les exigences régionales",
      },
      instruction: {
        en: "Spain delegates STR rules to autonomous communities and municipalities. Check whether your property needs a tourist license (licencia/vivienda de uso turístico).",
        fr: "L'Espagne délègue la réglementation aux communautés autonomes et municipalités. Vérifiez si votre bien nécessite une licence touristique.",
      },
      officialUrls: [
        {
          url: "https://www.mivau.gob.es/",
          label: {
            en: "Ministry of Housing — verify regional links",
            fr: "Ministère du Logement — vérifier les liens régionaux",
          },
          role: "info",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Property address", "Regional autonomous community"],
        fr: ["Adresse du bien", "Communauté autonome"],
      },
      fieldHints: ["address", "city", "country"],
    },
    {
      key: "es-municipal-register",
      title: {
        en: "Register with local authority",
        fr: "S'inscrire auprès de l'autorité locale",
      },
      instruction: {
        en: "Submit your tourist accommodation registration to the competent municipality or regional portal. Obtain your registration number for platform listings.",
        fr: "Déposez votre enregistrement d'hébergement touristique auprès de la municipalité ou du portail régional compétent. Obtenez votre numéro pour les annonces.",
      },
      officialUrls: [
        {
          url: "https://sede.administracionespublicas.gob.es/",
          label: {
            en: "Spanish public administration portal",
            fr: "Portail administration publique espagnole",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["NIE/NIF", "Property deed or rental contract", "Energy certificate if required"],
        fr: ["NIE/NIF", "Titre de propriété ou contrat de location", "Certificat énergétique si requis"],
      },
      fieldHints: ["name", "address", "city", "country", "propertyType"],
    },
    {
      key: "es-tax-obligations",
      title: {
        en: "Declare rental income and local taxes",
        fr: "Déclarer les revenus locatifs et taxes locales",
      },
      instruction: {
        en: "Register with tax authorities (AEAT) and pay applicable tourist taxes (e.g. tasa turística) in your municipality.",
        fr: "Immatriculez-vous auprès du fisc (AEAT) et acquittez les taxes touristiques locales applicables.",
      },
      officialUrls: [
        {
          url: "https://www.agenciatributaria.es/",
          label: {
            en: "Agencia Tributaria (AEAT)",
            fr: "Agencia Tributaria (AEAT)",
          },
          role: "tax",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Registration number", "IBAN", "Estimated rental income"],
        fr: ["Numéro d'enregistrement", "IBAN", "Revenus locatifs estimés"],
      },
      fieldHints: ["address", "city"],
    },
    {
      key: "es-update-platforms",
      title: {
        en: "Update platform listings with registration number",
        fr: "Mettre à jour les annonces avec le numéro d'enregistrement",
      },
      instruction: {
        en: "Add your official registration or license number to all booking platforms as required under EU 2024/1028.",
        fr: "Ajoutez votre numéro d'enregistrement officiel sur toutes les plateformes conformément au règlement UE 2024/1028.",
      },
      officialUrls: [
        {
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028",
          label: {
            en: "EU Regulation 2024/1028",
            fr: "Règlement UE 2024/1028",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Registration/license number"],
        fr: ["Numéro d'enregistrement/licence"],
      },
      fieldHints: ["name", "notes"],
    },
  ],
};

export const ITALY_PLAYBOOK: Playbook = {
  id: "it-generic",
  country: "Italy",
  title: {
    en: "Italy — short-term rental (locazione turistica)",
    fr: "Italie — location courte durée (locazione turistica)",
  },
  description: {
    en: "Country-level guide for Italian CIR/SCIA and regional STR requirements. Rules differ significantly by region and municipality.",
    fr: "Guide national pour les exigences CIR/SCIA et location courte durée en Italie. Les règles varient fortement par région et commune.",
  },
  steps: [
    {
      key: "it-verify-regional",
      title: {
        en: "Check regional and municipal rules",
        fr: "Vérifier les règles régionales et municipales",
      },
      instruction: {
        en: "Confirm whether your property requires CIR registration, SCIA, or regional portal enrollment. Rome, Milan, Florence, and others have specific caps and zones.",
        fr: "Confirmez si votre bien nécessite un enregistrement CIR, une SCIA ou une inscription au portail régional.",
      },
      officialUrls: [
        {
          url: "https://www.ministeroturismo.gov.it/",
          label: {
            en: "Ministry of Tourism — verify regional guidance",
            fr: "Ministère du Tourisme — vérifier les orientations régionales",
          },
          role: "info",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Property address and cadastral data", "Co-ownership rules if applicable"],
        fr: ["Adresse et données cadastrales", "Règlement de copropriété le cas échéant"],
      },
      fieldHints: ["address", "city", "country", "propertyType"],
    },
    {
      key: "it-cir-registration",
      title: {
        en: "Obtain CIR / regional registration code",
        fr: "Obtenir le code CIR / enregistrement régional",
      },
      instruction: {
        en: "Apply for your Regional Identification Code (CIR) or equivalent through your region's BDSR portal or municipal office.",
        fr: "Demandez votre Code d'Identification Régional (CIR) ou équivalent via le portail BDSR régional ou la mairie.",
      },
      officialUrls: [
        {
          url: "https://www.bdsr.it/",
          label: {
            en: "National BDSR portal (verify regional access)",
            fr: "Portail BDSR national (vérifier l'accès régional)",
          },
          role: "portal",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Codice fiscale", "Property ownership proof", "Floor plan if required"],
        fr: ["Codice fiscale", "Justificatif de propriété", "Plan si requis"],
      },
      fieldHints: ["name", "address", "city", "country"],
    },
    {
      key: "it-tax-communication",
      title: {
        en: "Communicate rental activity to Agenzia delle Entrate",
        fr: "Communiquer l'activité locative à l'Agenzia delle Entrate",
      },
      instruction: {
        en: "Submit the required communication (comunicazione) for short-term rental activity and pay local tourist tax (imposta di soggiorno) where applicable.",
        fr: "Soumettez la communication requise pour la location courte durée et payez la taxe de séjour locale le cas échéant.",
      },
      officialUrls: [
        {
          url: "https://www.agenziaentrate.gov.it/",
          label: {
            en: "Agenzia delle Entrate",
            fr: "Agenzia delle Entrate",
          },
          role: "tax",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["CIR code", "IBAN", "Guest capacity"],
        fr: ["Code CIR", "IBAN", "Capacité d'accueil"],
      },
      fieldHints: ["address", "city", "propertyType"],
    },
    {
      key: "it-update-platforms",
      title: {
        en: "Display CIR on all listings",
        fr: "Afficher le CIR sur toutes les annonces",
      },
      instruction: {
        en: "Add your CIR or regional registration code to Airbnb, Booking.com, and other channels.",
        fr: "Ajoutez votre CIR ou code d'enregistrement régional sur Airbnb, Booking.com et autres canaux.",
      },
      officialUrls: [
        {
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028",
          label: {
            en: "EU Regulation 2024/1028",
            fr: "Règlement UE 2024/1028",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["CIR / registration code"],
        fr: ["Code CIR / enregistrement"],
      },
      fieldHints: ["name", "notes"],
    },
  ],
};

export const NETHERLANDS_PLAYBOOK: Playbook = {
  id: "nl-generic",
  country: "Netherlands",
  title: {
    en: "Netherlands — holiday rental compliance",
    fr: "Pays-Bas — conformité location de vacances",
  },
  description: {
    en: "Country-level guide for Dutch municipalities with tourist rental registration (e.g. Amsterdam, Rotterdam). Rules vary by gemeente.",
    fr: "Guide national pour les municipalités néerlandaises avec enregistrement location touristique. Les règles varient par gemeente.",
  },
  steps: [
    {
      key: "nl-check-gemeente",
      title: {
        en: "Check your gemeente rules",
        fr: "Vérifier les règles de votre gemeente",
      },
      instruction: {
        en: "Many Dutch cities require registration and enforce night caps or bans in certain zones. Verify rules for your address before listing.",
        fr: "De nombreuses villes néerlandaises exigent un enregistrement et appliquent des plafonds de nuitées ou interdictions par zone.",
      },
      officialUrls: [
        {
          url: "https://www.rijksoverheid.nl/themas/bouwen-en-wonen/woning-verhuren/woningverhuur-toeristen",
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
    {
      key: "nl-municipal-register",
      title: {
        en: "Register with your municipality",
        fr: "S'inscrire auprès de votre municipalité",
      },
      instruction: {
        en: "Apply for a registration number through your gemeente's portal (e.g. Amsterdam Toeristenbelasting registration).",
        fr: "Demandez un numéro d'enregistrement via le portail de votre gemeente.",
      },
      officialUrls: [
        {
          url: "https://www.amsterdam.nl/en/housing/rent-out/home-sharing/",
          label: {
            en: "Amsterdam — home sharing (verify on official site; may block automated checks)",
            fr: "Amsterdam — home sharing (vérifier sur le site officiel)",
          },
          role: "portal",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["BSN/ID", "Proof of residence or ownership", "Bank account"],
        fr: ["BSN/pièce d'identité", "Justificatif de résidence ou propriété", "Compte bancaire"],
      },
      fieldHints: ["name", "address", "city", "country", "propertyType"],
    },
    {
      key: "nl-tourist-tax",
      title: {
        en: "Register for tourist tax (toeristenbelasting)",
        fr: "S'inscrire à la taxe de séjour (toeristenbelasting)",
      },
      instruction: {
        en: "Register with your municipality to collect and remit tourist tax on overnight stays.",
        fr: "Inscrivez-vous auprès de votre municipalité pour collecter et reverser la taxe de séjour.",
      },
      officialUrls: [
        {
          url: "https://www.belastingdienst.nl/",
          label: {
            en: "Belastingdienst — tax authority",
            fr: "Belastingdienst — administration fiscale",
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
    },
    {
      key: "nl-update-platforms",
      title: {
        en: "Add registration number to listings",
        fr: "Ajouter le numéro d'enregistrement aux annonces",
      },
      instruction: {
        en: "Display your municipal registration number on all booking platforms.",
        fr: "Affichez votre numéro d'enregistrement municipal sur toutes les plateformes.",
      },
      officialUrls: [
        {
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028",
          label: {
            en: "EU Regulation 2024/1028",
            fr: "Règlement UE 2024/1028",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Municipal registration number"],
        fr: ["Numéro d'enregistrement municipal"],
      },
      fieldHints: ["name", "notes"],
    },
  ],
};
