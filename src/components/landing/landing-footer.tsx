import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Shield } from "lucide-react";

type Props = { locale: string };

export async function LandingFooter({ locale }: Props) {
  const t = await getTranslations("landing.footer");
  const tNav = await getTranslations("nav");
  const tBrand = await getTranslations("brand");

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-14 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold">{tBrand("name")} {tBrand("product")}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{tBrand("tagline")}</p>
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
