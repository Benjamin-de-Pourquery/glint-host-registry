import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideMunichAirbnbRegistration");
}

export default async function GuideMunichAirbnbRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.munichAirbnbRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideMunichAirbnbRegistration" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.unitType.title")}</h2>
      <p>{t("sections.unitType.body")}</p>
      <h2>{t("sections.portal.title")}</h2>
      <p>{t("sections.portal.body")}</p>
      <h2>{t("sections.number.title")}</h2>
      <p>{t("sections.number.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
