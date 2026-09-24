"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { NavLink } from "@/components/navigation/nav-link";
import { GlintBrandIcon } from "@/components/brand/glint-brand-icon";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLocaleSwitcher } from "@/components/auth/auth-locale-switcher";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Shared auth chrome aligned with Label Registry sign-in layout.
 */
export function AuthPageShell({
  title,
  description,
  children,
  footer,
  className,
}: Props) {
  const locale = useLocale();
  const tBrand = useTranslations("brand");

  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <NavLink href={`/${locale}`} className="group flex min-w-0 items-center gap-2.5">
          <GlintBrandIcon
            className="h-7 w-7 rounded-lg ring-1 ring-slate-200/80 shadow-md shadow-slate-900/20 transition-shadow group-hover:shadow-lg group-hover:shadow-slate-900/25 sm:h-8 sm:w-8"
          />
          <BrandWordmark
            product={tBrand("product")}
            byGlint={tBrand("byGlint")}
            variant="auth"
          />
        </NavLink>
        <AuthLocaleSwitcher />
      </header>

      <main
        className={cn(
          "flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:pt-16",
          className,
        )}
      >
        <Card
          className="w-full max-w-sm border-0 shadow-none ring-1 ring-slate-900/10"
        >
          <CardHeader className="gap-1 text-left sm:text-left">
            <CardTitle className="text-xl font-medium tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-slate-500">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            {footer}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function AuthFormFooter({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-sm text-slate-500">{children}</p>
  );
}

export function AuthTextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <NavLink
      href={href}
      className="font-medium text-slate-900 underline-offset-4 hover:underline"
    >
      {children}
    </NavLink>
  );
}

export const authPrimaryButtonClassName =
  "w-full bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900";
