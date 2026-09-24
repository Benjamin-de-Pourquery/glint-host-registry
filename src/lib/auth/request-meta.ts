import { getSiteUrl } from "@/lib/seo/site";

export function getRequestClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

/** Public base URL for links in emails: env first, else request origin. */
export function getPasswordResetBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return getSiteUrl();
  }
}
