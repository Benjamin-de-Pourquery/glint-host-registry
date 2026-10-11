import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { GuideInlineText } from "@/components/guides/guide-inline-text";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { PORTUGAL_NATIONAL_RELATED } from "@/lib/guides/portugal-related";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideLisbonStrRegistration");
}

export default async function GuideLisbonStrRegistrationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.lisbonStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideLisbonStrRegistration" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.nationalRegime.title")}</h2>
      <p>{t("sections.nationalRegime.body")}</p>
      <h2>{t("sections.rnal.title")}</h2>
      <p>{t("sections.rnal.body")}</p>
      <h2>{t("sections.lisbonContainment.title")}</h2>
      <p>{t("sections.lisbonContainment.body")}</p>
      <h2>{t("sections.municipalRegulation.title")}</h2>
      <p>{t("sections.municipalRegulation.body")}</p>
      <h2>{t("sections.siba.title")}</h2>
      <p>{t("sections.siba.body")}</p>
      <h2>{t("sections.touristTax.title")}</h2>
      <p>{t("sections.touristTax.body")}</p>
      <h2>{t("sections.platforms.title")}</h2>
      <p>{t("sections.platforms.body")}</p>
      <h2>{t("sections.national.title")}</h2>
      <p>
        <GuideInlineText locale={locale} text={t("sections.national.body")} />
      </p>
      <h2>{t("sections.related.title")}</h2>
      <GuideRelatedLinks
        locale={locale}
        pages={["guideLisbonAirbnbRegistration", ...PORTUGAL_NATIONAL_RELATED]}
      />
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
