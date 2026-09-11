"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  LayoutDashboard,
  Building2,
  Bell,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";

const navItems = [
  { href: "/app", icon: LayoutDashboard, labelKey: "dashboard" as const },
  { href: "/app/properties", icon: Building2, labelKey: "properties" as const },
  { href: "/app/notifications", icon: Bell, labelKey: "notifications" as const },
  { href: "/app/settings", icon: Settings, labelKey: "settings" as const },
];

export function AppSidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-slate-900">{tBrand("name")}</span>
          <span className="text-xs text-slate-500">{tBrand("product")}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive =
            item.href === "/app"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
              {item.labelKey === "notifications" && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 space-y-2">
        <LanguageSwitcher />
        <SignOutButton />
      </div>
    </aside>
  );
}
