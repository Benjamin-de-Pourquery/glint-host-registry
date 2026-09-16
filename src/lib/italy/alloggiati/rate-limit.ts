const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkAlloggiatiRateLimit(
  userId: string
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const bucket = buckets.get(userId);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true };
}
