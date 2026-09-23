import type { ChecklistItem } from "./types";

export const DEFAULT_DOCUMENT_KEYS = [
  "identity",
  "address_proof",
  "municipal_registration",
  "listing_urls",
  "coproperty",
  "change_of_use",
] as const;

export type DocumentChecklistKey = (typeof DEFAULT_DOCUMENT_KEYS)[number];

export function defaultDocumentsChecklist(): ChecklistItem[] {
  return DEFAULT_DOCUMENT_KEYS.map((key) => ({ key, done: false }));
}

export function mergeDocumentsChecklist(
  stored: ChecklistItem[] | null | undefined
): ChecklistItem[] {
  const map = new Map(
    (stored ?? []).map((item) => [item.key, Boolean(item.done)])
  );

  return DEFAULT_DOCUMENT_KEYS.map((key) => ({
    key,
    done: map.get(key) ?? false,
  }));
}

export function isDocumentsChecklistComplete(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every((item) => item.done);
}
