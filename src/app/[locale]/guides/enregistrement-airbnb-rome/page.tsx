import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { ITALY_NATIONAL_RELATED } from "@/lib/guides/italy-related";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideRomeAirbnbRegistrationFr");
}

export default async function GuideRomeAirbnbRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.romeAirbnbRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideRomeAirbnbRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.airbnbField.title")}</h2>
      <p>{t("sections.airbnbField.body")}</p>
      <h2>{t("sections.beforeList.title")}</h2>
      <p>{t("sections.beforeList.body")}</p>
      <h2>{t("sections.display.title")}</h2>
      <p>{t("sections.display.body")}</p>
      <h2>{t("sections.related.title")}</h2>
      <GuideRelatedLinks
        locale={locale}
        pages={["guideRomeStrRegistration", ...ITALY_NATIONAL_RELATED]}
      />
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
