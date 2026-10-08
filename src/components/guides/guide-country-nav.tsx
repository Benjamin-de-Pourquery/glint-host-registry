import { getTranslations } from "next-intl/server";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { getCountryNavForPage } from "@/lib/guides/country-nav";
import { getGuideLocalePair } from "@/lib/seo/guide-routing";
import type { SeoPageKey } from "@/lib/seo/page-paths";

function isSameGuideTopic(page: SeoPageKey, excludePage?: SeoPageKey): boolean {
  if (!excludePage) {
    return false;
  }
  if (page === excludePage) {
    return true;
  }
  const pair = getGuideLocalePair(page);
  if (pair) {
    return pair.en === excludePage || pair.fr === excludePage;
  }
  const excludePair = getGuideLocalePair(excludePage);
  if (excludePair) {
    return excludePair.en === page || excludePair.fr === page;
  }
  return false;
}

type Props = {
  locale: string;
  seoPage: SeoPageKey;
};

export async function GuideCountryNav({ locale, seoPage }: Props) {
  const nav = getCountryNavForPage(seoPage);
  if (!nav) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "guides.crossLinks" });

  const national = nav.national.filter((page) => !isSameGuideTopic(page, seoPage));
  const cities = nav.cities.filter((page) => !isSameGuideTopic(page, seoPage));

  if (national.length === 0 && cities.length === 0) {
    return null;
  }

  return (
    <aside className="not-prose mt-10 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      {national.length > 0 ? (
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t("nationalTitle")}</h2>
          <GuideRelatedLinks locale={locale} pages={national} excludePage={seoPage} />
        </div>
      ) : null}
      {cities.length > 0 ? (
        <div className={national.length > 0 ? "mt-6" : undefined}>
          <h2 className="text-base font-semibold text-slate-900">{t("citiesTitle")}</h2>
          <GuideRelatedLinks locale={locale} pages={cities} excludePage={seoPage} />
        </div>
      ) : null}
    </aside>
  );
}
