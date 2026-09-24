"use client";

import { useState } from "react";
import { useNavigationProgress } from "@/components/navigation/navigation-progress";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const locale = useLocale();
  const router = useRouter();
  const { start: startNavigation } = useNavigationProgress();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, language: locale }),
    });

    if (!res.ok) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("error"));
      setLoading(false);
    } else {
      startNavigation();
      router.push(`/${locale}/app`);
    }
  };

  return (
    <AuthPageShell
      title={t("title")}
      description={t("subtitle")}
      footer={
        <AuthFormFooter>
          {t("hasAccount")}{" "}
          <AuthTextLink href={`/${locale}/login`}>{t("login")}</AuthTextLink>
        </AuthFormFooter>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <p className="text-xs text-slate-500">{t("passwordHint")}</p>
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
