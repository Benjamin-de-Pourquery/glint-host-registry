"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AppSidebar, SidebarBrand, SidebarContent } from "@/components/app-sidebar";
import { PageTransition } from "@/components/navigation/page-transition";

type Props = {
  children: React.ReactNode;
  unreadCount: number;
};

export function AppShell({ children, unreadCount }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <div className="app-shell flex min-h-screen overflow-x-hidden bg-slate-50">
      <AppSidebar unreadCount={unreadCount} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 shadow-sm shadow-slate-900/[0.03] backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            aria-expanded={mobileNavOpen}
            aria-controls="app-mobile-nav"
            aria-label={t("openMenu")}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          <SidebarBrand className="min-w-0 flex-1 border-0 px-0" />

          {unreadCount > 0 && (
            <span
              className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </header>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            id="app-mobile-nav"
            side="left"
            className="w-64 max-w-[85vw] p-0 [&>button]:hidden"
            aria-describedby={undefined}
          >
            <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
            <SidebarContent
              unreadCount={unreadCount}
              onNavigate={() => setMobileNavOpen(false)}
              className="h-full"
            />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-6xl p-4 lg:p-6 xl:p-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
