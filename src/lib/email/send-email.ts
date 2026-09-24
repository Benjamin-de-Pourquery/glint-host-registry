import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function isMailerConfigured(): boolean {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    return false;
  }
  return Boolean(
    process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim()
  );
}

function getFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("EMAIL_FROM is not configured");
  }
  return from;
}

async function sendViaResend(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const body: Record<string, string> = {
    from: getFromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };

  const replyTo = process.env.EMAIL_REPLY_TO?.trim();
  if (replyTo) {
    body.reply_to = replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend API error (${response.status}): ${detail}`);
  }
}

async function sendViaSmtp(input: SendEmailInput): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }

  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to: input.to,
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend(input);
    return;
  }

  if (process.env.SMTP_HOST?.trim()) {
    await sendViaSmtp(input);
    return;
  }

  throw new Error("No email provider configured");
}
