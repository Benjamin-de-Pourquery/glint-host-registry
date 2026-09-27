import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideBerlinAirbnbRegistrationFr");
}

export default async function GuideBerlinAirbnbRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.berlinAirbnbRegistration" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.bezirk.title")}</h2>
      <p>{t("sections.bezirk.body")}</p>
      <h2>{t("sections.number.title")}</h2>
      <p>{t("sections.number.body")}</p>
      <h2>{t("sections.euDigital.title")}</h2>
      <p>{t("sections.euDigital.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
