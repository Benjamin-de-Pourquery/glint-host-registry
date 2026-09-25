import {
  buildDefaultNightCapSettings,
  computeNightCapStatus,
  nightCapApplies,
  type NightCapComputation,
  type NightCapSettingsInput,
} from "@/lib/france/night-cap";
import { isPrimaryResidence } from "@/lib/france/night-cap";
import { isFranceCountry } from "@/lib/national-transition";
import { isNetherlandsCountry, isAmsterdamCity } from "@/lib/netherlands/regions";
import { computeNlNightCapStatus } from "@/lib/netherlands/night-cap";
import {
  loadRuleSnapshot,
  resolveFrNightCapLimit,
  resolveNlAmsterdamNightCapLimit,
} from "./resolver";
import type { RuleSnapshot } from "./types";
import type { GuestStayNightInput } from "@/lib/france/night-cap";

export async function buildFrNightCapSettingsFromRules(
  city: string,
  snapshot?: RuleSnapshot
): Promise<NightCapSettingsInput> {
  const rules = snapshot ?? await loadRuleSnapshot();
  const { limit, source } = resolveFrNightCapLimit(rules, city);
  return {
    nightCapEnabled: true,
    nightCapLimit: limit,
    nightCapYear: new Date().getFullYear(),
    nightCapSource: source,
    notes: null,
  };
}

export async function buildNlNightCapSettingsFromRules(
  city: string,
  wijkKey: string | null | undefined,
  snapshot?: RuleSnapshot
): Promise<NightCapSettingsInput> {
  const rules = snapshot ?? await loadRuleSnapshot();
  const limit = resolveNlAmsterdamNightCapLimit(rules, wijkKey);
  return {
    nightCapEnabled: limit > 0,
    nightCapLimit: limit,
    nightCapYear: new Date().getFullYear(),
    nightCapSource: "custom",
    notes: null,
  };
}

export async function resolveNightCapSettingsForProperty(
  input: {
    country: string;
    city: string;
    residencyStatus: string | null;
    wijkKey?: string | null;
    existing?: NightCapSettingsInput | null;
  },
  snapshot?: RuleSnapshot
): Promise<NightCapSettingsInput> {
  if (!nightCapApplies(input.country, input.residencyStatus, input.city)) {
    return input.existing ?? buildDefaultNightCapSettings(input.city);
  }

  if (isNetherlandsCountry(input.country) && isAmsterdamCity(input.city)) {
    const fromRules = await buildNlNightCapSettingsFromRules(
      input.city,
      input.wijkKey,
      snapshot
    );
    if (input.existing) {
      return {
        ...input.existing,
        nightCapLimit: fromRules.nightCapLimit,
        nightCapEnabled: fromRules.nightCapEnabled,
      };
    }
    return fromRules;
  }

  if (isFranceCountry(input.country) && isPrimaryResidence(input.residencyStatus)) {
    const fromRules = await buildFrNightCapSettingsFromRules(input.city, snapshot);
    if (input.existing) {
      return {
        ...input.existing,
        nightCapLimit: fromRules.nightCapLimit,
        nightCapSource: fromRules.nightCapSource,
      };
    }
    return fromRules;
  }

  return input.existing ?? buildDefaultNightCapSettings(input.city);
}

export function computePropertyNightCapFromSettings(
  stays: GuestStayNightInput[],
  input: {
    country: string;
    city: string;
    residencyStatus: string | null;
    wijkKey?: string | null;
    settings: NightCapSettingsInput;
  }
): NightCapComputation | null {
  if (!nightCapApplies(input.country, input.residencyStatus, input.city)) {
    return null;
  }

  if (isNetherlandsCountry(input.country) && isAmsterdamCity(input.city)) {
    return computeNlNightCapStatus(stays, input.city, input.wijkKey, input.settings);
  }

  return computeNightCapStatus(stays, input.settings);
}
