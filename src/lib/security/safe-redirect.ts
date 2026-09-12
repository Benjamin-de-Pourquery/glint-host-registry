const LOCALE_PREFIX = /^\/(en|fr)(\/|$)/;

/**
 * Restrict post-login redirects to same-origin locale paths (blocks open redirects).
 */
export function sanitizeCallbackUrl(
  callbackUrl: string | null | undefined,
  locale: string,
  fallback = `/${locale}/app`
): string {
  if (!callbackUrl) {
    return fallback;
  }

  const trimmed = callbackUrl.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return fallback;
  }

  if (!LOCALE_PREFIX.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
