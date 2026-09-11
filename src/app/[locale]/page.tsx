import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus_Jakarta_Sans } from "next/font/google";
import { auth } from "@/lib/auth";
import { MarketingHeader } from "@/components/marketing-header";
import { HeroMock } from "@/components/landing/hero-mock";
import { TrustStrip } from "@/components/landing/trust-strip";
import { FeatureBento } from "@/components/landing/feature-bento";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

type Props = { params: Promise<{ locale: string }> };

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("landing");

  const problemKeys = ["1", "2", "3"];
  const solutionKeys = ["1", "2", "3"];

  return (
    <div className={`landing-page ${jakarta.variable} min-h-screen bg-slate-50 font-[family-name:var(--font-jakarta)]`}>
      <MarketingHeader isLoggedIn={!!session?.user?.id} />

      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="landing-fade-in max-w-xl">
              <Badge className="mb-6 border-emerald-200/80 bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
                {t("hero.badge")}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                {t("hero.title")}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">{t("hero.subtitle")}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/${locale}/signup`}>
                  <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-600/20">
                    {t("hero.cta")}
                  </Button>
                </Link>
                <Link href={`/${locale}/login`}>
                  <Button variant="outline" size="lg" className="w-full border-slate-200 sm:w-auto">
                    {t("hero.ctaLogin")}
                  </Button>
                </Link>
              </div>
              <p className="mt-4">
                <a
                  href="#features"
                  className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline"
                >
                  {t("hero.ctaSecondary")} →
                </a>
              </p>
            </div>

            <div className="landing-fade-in-delay">
              <HeroMock />
            </div>
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <div className="mb-4 flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">May 2026</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t("problem.title")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{t("problem.description")}</p>
            <ul className="mt-8 space-y-4">
              {problemKeys.map((key) => (
                <li key={key} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{t(`problem.points.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">{t("solution.title")}</h3>
            <p className="mt-4 leading-relaxed text-slate-600">{t("solution.description")}</p>
            <ul className="mt-8 space-y-4">
              {solutionKeys.map((key) => (
                <li key={key} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{t(`solution.points.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FeatureBento />
      <PricingSection locale={locale} />
      <FaqSection />

      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-24">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,rgba(16,185,129,0.15),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("cta.title")}</h2>
          <p className="mt-4 text-lg text-slate-400">{t("cta.subtitle")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/signup`}>
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-600/30">
                {t("cta.button")}
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-slate-700 bg-transparent text-white hover:bg-slate-900 hover:text-white sm:w-auto"
              >
                {t("cta.login")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter locale={locale} />
    </div>
  );
}
