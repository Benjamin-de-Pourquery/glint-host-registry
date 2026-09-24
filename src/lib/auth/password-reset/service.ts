import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isMailerConfigured, sendEmail } from "@/lib/email/send-email";
import { buildPasswordResetEmail } from "@/lib/email/password-reset-email";
import { normalizeAuthEmail, isDemoLockedEmail } from "@/lib/auth/demo-locked-emails";
import {
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
  isPasswordResetTokenExpired,
  isPasswordResetTokenUsed,
} from "@/lib/auth/password-reset/tokens";
import {
  getPasswordResetRateLimitSnapshot,
  isPasswordResetRateLimited,
  recordPasswordResetAttempt,
} from "@/lib/auth/password-reset/rate-limit";
import { isValidPassword } from "@/lib/auth/password-policy";
import { getPasswordResetBaseUrl } from "@/lib/auth/request-meta";

export type ForgotPasswordInput = {
  email: string;
  locale: "en" | "fr";
  requestIp: string | null;
  request: Request;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type ResetTokenValidation =
  | { status: "valid" }
  | { status: "invalid" | "expired" | "used" };

export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<void> {
  const emailInput = input.email.trim();
  const emailNormalized = normalizeAuthEmail(input.email);
  const requestIp = input.requestIp;

  const snapshot = await getPasswordResetRateLimitSnapshot(
    emailNormalized,
    requestIp
  );
  await recordPasswordResetAttempt(emailNormalized, requestIp);

  if (isPasswordResetRateLimited(snapshot)) {
    return;
  }

  if (isDemoLockedEmail(emailNormalized)) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: emailInput },
  });

  if (!user) {
    return;
  }

  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: getPasswordResetExpiry(),
      requestIp,
    },
  });

  const baseUrl = getPasswordResetBaseUrl(input.request);
  const resetUrl = `${baseUrl}/${input.locale}/reset-password?token=${encodeURIComponent(rawToken)}`;

  if (!isMailerConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[password-reset] Reset link for ${emailNormalized}: ${resetUrl}`);
    }
    return;
  }

  const content = buildPasswordResetEmail(input.locale, resetUrl);
  await sendEmail({
    to: user.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
  });
}

export async function validatePasswordResetToken(
  token: string
): Promise<ResetTokenValidation> {
  if (!token.trim()) {
    return { status: "invalid" };
  }

  const tokenHash = hashPasswordResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return { status: "invalid" };
  }

  if (isPasswordResetTokenUsed(record.usedAt)) {
    return { status: "used" };
  }

  if (isPasswordResetTokenExpired(record.expiresAt)) {
    return { status: "expired" };
  }

  return { status: "valid" };
}

export async function completePasswordReset(
  input: ResetPasswordInput
): Promise<{ ok: true } | { ok: false; reason: ResetTokenValidation["status"] }> {
  if (!isValidPassword(input.password)) {
    return { ok: false, reason: "invalid" };
  }

  const validation = await validatePasswordResetToken(input.token);
  if (validation.status !== "valid") {
    return { ok: false, reason: validation.status };
  }

  const tokenHash = hashPasswordResetToken(input.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return { ok: false, reason: "invalid" };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const passwordChangedAt = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: passwordHash,
        passwordChangedAt,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: passwordChangedAt },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: record.userId,
        id: { not: record.id },
        usedAt: null,
      },
    }),
    prisma.session.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { ok: true };
}
