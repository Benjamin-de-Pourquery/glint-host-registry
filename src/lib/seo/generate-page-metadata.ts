import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, type SeoPageKey } from "./metadata";

type Locale = (typeof routing.locales)[number];

export async function generatePageMetadata(locale: string, page: SeoPageKey) {
  if (!routing.locales.includes(locale as Locale)) {
    return buildPageMetadata({
      locale: routing.defaultLocale,
      page,
      title: "Glint Host Registry",
      description: "EU short-term rental compliance for hosts.",
    });
  }

  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPageMetadata({
    locale: locale as Locale,
    page,
    title: t(`${page}.title`),
    description: t(`${page}.description`),
  });
}
