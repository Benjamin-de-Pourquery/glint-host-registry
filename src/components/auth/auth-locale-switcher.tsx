"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { NavLink } from "@/components/navigation/nav-link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * Auth header language control (Label Registry sign-in pattern).
 */
export function AuthLocaleSwitcher({ className }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("auth.shell");

  const buildHref = (targetLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = targetLocale;
    return segments.join("/") || `/${targetLocale}`;
  };

  const locales = [
    { code: "fr", label: "fr" },
    { code: "en", label: "en" },
  ] as const;

  return (
    <nav
      aria-label={t("language")}
      className={cn("flex items-center gap-1 text-xs font-semibold", className)}
    >
      {locales.map(({ code, label }) => {
        const active = locale === code;
        return (
          <NavLink
            key={code}
            href={buildHref(code)}
            hrefLang={code}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md px-2 py-1 uppercase transition-colors",
              active
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}
