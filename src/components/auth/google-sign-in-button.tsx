"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GoogleBrandIcon } from "@/components/auth/google-brand-icon";
import { authSecondaryButtonClassName } from "@/components/auth/auth-page-shell";

type Props = {
  label: string;
  callbackUrl: string;
  disabled?: boolean;
};

export function GoogleSignInButton({ label, callbackUrl, disabled }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      className={authSecondaryButtonClassName}
      disabled={disabled}
      onClick={() => {
        void signIn("google", { callbackUrl });
      }}
    >
      <GoogleBrandIcon className="mr-2 h-5 w-5 shrink-0" />
      {label}
    </Button>
  );
}
