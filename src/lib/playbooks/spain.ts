import type { Playbook, PlaybookStep } from "./types";

const SES_PORTAL_URL = "https://hospedajes.ses.mir.es/hospedajes-web/";
const SES_PORTAL_TEST_URL = "https://hospedajes.pre-ses.mir.es/hospedajes-web/";
const RD_933_URL =
  "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17461";
const EU_1028_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028";
const MIVAU_URL = "https://www.mivau.gob.es/";

const esSteps = {
  postNruaContext: (): PlaybookStep => ({
    key: "es-post-nrua-context",
    title: {
      en: "Understand post-STS 620/2026 registration landscape",
      fr: "Comprendre le cadre post-STS 620/2026",
    },
    instruction: {
      en: "Spain's Supreme Court (STS 620/2026, May 2026) annulled the national NRUA short-let register. You still need your regional tourism number (VFT/HUT/ETV/VUT/VV/VT) on listings, VUDA/platform data-sharing obligations remain, and guest reporting to SES.HOSPEDAJES (or regional equivalent) is still mandatory within 24h of check-in under RD 933/2021.",
      fr: "Le Tribunal suprême espagnol (STS 620/2026, mai 2026) a annulé le registre national NRUA. Vous devez toujours afficher votre numéro touristique régional (VFT/HUT/ETV/VUT/VV/VT), les obligations VUDA/partage plateformes restent, et la déclaration voyageurs SES.HOSPEDAJES (ou équivalent régional) reste obligatoire sous 24h après l'arrivée (RD 933/2021).",
    },
    officialUrls: [
      {
        url: RD_933_URL,
        label: {
          en: "RD 933/2021 — guest reporting obligation",
          fr: "RD 933/2021 — obligation déclaration voyageurs",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: MIVAU_URL,
        label: {
          en: "Ministry of Housing — regional tourism registers",
          fr: "Ministère du Logement — registres touristiques régionaux",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Regional tourism licence number", "Property address", "NIE/NIF"],
      fr: ["Numéro licence touristique régionale", "Adresse du bien", "NIE/NIF"],
    },
    fieldHints: ["address", "city", "country", "notes"],
  }),

  regionalLicense: (cityKey: string, regionName: { en: string; fr: string }): PlaybookStep => ({
    key: `${cityKey}-regional-license`,
    title: {
      en: "Obtain regional tourist accommodation number",
      fr: "Obtenir le numéro d'hébergement touristique régional",
    },
    instruction: {
      en: `Register your short-term rental with ${regionName.en} authorities and obtain your VFT/HUT/ETV/VUT number. Display it on all platform listings as required under EU 2024/1028.`,
      fr: `Enregistrez votre location courte durée auprès des autorités de ${regionName.fr} et obtenez votre numéro VFT/HUT/ETV/VUT. Affichez-le sur toutes les plateformes conformément au règlement UE 2024/1028.`,
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
      en: ["NIE/NIF", "Property deed or rental contract", "Energy certificate (if required)"],
      fr: ["NIE/NIF", "Titre de propriété ou contrat", "Certificat énergétique (si requis)"],
    },
    fieldHints: ["name", "address", "city", "country", "propertyType"],
  }),

  sesHospedajes: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-ses-hospedajes`,
    title: {
      en: "Declare guests to SES.HOSPEDAJES within 24h",
      fr: "Déclarer les voyageurs à SES.HOSPEDAJES sous 24h",
    },
    instruction: {
      en: "Report each guest to the Ministry of Interior SES portal within 24 hours of check-in (RD 933/2021). Configure your SOAP credentials in Glint Register tab, collect Annex I guest data via check-in link, then prepare and submit (or dry-run) from the guest stay.",
      fr: "Déclarez chaque voyageur au portail SES du Ministère de l'Intérieur sous 24h après l'arrivée (RD 933/2021). Configurez vos identifiants SOAP dans l'onglet Registre Glint, collectez les données Annexe I via le lien check-in, puis préparez et soumettez (ou simulez) depuis le séjour.",
    },
    officialUrls: [
      {
        url: SES_PORTAL_URL,
        label: {
          en: "SES.HOSPEDAJES portal (Spanish only)",
          fr: "Portail SES.HOSPEDAJES (espagnol uniquement)",
        },
        role: "portal",
        urlVerified: true,
      },
      {
        url: SES_PORTAL_TEST_URL,
        label: {
          en: "SES test environment (pre-production)",
          fr: "Environnement test SES (pré-production)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: [
        "SES landlord code (código arrendador)",
        "WS username and password",
        "Establishment code (código establecimiento)",
        "Guest ID document, nationality, address",
      ],
      fr: [
        "Code arrendador SES",
        "Identifiant et mot de passe WS",
        "Code établissement",
        "Document d'identité, nationalité, adresse voyageur",
      ],
    },
    timeline: {
      en: "Within 24 hours of each check-in.",
      fr: "Sous 24 heures après chaque arrivée.",
    },
    pitfalls: {
      en: "Catalonia and Basque Country use regional systems — not SES. The SES portal has no English UI; Glint automates SOAP submission.",
      fr: "Catalogne et Pays basque utilisent des systèmes régionaux — pas SES. Le portail SES n'a pas d'interface anglaise ; Glint automatise l'envoi SOAP.",
    },
    fieldHints: ["name", "address", "city", "country"],
  }),

  taxObligations: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-tax-obligations`,
    title: {
      en: "Declare rental income and local tourist tax",
      fr: "Déclarer revenus locatifs et taxe de séjour",
    },
    instruction: {
      en: "Register with AEAT for rental income and pay applicable tourist taxes (tasa turística / impuesto sobre estancias) in your municipality.",
      fr: "Immatriculez-vous auprès de l'AEAT pour les revenus locatifs et acquittez les taxes touristiques locales applicables.",
    },
    officialUrls: [
      {
        url: "https://www.agenciatributaria.es/",
        label: {
          en: "Agencia Tributaria (AEAT)",
          fr: "Agencia Tributaria (AEAT)",
        },
        role: "tax",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Regional registration number", "IBAN", "Estimated rental income"],
      fr: ["Numéro d'enregistrement régional", "IBAN", "Revenus locatifs estimés"],
    },
    fieldHints: ["address", "city"],
  }),

  updatePlatforms: (cityKey: string): PlaybookStep => ({
    key: `${cityKey}-update-platforms`,
    title: {
      en: "Update platform listings with regional number",
      fr: "Mettre à jour les annonces avec le numéro régional",
    },
    instruction: {
      en: "Add your regional tourism registration number to Airbnb, Booking.com, and other channels. NRUA is no longer required nationally, but regional numbers and VUDA compliance still apply.",
      fr: "Ajoutez votre numéro d'enregistrement touristique régional sur Airbnb, Booking.com et autres canaux. Le NRUA n'est plus requis au niveau national, mais les numéros régionaux et la conformité VUDA s'appliquent toujours.",
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
      en: ["Regional registration/license number"],
      fr: ["Numéro d'enregistrement/licence régional"],
    },
    fieldHints: ["name", "notes"],
  }),
};

export const SPAIN_MADRID_PLAYBOOK: Playbook = {
  id: "es-madrid",
  country: "Spain",
  city: "Madrid",
  sourceReviewedAt: "2026-09-12",
  title: {
    en: "Madrid — tourist rental & SES compliance",
    fr: "Madrid — location touristique et conformité SES",
  },
  description: {
    en: "Guided steps for Madrid Community short-term rentals: regional VUT registration, SES guest reporting, taxes, and platform updates.",
    fr: "Étapes guidées pour les locations courte durée à Madrid : enregistrement VUT régional, déclaration SES, taxes et mises à jour plateformes.",
  },
  steps: [
    esSteps.postNruaContext(),
    {
      ...esSteps.regionalLicense("madrid", { en: "Comunidad de Madrid", fr: "Communauté de Madrid" }),
      officialUrls: [
        {
          url: "https://www.comunidad.madrid/servicios/hacienda/registro-viviendas-uso-turistico",
          label: {
            en: "Madrid — VUT tourist housing register",
            fr: "Madrid — registre VUT hébergement touristique",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: EU_1028_URL,
          label: { en: "EU Regulation 2024/1028", fr: "Règlement UE 2024/1028" },
          role: "rules",
          urlVerified: true,
        },
      ],
    },
    esSteps.sesHospedajes("madrid"),
    esSteps.taxObligations("madrid"),
    esSteps.updatePlatforms("madrid"),
  ],
};

export const SPAIN_BARCELONA_PLAYBOOK: Playbook = {
  id: "es-barcelona",
  country: "Spain",
  city: "Barcelona",
  sourceReviewedAt: "2026-09-12",
  title: {
    en: "Barcelona — regional system (not SES)",
    fr: "Barcelone — système régional (pas SES)",
  },
  description: {
    en: "Barcelona is in Catalonia, which uses the Mossos d'Esquadra regional guest-reporting system — not SES.HOSPEDAJES. This playbook covers HUT registration and regional obligations.",
    fr: "Barcelone est en Catalogne, qui utilise le système régional Mossos d'Esquadra — pas SES.HOSPEDAJES. Ce guide couvre l'enregistrement HUT et les obligations régionales.",
  },
  steps: [
    esSteps.postNruaContext(),
    {
      key: "barcelona-hut-registration",
      title: {
        en: "Register HUT with Generalitat de Catalunya",
        fr: "Enregistrer HUT auprès de la Generalitat de Catalunya",
      },
      instruction: {
        en: "Obtain your HUT (Habitatge d'Ús Turístic) number from the Catalan tourism register. Barcelona has additional municipal requirements and zone restrictions.",
        fr: "Obtenez votre numéro HUT (Habitatge d'Ús Turístic) auprès du registre touristique catalan. Barcelone a des exigences municipales et restrictions de zone supplémentaires.",
      },
      officialUrls: [
        {
          url: "https://empresa.gencat.cat/web/.content/20_-_Turisme/Documents/Registre_dallotjaments_turistics.pdf",
          label: {
            en: "Generalitat — tourist accommodation register (verify current portal)",
            fr: "Generalitat — registre hébergements touristiques",
          },
          role: "portal",
          urlVerified: false,
        },
        {
          url: "https://www.barcelona.cat/internationalwelcome/en/tourism-housing",
          label: {
            en: "Barcelona City — tourism housing rules",
            fr: "Ville de Barcelone — logements touristiques",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["NIE/NIF", "Property cadastral reference", "Community approval if required"],
        fr: ["NIE/NIF", "Référence cadastrale", "Accord copropriété si requis"],
      },
      fieldHints: ["name", "address", "city", "propertyType"],
    },
    {
      key: "barcelona-mossos-enrollment",
      title: {
        en: "Enroll establishment with Mossos (PI-15 alta)",
        fr: "Inscrire l'établissement auprès des Mossos (alta PI-15)",
      },
      instruction: {
        en: "Before your first guest report, register your establishment with Mossos d'Esquadra via the PI-15 procedure (Canal Empresa / ACCIÓ). Obtain your establishment code. Do NOT also submit to SES.HOSPEDAJES — Catalonia uses Mossos Hotels only.",
        fr: "Avant votre première déclaration, inscrivez votre établissement auprès des Mossos d'Esquadra via la procédure PI-15 (Canal Empresa / ACCIÓ). Obtenez votre code établissement. Ne soumettez PAS aussi à SES.HOSPEDAJES — la Catalogne utilise uniquement Mossos Hotels.",
      },
      officialUrls: [
        {
          url: "https://empresa.gencat.cat/ca/ambits-actuacio/turisme/registre-allotjaments-turistics",
          label: {
            en: "Generalitat — tourist accommodation register & PI-15",
            fr: "Generalitat — registre hébergements touristiques et PI-15",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["HUT number", "NIE/NIF", "Property address", "Establishment type"],
        fr: ["Numéro HUT", "NIE/NIF", "Adresse du bien", "Type d'établissement"],
      },
      fieldHints: ["name", "address", "city"],
    },
    {
      key: "barcelona-mossos-guest-reporting",
      title: {
        en: "Report guests via Mossos Hotels within 24h",
        fr: "Déclarer les voyageurs via Mossos Hotels sous 24h",
      },
      instruction: {
        en: "Collect Annex I guest data via Glint check-in link, then export the fitxa/CSV and enter data manually on the Mossos Hotels portal (registreviatgers.mossos.gencat.cat). Glint prepares and validates — you submit on the official portal. Retain records 3 years (RD 933/2021).",
        fr: "Collectez les données Annexe I via le lien check-in Glint, puis exportez la fitxa/CSV et saisissez les données manuellement sur le portail Mossos Hotels. Glint prépare et valide — vous soumettez sur le portail officiel. Conservez les registres 3 ans (RD 933/2021).",
      },
      officialUrls: [
        {
          url: "https://registreviatgers.mossos.gencat.cat/mossos_hotels/",
          label: {
            en: "Mossos Hotels — guest register portal",
            fr: "Mossos Hotels — portail registre voyageurs",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: "https://registreviatgers.mossos.gencat.cat/mossos_hotels/AppJava/login.do",
          label: {
            en: "Mossos Hotels — login",
            fr: "Mossos Hotels — connexion",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Annex I guest data (from Glint export)", "Establishment code", "Check-in/check-out dates"],
        fr: ["Données Annexe I (export Glint)", "Code établissement", "Dates arrivée/départ"],
      },
      timeline: {
        en: "Within 24 hours of check-in. Retain register 3 years.",
        fr: "Sous 24 heures après l'arrivée. Conserver le registre 3 ans.",
      },
      pitfalls: {
        en: "Do not also submit to SES.HOSPEDAJES. Competitors like RegistroViajero only cover SES — Glint handles Mossos ops for multi-region Spain portfolios.",
        fr: "Ne soumettez pas aussi à SES.HOSPEDAJES. Des concurrents comme RegistroViajero ne couvrent que le SES — Glint gère les ops Mossos pour les portefeuilles multi-régions.",
      },
      fieldHints: ["address", "city"],
    },
    esSteps.taxObligations("barcelona"),
    esSteps.updatePlatforms("barcelona"),
  ],
};

export const SPAIN_VALENCIA_PLAYBOOK: Playbook = {
  id: "es-valencia",
  country: "Spain",
  city: "Valencia",
  sourceReviewedAt: "2026-09-12",
  title: {
    en: "Valencia — tourist rental & SES compliance",
    fr: "Valence — location touristique et conformité SES",
  },
  description: {
    en: "Guided steps for Comunitat Valenciana: VT registration, SES guest reporting, and platform compliance.",
    fr: "Étapes guidées pour la Communauté valencienne : enregistrement VT, déclaration SES et conformité plateformes.",
  },
  steps: [
    esSteps.postNruaContext(),
    {
      ...esSteps.regionalLicense("valencia", {
        en: "Comunitat Valenciana",
        fr: "Communauté valencienne",
      }),
      officialUrls: [
        {
          url: "https://www.gva.es/va/inicio/procedimientos/id_proc/27369",
          label: {
            en: "Generalitat Valenciana — VT registration",
            fr: "Generalitat Valenciana — enregistrement VT",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
    },
    esSteps.sesHospedajes("valencia"),
    esSteps.taxObligations("valencia"),
    esSteps.updatePlatforms("valencia"),
  ],
};

export const SPAIN_MALAGA_PLAYBOOK: Playbook = {
  id: "es-malaga",
  country: "Spain",
  city: "Málaga",
  sourceReviewedAt: "2026-09-12",
  title: {
    en: "Málaga / Andalusia — tourist rental & SES compliance",
    fr: "Málaga / Andalousie — location touristique et conformité SES",
  },
  description: {
    en: "Guided steps for Andalusia (Junta de Andalucía): VFT registration, SES guest reporting, and taxes.",
    fr: "Étapes guidées pour l'Andalousie (Junta de Andalucía) : enregistrement VFT, déclaration SES et taxes.",
  },
  steps: [
    esSteps.postNruaContext(),
    {
      ...esSteps.regionalLicense("malaga", {
        en: "Junta de Andalucía",
        fr: "Junta de Andalucía",
      }),
      officialUrls: [
        {
          url: "https://www.juntadeandalucia.es/turismoydeporte/ventanilla-unica-de-la-junta-de-andalucia",
          label: {
            en: "Junta de Andalucía — VFT registration portal",
            fr: "Junta de Andalucía — portail enregistrement VFT",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
    },
    esSteps.sesHospedajes("malaga"),
    esSteps.taxObligations("malaga"),
    esSteps.updatePlatforms("malaga"),
  ],
};

const basqueRegionalSteps = (cityKey: string, cityName: string): PlaybookStep[] => [
  esSteps.postNruaContext(),
  {
    key: `${cityKey}-regional-license`,
    title: {
      en: "Obtain Basque Country tourist accommodation registration",
      fr: "Obtenir l'enregistrement touristique du Pays basque",
    },
    instruction: {
      en: `Register your short-term rental with the Basque Government and obtain your regional tourism number. Display it on all platform listings as required under EU 2024/1028.`,
      fr: `Enregistrez votre location courte durée auprès du gouvernement basque et obtenez votre numéro touristique régional. Affichez-le sur toutes les plateformes conformément au règlement UE 2024/1028.`,
    },
    officialUrls: [
      {
        url: "https://www.euskadi.eus/informacion/tramitacion-registro-de-viajeros/web01a3wztram/es/",
        label: {
          en: "Basque Government — traveller registry info",
          fr: "Gouvernement basque — registre voyageurs",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["NIE/NIF", "Property deed or rental contract", "Regional tourism number"],
      fr: ["NIE/NIF", "Titre de propriété ou contrat", "Numéro touristique régional"],
    },
    fieldHints: ["name", "address", "city", "propertyType"],
  },
  {
    key: `${cityKey}-ertzaintza-enrollment`,
    title: {
      en: "Enroll with Ertzaintza electronic registry (alta)",
      fr: "S'inscrire au registre électronique Ertzaintza (alta)",
    },
    instruction: {
      en: "Before your first guest report, complete the Ertzaintza/Basque Government hostelero alta. Do NOT submit to SES.HOSPEDAJES — the Basque Country uses Ertzaintza only. BookCheckin and other SES-only tools do not support Basque properties.",
      fr: "Avant votre première déclaration, complétez l'alta hostelero Ertzaintza/gouvernement basque. Ne soumettez PAS à SES.HOSPEDAJES — le Pays basque utilise uniquement Ertzaintza. BookCheckin et autres outils SES-only ne supportent pas les biens basques.",
    },
    officialUrls: [
      {
        url: "https://www.ertzaintza.euskadi.eus/servicios-al-ciudadano/tramites-y-gestiones/registro-de-viajeros/web01a3wztram/es/",
        label: {
          en: "Ertzaintza — traveller registry portal",
          fr: "Ertzaintza — portail registre voyageurs",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Regional tourism number", "NIE/NIF", "Property address"],
      fr: ["Numéro touristique régional", "NIE/NIF", "Adresse du bien"],
    },
    fieldHints: ["name", "address", "city"],
  },
  {
    key: `${cityKey}-ertzaintza-guest-reporting`,
    title: {
      en: `Report guests via Ertzaintza within 24h (${cityName})`,
      fr: `Déclarer les voyageurs via Ertzaintza sous 24h (${cityName})`,
    },
    instruction: {
      en: "Collect Annex I guest data via Glint check-in link, export fitxa/CSV, and enter manually on the Ertzaintza portal. Glint prepares and validates — you submit on the official portal. Penalties under Organic Law 4/2015: €100–600 minor, €601–30,000 serious. Retain records 3 years.",
      fr: "Collectez les données Annexe I via le lien check-in Glint, exportez fitxa/CSV, et saisissez manuellement sur le portail Ertzaintza. Glint prépare et valide — vous soumettez sur le portail officiel. Sanctions loi organique 4/2015 : 100–600 € mineures, 601–30 000 € graves. Conserver 3 ans.",
    },
    officialUrls: [
      {
        url: "https://www.ertzaintza.euskadi.eus/servicios-al-ciudadano/tramites-y-gestiones/registro-de-viajeros/web01a3wztram/es/",
        label: {
          en: "Ertzaintza — traveller registry",
          fr: "Ertzaintza — registre voyageurs",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
    documents: {
      en: ["Annex I guest data (from Glint export)", "Regional establishment code"],
      fr: ["Données Annexe I (export Glint)", "Code établissement régional"],
    },
    timeline: {
      en: "Within 24 hours of check-in. Retain register 3 years.",
      fr: "Sous 24 heures après l'arrivée. Conserver le registre 3 ans.",
    },
    fieldHints: ["address", "city"],
  },
  esSteps.taxObligations(cityKey),
  esSteps.updatePlatforms(cityKey),
];

export const SPAIN_BILBAO_PLAYBOOK: Playbook = {
  id: "es-bilbao",
  country: "Spain",
  city: "Bilbao",
  sourceReviewedAt: "2026-09-15",
  title: {
    en: "Bilbao — Ertzaintza regional system (not SES)",
    fr: "Bilbao — système régional Ertzaintza (pas SES)",
  },
  description: {
    en: "Bilbao is in the Basque Country (Bizkaia), which uses Ertzaintza — not SES.HOSPEDAJES. Glint prepares Annex I data for manual portal submission.",
    fr: "Bilbao est au Pays basque (Bizkaia), qui utilise Ertzaintza — pas SES.HOSPEDAJES. Glint prépare les données Annexe I pour soumission manuelle.",
  },
  steps: basqueRegionalSteps("bilbao", "Bilbao"),
};

export const SPAIN_DONOSTIA_PLAYBOOK: Playbook = {
  id: "es-donostia",
  country: "Spain",
  city: "Donostia-San Sebastián",
  sourceReviewedAt: "2026-09-15",
  title: {
    en: "Donostia-San Sebastián — Ertzaintza (not SES)",
    fr: "Donostia-San Sebastián — Ertzaintza (pas SES)",
  },
  description: {
    en: "San Sebastián is in Gipuzkoa, Basque Country. Guest reporting goes to Ertzaintza, not SES. Glint handles the ops layer competitors skip.",
    fr: "San Sebastián est en Gipuzkoa, Pays basque. La déclaration voyageurs va à Ertzaintza, pas au SES. Glint gère la couche ops que les concurrents ignorent.",
  },
  steps: basqueRegionalSteps("donostia", "Donostia-San Sebastián"),
};

export const SPAIN_VITORIA_PLAYBOOK: Playbook = {
  id: "es-vitoria",
  country: "Spain",
  city: "Vitoria-Gasteiz",
  sourceReviewedAt: "2026-09-15",
  title: {
    en: "Vitoria-Gasteiz — Ertzaintza (not SES)",
    fr: "Vitoria-Gasteiz — Ertzaintza (pas SES)",
  },
  description: {
    en: "Vitoria-Gasteiz is in Álava, Basque Country. Ertzaintza electronic registry applies — SES.HOSPEDAJES does not.",
    fr: "Vitoria-Gasteiz est en Álava, Pays basque. Le registre électronique Ertzaintza s'applique — pas SES.HOSPEDAJES.",
  },
  steps: basqueRegionalSteps("vitoria", "Vitoria-Gasteiz"),
};

export const SPAIN_GENERIC_PLAYBOOK: Playbook = {
  id: "es-generic",
  country: "Spain",
  sourceReviewedAt: "2026-09-12",
  title: {
    en: "Spain — tourist accommodation compliance",
    fr: "Espagne — conformité hébergement touristique",
  },
  description: {
    en: "Country-level guide for Spanish autonomous communities. Post-STS 620/2026: regional tourism numbers required, SES guest reporting mandatory (except Catalonia/Basque Country).",
    fr: "Guide national pour les communautés autonomes espagnoles. Post-STS 620/2026 : numéros touristiques régionaux requis, déclaration SES obligatoire (sauf Catalogne/Pays basque).",
  },
  steps: [
    esSteps.postNruaContext(),
    {
      key: "es-regional-license",
      title: {
        en: "Obtain regional tourist accommodation number",
        fr: "Obtenir le numéro d'hébergement touristique régional",
      },
      instruction: {
        en: "Each autonomous community issues its own registration (VFT, HUT, ETV, VUT, VV, VT). Register with your regional portal and obtain your number for platform listings.",
        fr: "Chaque communauté autonome délivre son propre enregistrement (VFT, HUT, ETV, VUT, VV, VT). Inscrivez-vous sur le portail régional et obtenez votre numéro pour les plateformes.",
      },
      officialUrls: [
        {
          url: MIVAU_URL,
          label: {
            en: "Ministry of Housing — links to regional registers",
            fr: "Ministère du Logement — liens vers registres régionaux",
          },
          role: "info",
          urlVerified: true,
        },
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
        fr: ["NIE/NIF", "Titre de propriété ou contrat", "Certificat énergétique si requis"],
      },
      fieldHints: ["name", "address", "city", "country", "propertyType"],
    },
    esSteps.sesHospedajes("es"),
    esSteps.taxObligations("es"),
    esSteps.updatePlatforms("es"),
  ],
};

export const SPAIN_PLAYBOOKS: Playbook[] = [
  SPAIN_MADRID_PLAYBOOK,
  SPAIN_BARCELONA_PLAYBOOK,
  SPAIN_BILBAO_PLAYBOOK,
  SPAIN_DONOSTIA_PLAYBOOK,
  SPAIN_VITORIA_PLAYBOOK,
  SPAIN_VALENCIA_PLAYBOOK,
  SPAIN_MALAGA_PLAYBOOK,
  SPAIN_GENERIC_PLAYBOOK,
];
