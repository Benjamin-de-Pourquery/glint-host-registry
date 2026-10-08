import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { GUIDE_INDEX_GROUPS, footerLabelKeyForGuide } from "@/lib/guides/catalog";
import { buildLocalizedPath } from "@/lib/seo/metadata";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";
import { routing } from "@/i18n/routing";
import type { SeoPageKey } from "@/lib/seo/page-paths";
import { getPageLocales } from "@/lib/seo/guide-routing";

type Locale = (typeof routing.locales)[number];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guidesIndex");
}

function guideVisibleInLocale(locale: Locale, page: SeoPageKey): boolean {
  return getPageLocales(page).includes(locale);
}

export default async function GuidesIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "guides.index" });
  const tFooter = await getTranslations("landing.footer");

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-medium text-emerald-700">{t("label")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-slate-600">{t("intro")}</p>

        <div className="mt-12 space-y-10">
          {GUIDE_INDEX_GROUPS.map((group) => {
            const pages = group.pages.filter((page) => guideVisibleInLocale(loc, page));
            if (pages.length === 0) {
              return null;
            }
            return (
              <section key={group.id}>
                <h2 className="text-lg font-semibold text-slate-900">{t(group.labelKey)}</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {pages.map((page) => (
                    <li key={page}>
                      <Link
                        href={buildLocalizedPath(loc, page)}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {tFooter(footerLabelKeyForGuide(page))}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="mt-12">
          <Link href={`/${locale}`} className="text-sm font-medium text-emerald-700 hover:underline">
            ← {t("backHome")}
          </Link>
        </p>
      </main>
      <LandingFooter locale={locale} />
    </div>
  );
}
