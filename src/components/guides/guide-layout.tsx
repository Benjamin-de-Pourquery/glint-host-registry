import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";

type Props = {
  locale: string;
  title: string;
  updated: string;
  children: React.ReactNode;
};

export async function GuideLayout({ locale, title, updated, children }: Props) {
  const t = await getTranslations({ locale, namespace: "guides" });

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-medium text-emerald-700">{t("label")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{updated}</p>
        <div className="prose prose-slate mt-10 max-w-none">{children}</div>
        <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">{t("cta.title")}</h2>
          <p className="mt-2 text-slate-600">{t("cta.description")}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/${locale}/signup`}>
              <Button>{t("cta.button")}</Button>
            </Link>
            <Link href={`/${locale}`}>
              <Button variant="outline">{t("cta.home")}</Button>
            </Link>
          </div>
        </div>
        <p className="mt-8">
          <Link href={`/${locale}`} className="text-sm font-medium text-emerald-700 hover:underline">
            ← {t("backHome")}
          </Link>
        </p>
      </article>
      <LandingFooter locale={locale} />
    </div>
  );
}
