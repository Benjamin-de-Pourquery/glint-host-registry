import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader isLoggedIn={!!session?.user?.id} />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {t("title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">{t("description")}</p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/${locale}`}>{t("homeCta")}</Link>
          </Button>
          {session?.user?.id ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/${locale}/app`}>{t("appCta")}</Link>
            </Button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
