"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Shield } from "lucide-react";

export function MarketingHeader() {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-slate-900">{tBrand("name")}</span>
            <span className="text-xs text-slate-500">{tBrand("product")}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
            {t("features")}
          </a>
          <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">
            {t("pricing")}
          </a>
          <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900">
            {t("faq")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href={`/${locale}/login`} className="hidden sm:block">
            <Button variant="ghost" size="sm">{t("login")}</Button>
          </Link>
          <Link href={`/${locale}/signup`}>
            <Button size="sm">{t("signup")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
