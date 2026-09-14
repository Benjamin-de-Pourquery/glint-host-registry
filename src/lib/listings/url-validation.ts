/** Validate listing URLs — http/https only, reject javascript: and other schemes */
export function isValidListingUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeListingUrl(url: string): string {
  return url.trim();
}
