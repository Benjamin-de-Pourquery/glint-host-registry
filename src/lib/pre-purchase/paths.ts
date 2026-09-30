import { getSiteUrl } from "@/lib/seo/site";
import type { Locale } from "./locale";

export const PRE_PURCHASE_PATH: Record<Locale, string> = {
  en: "/tools/str-pre-purchase-journey",
  fr: "/outils/parcours-achat-location-courte-duree",
};

export const PRE_PURCHASE_REPORT_PATH: Record<Locale, string> = {
  en: "/tools/str-pre-purchase-journey/report",
  fr: "/outils/parcours-achat-location-courte-duree/rapport",
};

export function prePurchasePathForLocale(locale: Locale): string {
  return PRE_PURCHASE_PATH[locale];
}

export function prePurchaseCanonicalUrl(locale: Locale): string {
  return `${getSiteUrl()}/${locale}${PRE_PURCHASE_PATH[locale]}`;
}

export function prePurchaseLanguageAlternates(): Record<string, string> {
  return {
    en: prePurchaseCanonicalUrl("en"),
    fr: prePurchaseCanonicalUrl("fr"),
    "x-default": prePurchaseCanonicalUrl("en"),
  };
}
