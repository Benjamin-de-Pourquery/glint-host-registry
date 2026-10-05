/** Normalize Eircode: trim, remove spaces, uppercase. */
export function normalizeEircode(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

/**
 * Eircode: 7 characters (3-char routing key + 4-char unique identifier), alphanumeric.
 * @see https://www.citizensinformation.ie/en/housing/owning-a-home/home-owners/renting-your-property-for-shortterm-lets/
 */
export function isValidEircode(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  const normalized = normalizeEircode(value);
  return /^[A-Z0-9]{7}$/.test(normalized);
}
