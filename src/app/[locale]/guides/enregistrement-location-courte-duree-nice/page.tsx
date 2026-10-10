import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { GuideInlineText } from "@/components/guides/guide-inline-text";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { NICE_EXTRA_RELATED, FRANCE_CITY_RELATED } from "@/lib/guides/france-related";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideNiceStrRegistrationFr");
}

export default async function GuideNiceStrRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.niceStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideNiceStrRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.primaryCap.title")}</h2>
      <p>{t("sections.primaryCap.body")}</p>
      <h2>{t("sections.nonPrimary.title")}</h2>
      <p>{t("sections.nonPrimary.body")}</p>
      <h2>{t("sections.compensation.title")}</h2>
      <p>{t("sections.compensation.body")}</p>
      <h2>{t("sections.quotaZones.title")}</h2>
      <p>{t("sections.quotaZones.body")}</p>
      <h2>{t("sections.registration.title")}</h2>
      <p>{t("sections.registration.body")}</p>
      <h2>{t("sections.taxeSejour.title")}</h2>
      <p>{t("sections.taxeSejour.body")}</p>
      <h2>{t("sections.sanctions.title")}</h2>
      <p>{t("sections.sanctions.body")}</p>
      <h2>{t("sections.national.title")}</h2>
      <p>
        <GuideInlineText locale={locale} text={t("sections.national.body")} />
      </p>
      <h2>{t("sections.related.title")}</h2>
      <GuideRelatedLinks locale={locale} pages={[...NICE_EXTRA_RELATED, ...FRANCE_CITY_RELATED]} />
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
