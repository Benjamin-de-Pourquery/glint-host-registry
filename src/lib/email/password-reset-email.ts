const PRODUCT_NAME = "Glint Host";

type Locale = "en" | "fr";

type PasswordResetEmailContent = {
  subject: string;
  html: string;
  text: string;
};

export function buildPasswordResetEmail(
  locale: Locale,
  resetUrl: string
): PasswordResetEmailContent {
  if (locale === "fr") {
    return {
      subject: `Réinitialiser votre mot de passe ${PRODUCT_NAME}`,
      html: passwordResetHtmlFr(resetUrl),
      text: passwordResetTextFr(resetUrl),
    };
  }

  return {
    subject: `Reset your ${PRODUCT_NAME} password`,
    html: passwordResetHtmlEn(resetUrl),
    text: passwordResetTextEn(resetUrl),
  };
}

function passwordResetHtmlEn(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0f172a;padding:20px 24px;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">${PRODUCT_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.5;">You asked to reset your password.</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#475569;">This link is valid for 1 hour. If you did not request this, ignore this email.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${resetUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;">Reset password</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;word-break:break-all;">${resetUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">By Glint</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function passwordResetHtmlFr(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0f172a;padding:20px 24px;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">${PRODUCT_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.5;">Vous avez demandé à réinitialiser votre mot de passe.</p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#475569;">Le lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${resetUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;">Réinitialiser le mot de passe</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;word-break:break-all;">${resetUrl}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">Par Glint</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function passwordResetTextEn(resetUrl: string): string {
  return `Reset your ${PRODUCT_NAME} password

Open this link within 1 hour:
${resetUrl}

If you did not request this, ignore this email.

By Glint`;
}

function passwordResetTextFr(resetUrl: string): string {
  return `Réinitialiser votre mot de passe ${PRODUCT_NAME}

Ouvrez ce lien dans l'heure :
${resetUrl}

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.

Par Glint`;
}
