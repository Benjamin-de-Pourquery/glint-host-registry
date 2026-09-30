import { BARCELONA_TOURISM_HOUSING_URL } from "@/lib/spain/official-links";
import type { ZoneRuleItem } from "./types";

const REVIEWED = "2026-09-30";

export const BARCELONA_HTA_PLAN_URL =
  "https://ajuntament.barcelona.cat/turisme/en/strategic-management/lines-action/high-traffic-areas-htas-old";

export const SPAIN_LPH_BOE_URL =
  "https://www.boe.es/buscar/act.php?id=BOE-A-1960-10814";

export const BARCELONA_PRE_PURCHASE_RULES: ZoneRuleItem[] = [
  {
    id: "bcn-municipal-tourism-strategy",
    category: "zoning",
    title: {
      en: "Barcelona municipal tourism management",
      fr: "Gestion touristique municipale à Barcelone",
    },
    summary: {
      en: "Barcelona City Council publishes tourism strategy and management instruments on its official tourism site. Municipal rules can add to Catalan HUT requirements.",
      fr: "L'Ajuntament de Barcelona publie sa stratégie touristique et ses instruments de gestion sur son site officiel du tourisme. Les règles municipales s'ajoutent aux exigences HUT catalanes.",
    },
    confidence: "official",
    sourceReviewedAt: REVIEWED,
    officialUrls: [
      {
        url: "https://ajuntament.barcelona.cat/turisme/en",
        label: {
          en: "Ajuntament de Barcelona tourism",
          fr: "Tourisme: Ajuntament de Barcelona",
        },
        role: "rules",
        urlVerified: true,
      },
      {
        url: BARCELONA_TOURISM_HOUSING_URL,
        label: {
          en: "Barcelona tourism (housing section entry)",
          fr: "Tourisme Barcelone (entrée logement)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
  },
  {
    id: "bcn-hta-plan",
    category: "zoning",
    title: {
      en: "High-traffic areas (HTAs) plan",
      fr: "Plan des zones à fort trafic (HTA)",
    },
    summary: {
      en: "Barcelona describes a High-traffic Areas (HTAs) Plan as a municipal instrument to manage pressure in strained areas. Check whether the address sits in an area with specific tourism management measures.",
      fr: "Barcelone décrit un plan de zones à fort trafic (HTA) comme instrument municipal pour gérer la pression dans certains secteurs. Vérifiez si l'adresse est soumise à des mesures spécifiques.",
    },
    confidence: "official",
    sourceReviewedAt: REVIEWED,
    officialUrls: [
      {
        url: BARCELONA_HTA_PLAN_URL,
        label: {
          en: "Barcelona HTAs plan (official page)",
          fr: "Plan HTA Barcelone (page officielle)",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
  },
  {
    id: "bcn-peuat-zoning-detail",
    category: "zoning",
    title: {
      en: "Urban planning / PEUAT zoning for tourist use at the address",
      fr: "Urbanisme / zonage PEUAT pour l'usage touristique à l'adresse",
    },
    confidence: "to_confirm",
    officialUrls: [
      {
        url: "https://ajuntament.barcelona.cat/turisme/en",
        label: {
          en: "Barcelona tourism (official portal)",
          fr: "Tourisme Barcelone (portail officiel)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    toConfirmQuestion: {
      en: "Obtain a current urban planning report (certificado urbanístico) and ask whether tourist housing is permitted for this unit, floor, and cadastral reference.",
      fr: "Obtenez un certificat urbanistique à jour et demandez si le logement touristique est autorisé pour ce local, cet étage et cette référence cadastrale.",
    },
  },
  {
    id: "bcn-co-ownership",
    category: "co_ownership",
    title: {
      en: "Community of owners (comunidad de propietarios)",
      fr: "Communauté de propriétaires (comunidad de propietarios)",
    },
    confidence: "to_confirm",
    officialUrls: [
      {
        url: SPAIN_LPH_BOE_URL,
        label: {
          en: "BOE consolidated text: Ley de Propiedad Horizontal",
          fr: "Texte consolidé BOE : Ley de Propiedad Horizontal",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
    toConfirmQuestion: {
      en: "Request estatutos, the latest general meeting minutes (actas), and a certificate from the property administrator (administrador de fincas) on short-term tourist use. Community bans are not visible in the open tourism register.",
      fr: "Demandez les estatutos, le dernier procès-verbal d'assemblée générale (actas) et un certificat de l'administrador de fincas sur l'usage touristique de courte durée. Les interdictions de copropriété ne figurent pas dans le registre touristique ouvert.",
    },
  },
];
