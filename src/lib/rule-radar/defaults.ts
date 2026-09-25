import {
  COMMUNE_NIGHT_CAP_90,
  STATUTORY_NIGHT_CAP,
} from "@/lib/france/night-cap";
import { AMSTERDAM_15_NIGHT_WIJKEN } from "@/lib/netherlands/regions";
import { RULE_KEYS } from "./keys";

/** Hardcoded fallbacks when JurisdictionRule rows are absent. */
export const HARDCODED_DEFAULTS: Record<string, unknown> = {
  [RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT]: STATUTORY_NIGHT_CAP,
  [RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_LIMIT]: COMMUNE_NIGHT_CAP_90,
  [RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES]: ["paris", "lyon", "nice"],
  [RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_DEFAULT]: 30,
  [RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_WIJK_15]: 15,
  [RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES]: [...AMSTERDAM_15_NIGHT_WIJKEN],
  [RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE]: "monthly",
  [RULE_KEYS.FR_GUEST_FICHE_DEADLINE_DAYS]: 1,
};

export function getHardcodedDefault<T>(key: string, fallback: T): T {
  const value = HARDCODED_DEFAULTS[key];
  if (value === undefined) return fallback;
  return value as T;
}
