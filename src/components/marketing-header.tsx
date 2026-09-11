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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={`/${locale}`} className="group flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition-shadow group-hover:shadow-lg group-hover:shadow-emerald-600/35">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold tracking-tight text-slate-900">
              {tBrand("name")}
            </span>
            <span className="block truncate text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {tBrand("product")}
            </span>
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
                <Button variant="outline" size="sm" className="border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50">
                  {t("login")}
                </Button>
              </Link>
              <Link href={`/${locale}/signup`}>
                <Button size="sm" className="shadow-sm shadow-emerald-600/25">{t("signup")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
