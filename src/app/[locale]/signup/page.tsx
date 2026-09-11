"use client";

import { useState } from "react";
import Link from "next/link";
import { useNavigationProgress } from "@/components/navigation/navigation-progress";
import { NavLink } from "@/components/navigation/nav-link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Shield } from "lucide-react";

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const tBrand = useTranslations("brand");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <NavLink href={`/${locale}`} className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-slate-900">{tBrand("name")}</div>
          <div className="text-sm text-slate-500">{tBrand("product")}</div>
        </div>
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
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
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
                minLength={8}
                required
              />
              <p className="text-xs text-slate-500">{t("passwordHint")}</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : t("submit")}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            {t("hasAccount")}{" "}
            <NavLink href={`/${locale}/login`} className="font-medium text-emerald-600 hover:underline">
              {t("login")}
            </NavLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
