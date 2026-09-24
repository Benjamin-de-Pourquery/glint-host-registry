import { prisma } from "@/lib/prisma";

export const EMAIL_RATE_LIMIT_MAX = 3;
export const EMAIL_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const IP_RATE_LIMIT_MAX = 10;
export const IP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export type RateLimitSnapshot = {
  emailAttempts: number;
  ipAttempts: number;
};

export function isPasswordResetRateLimited(snapshot: RateLimitSnapshot): boolean {
  return (
    snapshot.emailAttempts >= EMAIL_RATE_LIMIT_MAX ||
    snapshot.ipAttempts >= IP_RATE_LIMIT_MAX
  );
}

export async function recordPasswordResetAttempt(
  emailNormalized: string,
  requestIp: string | null
): Promise<void> {
  await prisma.passwordResetAttempt.create({
    data: {
      emailNormalized,
      requestIp,
    },
  });
}

export async function getPasswordResetRateLimitSnapshot(
  emailNormalized: string,
  requestIp: string | null,
  now = Date.now()
): Promise<RateLimitSnapshot> {
  const emailSince = new Date(now - EMAIL_RATE_LIMIT_WINDOW_MS);
  const ipSince = new Date(now - IP_RATE_LIMIT_WINDOW_MS);

  const [emailAttempts, ipAttempts] = await Promise.all([
    prisma.passwordResetAttempt.count({
      where: {
        emailNormalized,
        createdAt: { gte: emailSince },
      },
    }),
    requestIp
      ? prisma.passwordResetAttempt.count({
          where: {
            requestIp,
            createdAt: { gte: ipSince },
          },
        })
      : Promise.resolve(0),
  ]);

  return { emailAttempts, ipAttempts };
}
