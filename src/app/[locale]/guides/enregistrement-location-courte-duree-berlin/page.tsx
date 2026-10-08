import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideBerlinStrRegistrationFr");
}

export default async function GuideBerlinStrRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.berlinStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideBerlinStrRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.zwvb.title")}</h2>
      <p>{t("sections.zwvb.body")}</p>
      <h2>{t("sections.eu.title")}</h2>
      <p>{t("sections.eu.body")}</p>
      <h2>{t("sections.transition.title")}</h2>
      <p>{t("sections.transition.body")}</p>
      <h2>{t("sections.operator.title")}</h2>
      <p>{t("sections.operator.body")}</p>
      <h2>{t("sections.platforms.title")}</h2>
      <p>{t("sections.platforms.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
