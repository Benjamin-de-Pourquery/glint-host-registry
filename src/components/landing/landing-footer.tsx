import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GlintBrandIcon } from "@/components/brand/glint-brand-icon";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { suiteProductUrl } from "@/lib/suite-urls";
import { buildLocalizedPath } from "@/lib/seo/metadata";
import type { SeoPageKey } from "@/lib/seo/metadata";

type Props = { locale: string };

function guideHref(locale: string, page: SeoPageKey): string {
  return buildLocalizedPath(locale as "en" | "fr", page);
}

export async function LandingFooter({ locale }: Props) {
  const t = await getTranslations("landing.footer");
  const tNav = await getTranslations("nav");
  const tBrand = await getTranslations("brand");

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-14 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-8">
          <div className="md:col-span-2 xl:col-span-1 xl:border-r xl:border-slate-800 xl:pr-8">
            <div className="flex items-center gap-2.5">
              <GlintBrandIcon size={24} />
              <BrandWordmark
                product={tBrand("product")}
                byGlint={tBrand("byGlint")}
                variant="dark"
                productClassName="text-base font-semibold text-white"
                byGlintClassName="text-emerald-400"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed">{tBrand("tagline")}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{tBrand("suiteOneliner")}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white">{t("product")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#features" className="transition-colors hover:text-white">
                  {tNav("features")}
                </a>
              </li>
              <li>
                <a href="#pricing" className="transition-colors hover:text-white">
                  {tNav("pricing")}
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-white">
                  {tNav("faq")}
                </a>
              </li>
            </ul>
          </div>

          <div className="xl:border-r xl:border-slate-800 xl:pr-8">
            <h4 className="font-semibold text-white">{t("suite")}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{t("suiteIntro")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <span className="font-medium text-white" aria-current="page">
                  {t("suiteHost")}
                  <span className="ml-1.5 font-normal text-slate-500">({t("suiteCurrent")})</span>
                </span>
              </li>
              <li>
                <a
                  href={suiteProductUrl("label", locale)}
                  className="transition-colors hover:text-white"
                  rel="noopener noreferrer"
                >
                  {t("suiteLabel")}
                </a>
              </li>
              <li>
                <a
                  href={suiteProductUrl("product", locale)}
                  className="transition-colors hover:text-white"
                  rel="noopener noreferrer"
                >
                  {t("suiteProduct")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">{t("guides")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={`/${locale}/guides`} className="font-medium transition-colors hover:text-white">
                  {t("guidesIndexAll")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideFrNerMigration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideFrNerMigration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideSes")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideSes")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideGuestRegister")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideGuestRegister")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideParisStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideParisStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideParisAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideParisAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideLyonStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideLyonStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideLyonAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideLyonAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMarseilleStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMarseilleStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMarseilleAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMarseilleAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBordeauxStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBordeauxStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBordeauxAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBordeauxAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideAmsterdamNightCap")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideAmsterdamNightCap")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideAmsterdamStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideAmsterdamStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideAmsterdamAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideAmsterdamAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideItalyCinAlloggiati")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideItalyCinAlloggiati")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guidePortugalRnalSiba")}
                  className="transition-colors hover:text-white"
                >
                  {t("guidePortugalRnalSiba")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideGreeceAmaAade")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideGreeceAmaAade")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideCroatiaEvisitor")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideCroatiaEvisitor")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBelgiumStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBelgiumStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBrusselsAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBrusselsAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideViennaStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideViennaStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideViennaAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideViennaAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBerlinStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBerlinStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBerlinAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBerlinAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMunichStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMunichStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMunichAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMunichAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBarcelonaStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBarcelonaStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideBarcelonaAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBarcelonaAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMadridStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMadridStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMadridAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMadridAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideValenciaStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideValenciaStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideValenciaAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideValenciaAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMalagaStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMalagaStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideMalagaAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideMalagaAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideSevilleStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideSevilleStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideSevilleAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideSevilleAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideIrelandStrRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideIrelandStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={guideHref(locale, "guideDublinAirbnbRegistration")}
                  className="transition-colors hover:text-white"
                >
                  {t("guideDublinAirbnbRegistration")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">{t("account")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={`/${locale}/login`} className="transition-colors hover:text-white">
                  {tNav("login")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/signup`} className="transition-colors hover:text-white">
                  {tNav("signup")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">{t("legal")}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={`/${locale}/legal/privacy`} className="transition-colors hover:text-white">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/terms`} className="transition-colors hover:text-white">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/legal/mentions`} className="transition-colors hover:text-white">
                  {t("mentions")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          <p>{t("company")}</p>
          <p className="mt-1">{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
