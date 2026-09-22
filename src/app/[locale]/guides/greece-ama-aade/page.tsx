import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideGreeceAmaAade");
}

export default async function GuideGreeceAmaAadePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.greeceAmaAade" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.ama.title")}</h2>
      <p>{t("sections.ama.body")}</p>
      <h2>{t("sections.declaration.title")}</h2>
      <p>{t("sections.declaration.body")}</p>
      <h2>{t("sections.distinct.title")}</h2>
      <p>{t("sections.distinct.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
