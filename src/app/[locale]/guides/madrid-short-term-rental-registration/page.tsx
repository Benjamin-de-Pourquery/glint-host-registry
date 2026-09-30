import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideMadridStrRegistration");
}

export default async function GuideMadridStrRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.madridStrRegistration" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.nrua.title")}</h2>
      <p>{t("sections.nrua.body")}</p>
      <h2>{t("sections.decreto.title")}</h2>
      <p>{t("sections.decreto.body")}</p>
      <h2>{t("sections.regional.title")}</h2>
      <p>{t("sections.regional.body")}</p>
      <h2>{t("sections.municipal.title")}</h2>
      <p>{t("sections.municipal.body")}</p>
      <h2>{t("sections.platforms.title")}</h2>
      <p>{t("sections.platforms.body")}</p>
      <h2>{t("sections.ses.title")}</h2>
      <p>{t("sections.ses.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
