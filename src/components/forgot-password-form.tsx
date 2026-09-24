"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthFormFooter,
  AuthPageShell,
  AuthTextLink,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-page-shell";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(t("error"));
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthPageShell
        title={t("title")}
        description={t("subtitle")}
        footer={
          <AuthFormFooter>
            <AuthTextLink href={`/${locale}/login`}>{t("backToLogin")}</AuthTextLink>
          </AuthFormFooter>
        }
      >
        <p className="text-sm leading-relaxed text-slate-600">{t("confirmation")}</p>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title={t("title")}
      description={t("subtitle")}
      footer={
        <AuthFormFooter>
          <AuthTextLink href={`/${locale}/login`}>{t("backToLogin")}</AuthTextLink>
        </AuthFormFooter>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
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
    </AuthPageShell>
  );
}
