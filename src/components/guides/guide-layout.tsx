import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { GuideCountryNav } from "@/components/guides/guide-country-nav";
import { Button } from "@/components/ui/button";
import type { SeoPageKey } from "@/lib/seo/page-paths";

type Props = {
  locale: string;
  title: string;
  updated: string;
  seoPage?: SeoPageKey;
  children: React.ReactNode;
};

export async function GuideLayout({ locale, title, updated, seoPage, children }: Props) {
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
        <div
          className="guide-prose prose prose-slate mt-10 max-w-none text-slate-700 prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-h2:mt-10 prose-h2:text-xl prose-h2:scroll-mt-24 prose-p:leading-7 prose-a:font-medium prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline"
        >
          {children}
        </div>
        {seoPage ? <GuideCountryNav locale={locale} seoPage={seoPage} /> : null}
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
        <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2">
          <Link href={`/${locale}/guides`} className="text-sm font-medium text-emerald-700 hover:underline">
            ← {t("backToIndex")}
          </Link>
          <Link href={`/${locale}`} className="text-sm font-medium text-emerald-700 hover:underline">
            {t("backHome")}
          </Link>
        </p>
      </article>
      <LandingFooter locale={locale} />
    </div>
  );
}
