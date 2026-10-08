import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideDublinAirbnbRegistrationFr");
}

export default async function GuideDublinAirbnbRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.dublinAirbnbRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideDublinAirbnbRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.register.title")}</h2>
      <p>{t("sections.register.body")}</p>
      <h2>{t("sections.airbnb.title")}</h2>
      <p>{t("sections.airbnb.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
