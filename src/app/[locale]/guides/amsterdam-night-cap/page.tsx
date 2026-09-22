import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideAmsterdamNightCap");
}

export default async function GuideAmsterdamNightCapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.amsterdamNightCap" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.registration.title")}</h2>
      <p>{t("sections.registration.body")}</p>
      <h2>{t("sections.permit.title")}</h2>
      <p>{t("sections.permit.body")}</p>
      <h2>{t("sections.nightCap.title")}</h2>
      <p>{t("sections.nightCap.body")}</p>
      <h2>{t("sections.notification.title")}</h2>
      <p>{t("sections.notification.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
