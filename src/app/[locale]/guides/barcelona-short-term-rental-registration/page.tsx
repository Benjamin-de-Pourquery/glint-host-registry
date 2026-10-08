import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideBarcelonaStrRegistration");
}

export default async function GuideBarcelonaStrRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.barcelonaStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideBarcelonaStrRegistration" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.nrua.title")}</h2>
      <p>{t("sections.nrua.body")}</p>
      <h2>{t("sections.hut.title")}</h2>
      <p>{t("sections.hut.body")}</p>
      <h2>{t("sections.barcelona.title")}</h2>
      <p>{t("sections.barcelona.body")}</p>
      <h2>{t("sections.platforms.title")}</h2>
      <p>{t("sections.platforms.body")}</p>
      <h2>{t("sections.mossos.title")}</h2>
      <p>{t("sections.mossos.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
