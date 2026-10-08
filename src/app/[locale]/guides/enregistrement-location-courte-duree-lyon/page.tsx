import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { GuideInlineText } from "@/components/guides/guide-inline-text";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { FRANCE_CITY_RELATED, LYON_EXTRA_RELATED } from "@/lib/guides/france-related";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideLyonStrRegistrationFr");
}

export default async function GuideLyonStrRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.lyonStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideLyonStrRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.fourPaths.title")}</h2>
      <p>{t("sections.fourPaths.body")}</p>
      <h2>{t("sections.declare.title")}</h2>
      <p>{t("sections.declare.body")}</p>
      <h2>{t("sections.copro.title")}</h2>
      <p>{t("sections.copro.body")}</p>
      <h2>{t("sections.sanctions.title")}</h2>
      <p>{t("sections.sanctions.body")}</p>
      <h2>{t("sections.taxe.title")}</h2>
      <p>{t("sections.taxe.body")}</p>
      <h2>{t("sections.national.title")}</h2>
      <p>
        <GuideInlineText locale={locale} text={t("sections.national.body")} />
      </p>
      <h2>{t("sections.related.title")}</h2>
      <GuideRelatedLinks locale={locale} pages={[...LYON_EXTRA_RELATED, ...FRANCE_CITY_RELATED]} />
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
