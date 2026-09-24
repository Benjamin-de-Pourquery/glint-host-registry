"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNavigationProgress } from "@/components/navigation/navigation-progress";
import { useLocale, useTranslations } from "next-intl";
import { NavLink } from "@/components/navigation/nav-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthPageShell,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-page-shell";
import { cn } from "@/lib/utils";

export type ResetTokenStatus = "valid" | "invalid" | "expired" | "used";

type ResetPasswordFormProps = {
  tokenStatus: ResetTokenStatus;
};

export function ResetPasswordForm({ tokenStatus }: ResetPasswordFormProps) {
  const t = useTranslations("auth.resetPassword");
  const locale = useLocale();
  const router = useRouter();
  const { start: startNavigation } = useNavigationProgress();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (tokenStatus !== "valid") {
    const messageKey =
      tokenStatus === "expired"
        ? "expiredMessage"
        : tokenStatus === "used"
          ? "usedMessage"
          : "invalidMessage";

    return (
      <AuthPageShell title={t("title")} description={t("invalidSubtitle")}>
        <p className="text-sm leading-relaxed text-slate-600">{t(messageKey)}</p>
        <NavLink
          href={`/${locale}/forgot-password`}
          className={cn(
            "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
            authPrimaryButtonClassName
          )}
        >
          {t("requestNewLink")}
        </NavLink>
      </AuthPageShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("policy"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(t("submitError"));
      return;
    }

    startNavigation();
    router.push(`/${locale}/login?passwordUpdated=1`);
  };

  return (
    <AuthPageShell title={t("title")} description={t("subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
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
