import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideMunichStrRegistration");
}

export default async function GuideMunichStrRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.munichStrRegistration" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.zes.title")}</h2>
      <p>{t("sections.zes.body")}</p>
      <h2>{t("sections.section5a.title")}</h2>
      <p>{t("sections.section5a.body")}</p>
      <h2>{t("sections.portal.title")}</h2>
      <p>{t("sections.portal.body")}</p>
      <h2>{t("sections.genehmigung.title")}</h2>
      <p>{t("sections.genehmigung.body")}</p>
      <h2>{t("sections.eu.title")}</h2>
      <p>{t("sections.eu.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
