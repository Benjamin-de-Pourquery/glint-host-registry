import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PrePurchaseJourneyPage } from "@/components/pre-purchase/pre-purchase-journey-page";
import { prePurchaseLanguageAlternates, prePurchaseCanonicalUrl } from "@/lib/pre-purchase/paths";
import { pickLocale } from "@/lib/pre-purchase/locale";
import { SITE_NAME } from "@/lib/seo/site";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = pickLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "prePurchase" });
  const title = t("pageTitle");
  const description = t("pageDescription");
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: prePurchaseCanonicalUrl(locale),
      languages: prePurchaseLanguageAlternates(),
    },
    openGraph: {
      title: fullTitle,
      description,
      url: prePurchaseCanonicalUrl(locale),
    },
  };
}

export default async function StrPrePurchaseJourneyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (locale === "fr") {
    const sp = await searchParams;
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (typeof value === "string") qs.set(key, value);
      else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`/fr/outils/parcours-achat-location-courte-duree${suffix}`);
  }

  return (
    <PrePurchaseJourneyPage locale={locale} searchParams={await searchParams} />
  );
}
