"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: Props) {
  const t = useTranslations("appError");
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : "fr";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-slate-900">{t("title")}</h1>
      <p className="text-sm text-slate-600">{t("description")}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button type="button" onClick={() => reset()}>
          {t("retry")}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/${locale}/app`}>{t("dashboard")}</Link>
        </Button>
      </div>
    </div>
  );
}
