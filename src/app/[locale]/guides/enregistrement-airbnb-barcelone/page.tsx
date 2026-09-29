import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideBarcelonaAirbnbRegistrationFr");
}

export default async function GuideBarcelonaAirbnbRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.barcelonaAirbnbRegistration" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.airbnbField.title")}</h2>
      <p>{t("sections.airbnbField.body")}</p>
      <h2>{t("sections.dossier.title")}</h2>
      <p>{t("sections.dossier.body")}</p>
      <h2>{t("sections.display.title")}</h2>
      <p>{t("sections.display.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
