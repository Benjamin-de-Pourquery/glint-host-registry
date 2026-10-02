import { FACTS_REVIEWED_AT } from "./monteur-kit-facts";

export type DeMonteurTrack =
  | "zwvbg"
  | "building"
  | "guest_reg"
  | "invoicing";

export type DeKitChecklistItem = {
  key: string;
  track: DeMonteurTrack | "company";
  done: boolean;
};

export type DeCompanyAgreementItem = {
  key: string;
  done: boolean;
};

const MONTEUR_KIT_TEMPLATE: Array<{ key: string; track: DeMonteurTrack }> = [
  { key: "zwvbg_fourth_act_2026", track: "zwvbg" },
  { key: "zwvbg_existing_numbers", track: "zwvbg" },
  { key: "zwvbg_bundid_portal", track: "zwvbg" },
  { key: "zwvbg_unit_and_host", track: "zwvbg" },
  { key: "building_law_confirm", track: "building" },
  { key: "guest_reg_foreign_meldeschein", track: "guest_reg" },
  { key: "guest_reg_record_fields", track: "guest_reg" },
  { key: "guest_reg_private_flat_confirm", track: "guest_reg" },
  { key: "invoicing_before_first_booking", track: "invoicing" },
  { key: "milieuschutz_confirm", track: "building" },
];

const COMPANY_AGREEMENT_TEMPLATE: Array<{ key: string }> = [
  { key: "mid_stay_cleaning" },
  { key: "linen_rhythm" },
  { key: "occupants_per_room" },
  { key: "key_handover" },
  { key: "work_shoes_tools" },
  { key: "hotel_like_services_tax" },
];

export function defaultMonteurKitChecklist(): DeKitChecklistItem[] {
  return MONTEUR_KIT_TEMPLATE.map((row) => ({
    key: row.key,
    track: row.track,
    done: false,
  }));
}

export function defaultCompanyAgreementChecklist(): DeCompanyAgreementItem[] {
  return COMPANY_AGREEMENT_TEMPLATE.map((row) => ({
    key: row.key,
    done: false,
  }));
}

export function mergeMonteurKitChecklist(
  stored: DeKitChecklistItem[] | null | undefined
): DeKitChecklistItem[] {
  const defaults = defaultMonteurKitChecklist();
  const byKey = new Map((stored ?? []).map((item) => [item.key, item]));
  return defaults.map((def) => {
    const existing = byKey.get(def.key);
    return existing
      ? { key: def.key, track: def.track, done: Boolean(existing.done) }
      : def;
  });
}

export function mergeCompanyAgreementChecklist(
  stored: DeCompanyAgreementItem[] | null | undefined
): DeCompanyAgreementItem[] {
  const defaults = defaultCompanyAgreementChecklist();
  const byKey = new Map((stored ?? []).map((item) => [item.key, item]));
  return defaults.map((def) => {
    const existing = byKey.get(def.key);
    return existing ? { key: def.key, done: Boolean(existing.done) } : def;
  });
}

export function parseChecklistJson<T>(raw: string | null | undefined): T[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyChecklist<T>(items: T[]): string {
  return JSON.stringify(items);
}

export function monteurKitProgress(items: DeKitChecklistItem[]): {
  done: number;
  total: number;
} {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total };
}

export { FACTS_REVIEWED_AT };
