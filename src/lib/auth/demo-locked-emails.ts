/** Normalize email for comparisons (lowercase, trimmed). */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Emails that must not use self-serve password reset (shared demo / showcase accounts).
 * Configure production demo accounts via DEMO_LOCKED_EMAILS (comma-separated).
 */
export function isDemoLockedEmail(email: string): boolean {
  const normalized = normalizeAuthEmail(email);
  const fromEnv =
    process.env.DEMO_LOCKED_EMAILS?.split(",")
      .map((entry) => normalizeAuthEmail(entry))
      .filter(Boolean) ?? [];
  return fromEnv.includes(normalized);
}
