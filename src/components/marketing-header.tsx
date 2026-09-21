"use client";

import { useState } from "react";
import { NavLink } from "@/components/navigation/nav-link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { GlintBrandIcon } from "@/components/brand/glint-brand-icon";

type Props = {
  isLoggedIn?: boolean;
};

const navLinks = [
  { href: "#features", key: "features" as const },
  { href: "#pricing", key: "pricing" as const },
  { href: "#faq", key: "faq" as const },
];

export function MarketingHeader({ isLoggedIn = false }: Props) {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:gap-4 sm:px-6">
        <NavLink href={`/${locale}`} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <GlintBrandIcon
            className="h-9 w-9 shadow-md shadow-slate-900/20 transition-shadow group-hover:shadow-lg group-hover:shadow-slate-900/25 sm:h-10 sm:w-10"
          />
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              {tBrand("name")}
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-emerald-700 sm:text-xs">
              {tBrand("product")}
            </span>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {navLinks.map(({ href, key }) => (
            <a
              key={key}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex sm:gap-3">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <NavLink href={`/${locale}/app`}>
              <Button size="sm">{t("dashboard")}</Button>
            </NavLink>
          ) : (
            <>
              <NavLink href={`/${locale}/login`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50"
                >
                  {t("login")}
                </Button>
              </NavLink>
              <NavLink href={`/${locale}/signup`}>
                <Button size="sm" className="shadow-sm shadow-emerald-600/25">
                  {t("signup")}
                </Button>
              </NavLink>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="marketing-mobile-nav"
          aria-label={t("openMenu")}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          id="marketing-mobile-nav"
          side="right"
          className="w-[min(100%,20rem)] p-0"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>

          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-sm font-bold text-slate-900">{tBrand("name")}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {tBrand("product")}
              </p>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
              {navLinks.map(({ href, key }) => (
                <a
                  key={key}
                  href={href}
                  onClick={closeMenu}
                  className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {t(key)}
                </a>
              ))}
            </nav>

            <div className="space-y-4 border-t border-slate-200 p-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("language")}
                </p>
                <LanguageSwitcher className="w-full justify-center" />
              </div>

              <div className="flex flex-col gap-2">
                {isLoggedIn ? (
                  <NavLink href={`/${locale}/app`} onClick={closeMenu}>
                    <Button className="w-full">{t("dashboard")}</Button>
                  </NavLink>
                ) : (
                  <>
                    <NavLink href={`/${locale}/signup`} onClick={closeMenu}>
                      <Button className="w-full shadow-sm shadow-emerald-600/25">
                        {t("signup")}
                      </Button>
                    </NavLink>
                    <NavLink href={`/${locale}/login`} onClick={closeMenu}>
                      <Button variant="outline" className="w-full border-slate-300">
                        {t("login")}
                      </Button>
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
