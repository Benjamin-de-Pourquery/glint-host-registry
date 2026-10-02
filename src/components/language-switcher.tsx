"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { switchLocaleInPathname } from "@/lib/seo/guide-routing";

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    router.push(switchLocaleInPathname(pathname, newLocale as "en" | "fr"));
  };

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-slate-200 p-0.5", className)}>
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
