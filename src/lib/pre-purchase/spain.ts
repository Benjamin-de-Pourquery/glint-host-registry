import { EU_1028_URL, RD_933_URL } from "@/lib/spain/official-links";
import type { ZoneRuleItem } from "./types";

const REVIEWED = "2026-09-30";

/** Spain-wide rules with sources opened on 2026-09-30. */
export const SPAIN_PRE_PURCHASE_RULES: ZoneRuleItem[] = [
  {
    id: "es-eu-1028-platform-data",
    category: "national_context",
    title: {
      en: "EU short-term rental data rules (Regulation 2024/1028)",
      fr: "Données LCD UE (règlement 2024/1028)",
    },
    summary: {
      en: "EU Regulation 2024/1028 sets harmonised data and registration expectations for short-term rental listings on platforms. Use it as context when checking listing numbers and platform fields in Spain.",
      fr: "Le règlement UE 2024/1028 fixe des attentes harmonisées sur les données et l'enregistrement des annonces LCD sur les plateformes. Servez-vous-en comme contexte pour les numéros et champs d'annonce en Espagne.",
    },
    confidence: "official",
    sourceReviewedAt: REVIEWED,
    officialUrls: [
      {
        url: EU_1028_URL,
        label: {
          en: "EUR-Lex: Regulation (EU) 2024/1028",
          fr: "EUR-Lex : règlement (UE) 2024/1028",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
  },
  {
    id: "es-rd-933-national-register",
    category: "national_context",
    title: {
      en: "Spanish national tourist housing register (RD 933/2021)",
      fr: "Registre national espagnol des logements touristiques (RD 933/2021)",
    },
    summary: {
      en: "Royal Decree 933/2021 (BOE) establishes the national framework for short-stay and tourist housing registers and related obligations. Regional registers (such as Catalonia HUT) sit alongside this framework.",
      fr: "Le décret royal 933/2021 (BOE) pose le cadre national des registres de logements de courte durée et touristiques. Les registres autonomes (comme le HUT en Catalogne) s'ajoutent à ce cadre.",
    },
    confidence: "official",
    sourceReviewedAt: REVIEWED,
    officialUrls: [
      {
        url: RD_933_URL,
        label: {
          en: "BOE: Royal Decree 933/2021",
          fr: "BOE : décret royal 933/2021",
        },
        role: "rules",
        urlVerified: true,
      },
    ],
  },
];
