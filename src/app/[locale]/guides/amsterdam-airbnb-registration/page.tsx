import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideAmsterdamAirbnbRegistration");
}

export default async function GuideAmsterdamAirbnbRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.amsterdamAirbnbRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideAmsterdamAirbnbRegistration" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.airbnbField.title")}</h2>
      <p>{t("sections.airbnbField.body")}</p>
      <h2>{t("sections.beforeList.title")}</h2>
      <p>{t("sections.beforeList.body")}</p>
      <h2>{t("sections.display.title")}</h2>
      <p>{t("sections.display.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
