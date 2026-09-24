"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthFormFooter,
  AuthPageShell,
  AuthTextLink,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-page-shell";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AuthPageShell
      title={t("title")}
      description={t("subtitle")}
      footer={
        <AuthFormFooter>
          <AuthTextLink href={`/${locale}/login`}>{t("backToSignIn")}</AuthTextLink>
        </AuthFormFooter>
      }
    >
      {submitted ? (
        <p className="text-sm text-slate-600">{t("prepared")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">{t("email")}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className={authPrimaryButtonClassName}
            disabled={loading}
          >
            {loading ? t("pending") : t("submit")}
          </Button>
        </form>
      )}
    </AuthPageShell>
  );
}
