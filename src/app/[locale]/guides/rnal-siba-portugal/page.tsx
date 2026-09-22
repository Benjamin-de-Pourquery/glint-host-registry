import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guidePortugalRnalSiba");
}

export default async function GuidePortugalRnalSibaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.portugalRnalSiba" });

  return (
    <GuideLayout locale={locale} title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.rnal.title")}</h2>
      <p>{t("sections.rnal.body")}</p>
      <h2>{t("sections.siba.title")}</h2>
      <p>{t("sections.siba.body")}</p>
      <h2>{t("sections.phases.title")}</h2>
      <p>{t("sections.phases.body")}</p>
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
