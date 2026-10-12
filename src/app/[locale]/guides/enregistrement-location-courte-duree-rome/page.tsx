import { setRequestLocale, getTranslations } from "next-intl/server";
import { GuideLayout } from "@/components/guides/guide-layout";
import { GuideInlineText } from "@/components/guides/guide-inline-text";
import { GuideRelatedLinks } from "@/components/guides/guide-related-links";
import { ITALY_NATIONAL_RELATED } from "@/lib/guides/italy-related";
import { generatePageMetadata } from "@/lib/seo/generate-page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return generatePageMetadata(locale, "guideRomeStrRegistrationFr");
}

export default async function GuideRomeStrRegistrationFrPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "guides.romeStrRegistration" });

  return (
    <GuideLayout locale={locale} seoPage="guideRomeStrRegistrationFr" title={t("title")} updated={t("updated")}>
      <p>{t("intro")}</p>
      <h2>{t("sections.nationalLaw.title")}</h2>
      <p>{t("sections.nationalLaw.body")}</p>
      <h2>{t("sections.ciaScia.title")}</h2>
      <p>{t("sections.ciaScia.body")}</p>
      <h2>{t("sections.prgNta.title")}</h2>
      <p>{t("sections.prgNta.body")}</p>
      <h2>{t("sections.municipalRegulation.title")}</h2>
      <p>{t("sections.municipalRegulation.body")}</p>
      <h2>{t("sections.cin.title")}</h2>
      <p>{t("sections.cin.body")}</p>
      <h2>{t("sections.alloggiati.title")}</h2>
      <p>{t("sections.alloggiati.body")}</p>
      <h2>{t("sections.lazioCopy.title")}</h2>
      <p>{t("sections.lazioCopy.body")}</p>
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
        pages={["guideRomeAirbnbRegistration", ...ITALY_NATIONAL_RELATED]}
      />
      <h2>{t("sections.glint.title")}</h2>
      <p>{t("sections.glint.body")}</p>
    </GuideLayout>
  );
}
