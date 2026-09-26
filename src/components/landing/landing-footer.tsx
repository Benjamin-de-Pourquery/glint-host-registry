import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { GlintBrandIcon } from "@/components/brand/glint-brand-icon";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { suiteProductUrl } from "@/lib/suite-urls";

type Props = { locale: string };

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
                <Link
                  href={`/${locale}/guides/numero-enregistrement-meuble`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/migration-ner-2026`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideFrNerMigration")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/ses-hospedajes-espagne`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideSes")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/fiche-police-voyageurs`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideGuestRegister")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/amsterdam-night-cap`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideAmsterdamNightCap")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/italy-cin-alloggiati`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideItalyCinAlloggiati")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/rnal-siba-portugal`}
                  className="transition-colors hover:text-white"
                >
                  {t("guidePortugalRnalSiba")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/greece-ama-aade`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideGreeceAmaAade")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/croatia-evisitor`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideCroatiaEvisitor")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/belgium-short-term-rental-registration`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBelgiumStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/brussels-airbnb-registration`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideBrusselsAirbnbRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/vienna-short-term-rental-registration`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideViennaStrRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/guides/vienna-airbnb-registration`}
                  className="transition-colors hover:text-white"
                >
                  {t("guideViennaAirbnbRegistration")}
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
