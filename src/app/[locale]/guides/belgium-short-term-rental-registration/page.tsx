import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideBelgiumStrRegistration");
}

export default async function GuideBelgiumStrRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.belgiumStrRegistration" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.regions.title")}</h2>
      <p>{t("sections.regions.body")}</p>
      <h2>{t("sections.eu.title")}</h2>
      <p>{t("sections.eu.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
