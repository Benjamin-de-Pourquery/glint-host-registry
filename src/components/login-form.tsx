"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavLink } from "@/components/navigation/nav-link";
import { useNavigationProgress } from "@/components/navigation/navigation-progress";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GlintBrandIcon } from "@/components/brand/glint-brand-icon";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { sanitizeCallbackUrl } from "@/lib/security/safe-redirect";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tBrand = useTranslations("brand");
  const locale = useLocale();
  const router = useRouter();
  const { start: startNavigation } = useNavigationProgress();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(
    searchParams.get("callbackUrl"),
    locale
  );

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <NavLink href={`/${locale}`} className="mb-8 flex items-center gap-2.5">
        <GlintBrandIcon size={40} />
        <BrandWordmark product={tBrand("product")} byGlint={tBrand("byGlint")} />
      </NavLink>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : t("submit")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            {t("noAccount")}{" "}
            <NavLink href={`/${locale}/signup`} className="font-medium text-emerald-600 hover:underline">
              {t("signup")}
            </NavLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
