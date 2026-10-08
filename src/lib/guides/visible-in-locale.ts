import { routing } from "@/i18n/routing";
import { getLocalizedPageKey, getPageLocales } from "@/lib/seo/guide-routing";
import type { SeoPageKey } from "@/lib/seo/page-paths";
import { GUIDE_INDEX_GROUPS } from "@/lib/guides/catalog";

type Locale = (typeof routing.locales)[number];

export function guideVisibleInLocale(locale: Locale, page: SeoPageKey): boolean {
  return getPageLocales(getLocalizedPageKey(page, locale)).includes(locale);
}

export function countGuideIndexLinks(locale: Locale): number {
  let count = 0;
  for (const group of GUIDE_INDEX_GROUPS) {
    for (const page of group.pages) {
      if (guideVisibleInLocale(locale, page)) {
        count += 1;
      }
    }
  }
  return count;
}
