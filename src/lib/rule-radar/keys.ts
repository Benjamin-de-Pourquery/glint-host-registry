/** Stable keys for versioned jurisdiction parameters. */
export const RULE_KEYS = {
  FR_NIGHT_CAP_STATUTORY_LIMIT: "fr.night_cap.statutory_limit",
  FR_NIGHT_CAP_COMMUNE_90_LIMIT: "fr.night_cap.commune_90_limit",
  FR_NIGHT_CAP_COMMUNE_90_CITIES: "fr.night_cap.commune_90_cities",
  NL_AMSTERDAM_NIGHT_CAP_DEFAULT: "nl.amsterdam.night_cap.default_limit",
  NL_AMSTERDAM_NIGHT_CAP_WIJK_15: "nl.amsterdam.night_cap.wijk_15_limit",
  NL_AMSTERDAM_WIJK_15_ZONES: "nl.amsterdam.wijk_15_zones",
  FR_TOURIST_TAX_DEFAULT_CADENCE: "fr.tourist_tax.default_declaration_cadence",
  FR_GUEST_FICHE_DEADLINE_DAYS: "fr.guest_fiche.deadline_days_after_checkin",
} as const;

export type RuleKey = (typeof RULE_KEYS)[keyof typeof RULE_KEYS];

export const RULE_CONFIDENCE_LEVELS = ["official", "announced", "reported"] as const;
export type RuleConfidence = (typeof RULE_CONFIDENCE_LEVELS)[number];

export const IMPACT_SEVERITIES = ["none", "low", "medium", "high"] as const;
export type ImpactSeverity = (typeof IMPACT_SEVERITIES)[number];
