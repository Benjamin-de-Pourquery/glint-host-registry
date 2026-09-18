/** Detect Portuguese nationality — SIBA does not apply to Portuguese nationals. */

const PORTUGUESE_NATIONALITY_ALIASES = new Set([
  "pt",
  "prt",
  "portugal",
  "portuguese",
  "portuguesa",
  "português",
  "portugues",
]);

export function isPortugueseNationality(nationality: string): boolean {
  const normalized = nationality.trim().toLowerCase();
  return PORTUGUESE_NATIONALITY_ALIASES.has(normalized);
}

export function isForeignGuestForSiba(nationality: string): boolean {
  return !isPortugueseNationality(nationality);
}
