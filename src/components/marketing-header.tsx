"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Shield } from "lucide-react";

type Props = {
  isLoggedIn?: boolean;
};

export function MarketingHeader({ isLoggedIn = false }: Props) {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-600/25">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-sm font-bold text-slate-900">{tBrand("name")}</span>
            <span className="truncate text-xs text-slate-500">{tBrand("product")}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            {t("features")}
          </a>
          <a href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            {t("pricing")}
          </a>
          <a href="#faq" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
            {t("faq")}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <Link href={`/${locale}/app`}>
              <Button size="sm">{t("dashboard")}</Button>
            </Link>
          ) : (
            <>
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm" className="border-slate-200">
                  {t("login")}
                </Button>
              </Link>
              <Link href={`/${locale}/signup`}>
                <Button size="sm">{t("signup")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
