import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry(now = Date.now()): Date {
  return new Date(now + PASSWORD_RESET_TTL_MS);
}

export function isPasswordResetTokenExpired(
  expiresAt: Date,
  now = Date.now()
): boolean {
  return expiresAt.getTime() <= now;
}

export function isPasswordResetTokenUsed(usedAt: Date | null): boolean {
  return usedAt !== null;
}
