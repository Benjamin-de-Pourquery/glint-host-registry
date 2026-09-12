import { prisma } from "@/lib/prisma";

/** Max guest check-in submissions per property per hour. */
const CHECK_IN_PROPERTY_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function isCheckInRateLimited(propertyId: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);

  const propertyCount = await prisma.guestRecord.count({
    where: {
      propertyId,
      submittedAt: { gte: since },
    },
  });

  return propertyCount >= CHECK_IN_PROPERTY_LIMIT;
}
