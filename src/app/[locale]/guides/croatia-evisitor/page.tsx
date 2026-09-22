import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideCroatiaEvisitor");
}

export default async function GuideCroatiaEvisitorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.croatiaEvisitor" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.categorisation.title")}</h2>
      <p>{t("sections.categorisation.body")}</p>
      <h2>{t("sections.evisitor.title")}</h2>
      <p>{t("sections.evisitor.body")}</p>
      <h2>{t("sections.reporting.title")}</h2>
      <p>{t("sections.reporting.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
