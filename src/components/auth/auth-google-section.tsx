"use client";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AuthOAuthDivider } from "@/components/auth/auth-oauth-divider";

type Props = {
  showGoogle: boolean;
  googleLabel: string;
  dividerLabel: string;
  callbackUrl: string;
};

/**
 * Google OAuth entry + "or" divider when the shared Glint client is configured.
 */
export function AuthGoogleSection({
  showGoogle,
  googleLabel,
  dividerLabel,
  callbackUrl,
}: Props) {
  if (!showGoogle) {
    return null;
  }

  return (
    <div className="space-y-6">
      <GoogleSignInButton label={googleLabel} callbackUrl={callbackUrl} />
      <AuthOAuthDivider label={dividerLabel} />
    </div>
  );
}
