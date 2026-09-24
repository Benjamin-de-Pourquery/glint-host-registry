"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNavigationProgress } from "@/components/navigation/navigation-progress";
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
import { sanitizeCallbackUrl } from "@/lib/security/safe-redirect";
import { AuthGoogleSection } from "@/components/auth/auth-google-section";

type LoginFormProps = {
  showGoogle?: boolean;
  showForgotPassword?: boolean;
};

export function LoginForm({
  showGoogle = false,
  showForgotPassword = false,
}: LoginFormProps) {
  const t = useTranslations("auth.login");
  const tOAuth = useTranslations("auth.oauth");
  const locale = useLocale();
  const router = useRouter();
  const { start: startNavigation } = useNavigationProgress();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(
    searchParams.get("callbackUrl"),
    locale
  );
  const passwordUpdated = searchParams.get("passwordUpdated") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      router.push(callbackUrl);
    }
  };

  return (
    <AuthPageShell
      title={t("title")}
      description={t("subtitle")}
      footer={
        <AuthFormFooter>
          {t("noAccount")}{" "}
          <AuthTextLink href={`/${locale}/signup`}>{t("signup")}</AuthTextLink>
        </AuthFormFooter>
      }
    >
      <div className="space-y-6">
        <AuthGoogleSection
          showGoogle={showGoogle}
          googleLabel={tOAuth("google")}
          dividerLabel={tOAuth("or")}
          callbackUrl={callbackUrl}
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          {passwordUpdated && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              {t("passwordUpdated")}
            </div>
          )}
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
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {showForgotPassword ? (
              <p className="text-right text-sm">
                <AuthTextLink href={`/${locale}/forgot-password`}>
                  {t("forgotPasswordLink")}
                </AuthTextLink>
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            className={authPrimaryButtonClassName}
            disabled={loading}
          >
            {loading ? t("pending") : t("submit")}
          </Button>
        </form>
      </div>
    </AuthPageShell>
  );
}
