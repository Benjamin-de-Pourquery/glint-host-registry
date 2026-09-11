"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
      <Button
        variant={locale === "en" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => switchLocale("en")}
        className="h-7 px-2 text-xs"
      >
        EN
      </Button>
      <Button
        variant={locale === "fr" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => switchLocale("fr")}
        className="h-7 px-2 text-xs"
      >
        FR
      </Button>
    </div>
  );
}
