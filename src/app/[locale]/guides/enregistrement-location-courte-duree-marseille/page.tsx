import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { GuideInlineText } from "@/components/guides/guide-inline-text";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { FRANCE_CITY_RELATED } from "@/lib/guides/france-related";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideMarseilleStrRegistrationFr");
}

export default async function GuideMarseilleStrRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.marseilleStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideMarseilleStrRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.declaration.title")}</h2>
      <p>{t("sections.declaration.body")}</p>
      <h2>{t("sections.primaryCap.title")}</h2>
      <p>{t("sections.primaryCap.body")}</p>
      <h2>{t("sections.nonPrimary.title")}</h2>
      <p>{t("sections.nonPrimary.body")}</p>
      <h2>{t("sections.compensation.title")}</h2>
      <p>{t("sections.compensation.body")}</p>
      <h2>{t("sections.dpeBuilding.title")}</h2>
      <p>{t("sections.dpeBuilding.body")}</p>
      <h2>{t("sections.procedure.title")}</h2>
      <p>{t("sections.procedure.body")}</p>
      <h2>{t("sections.sanctions.title")}</h2>
      <p>{t("sections.sanctions.body")}</p>
      <h2>{t("sections.taxeSejour.title")}</h2>
      <p>{t("sections.taxeSejour.body")}</p>
      <h2>{t("sections.national.title")}</h2>
      <p>
        <GuideInlineText locale={locale} text={t("sections.national.body")} />
      </p>
      <h2>{t("sections.related.title")}</h2>
      <GuideRelatedLinks locale={locale} pages={FRANCE_CITY_RELATED} />
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
