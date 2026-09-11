import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Building2,
  ClipboardCheck,
  Bell,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const tNav = await getTranslations("nav");
  const tBrand = await getTranslations("brand");

  const features = [
    { icon: Building2, key: "portfolio" },
    { icon: Shield, key: "tracking" },
    { icon: ClipboardCheck, key: "checklist" },
    { icon: Bell, key: "alerts" },
    { icon: FileText, key: "export" },
    { icon: CreditCard, key: "billing" },
  ];

  const faqKeys = ["1", "2", "3", "4", "5"];

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6">{t("hero.badge")}</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-lg text-slate-600 sm:text-xl">{t("hero.subtitle")}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/signup`}>
                <Button size="lg" className="w-full sm:w-auto">{t("hero.cta")}</Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("hero.ctaSecondary")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">May 2026</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">{t("problem.title")}</h2>
            <p className="mt-4 text-slate-600">{t("problem.description")}</p>
            <ul className="mt-6 space-y-3">
              {["1", "2", "3"].map((key) => (
                <li key={key} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {t(`problem.points.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">{t("solution.title")}</h3>
            <p className="mt-3 text-slate-600">{t("solution.description")}</p>
            <ul className="mt-6 space-y-3">
              {["1", "2", "3"].map((key) => (
                <li key={key} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {t(`solution.points.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">{t("features.title")}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, key }) => (
              <Card key={key} className="border-slate-200 shadow-none">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{t(`features.${key}.title`)}</CardTitle>
                  <CardDescription>{t(`features.${key}.description`)}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">{t("pricing.title")}</h2>
            <p className="mt-3 text-slate-600">{t("pricing.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {(["starter", "pro"] as const).map((plan) => (
              <Card
                key={plan}
                className={`relative ${plan === "pro" ? "border-emerald-500 shadow-md" : "border-slate-200"}`}
              >
                {plan === "pro" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {t("pricing.pro.badge")}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{t(`pricing.${plan}.name`)}</CardTitle>
                  <CardDescription>{t(`pricing.${plan}.description`)}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {t(`pricing.${plan}.price`)}
                    </span>
                    <span className="text-slate-500">{t(`pricing.${plan}.period`)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(t.raw(`pricing.${plan}.features`) as string[]).map((feature: string) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/${locale}/signup`} className="mt-6 block">
                    <Button className="w-full" variant={plan === "pro" ? "default" : "outline"}>
                      {t("pricing.cta")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">{t("faq.title")}</h2>
          <div className="mt-12 space-y-6">
            {faqKeys.map((key) => (
              <div key={key} className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900">{t(`faq.items.${key}.q`)}</h3>
                <p className="mt-2 text-slate-600">{t(`faq.items.${key}.a`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white">{t("cta.title")}</h2>
          <p className="mt-4 text-emerald-100">{t("cta.subtitle")}</p>
          <Link href={`/${locale}/signup`} className="mt-8 inline-block">
            <Button size="lg" variant="secondary">{t("cta.button")}</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">{tBrand("name")} {tBrand("product")}</span>
              </div>
              <p className="mt-2 text-sm">{tBrand("tagline")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white">{t("footer.product")}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">{tNav("features")}</a></li>
                <li><a href="#pricing" className="hover:text-white">{tNav("pricing")}</a></li>
                <li><a href="#faq" className="hover:text-white">{tNav("faq")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">{t("footer.legal")}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href={`/${locale}/legal/privacy`} className="hover:text-white">{t("footer.privacy")}</Link></li>
                <li><Link href={`/${locale}/legal/terms`} className="hover:text-white">{t("footer.terms")}</Link></li>
                <li><Link href={`/${locale}/legal/mentions`} className="hover:text-white">{t("footer.mentions")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm">
            <p>{t("footer.company")}</p>
            <p className="mt-1">{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
