import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

type Props = { locale: string };

export async function PricingSection({ locale }: Props) {
  const t = await getTranslations("landing.pricing");

  return (
    <section id="pricing" className="scroll-mt-20 border-y border-slate-200/80 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          {(["starter", "pro"] as const).map((plan) => (
            <Card
              key={plan}
              className={`relative border-slate-200/80 shadow-sm transition-shadow hover:shadow-md ${
                plan === "pro" ? "border-emerald-500/60 ring-1 ring-emerald-500/20" : ""
              }`}
            >
              {plan === "pro" && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {t("pro.badge")}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{t(`${plan}.name`)}</CardTitle>
                <CardDescription>{t(`${plan}.description`)}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    {t(`${plan}.price`)}
                  </span>
                  <span className="text-slate-500">{t(`${plan}.period`)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(t.raw(`${plan}.features`) as string[]).map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/signup`} className="mt-8 block">
                  <Button className="w-full" variant={plan === "pro" ? "default" : "outline"}>
                    {t("cta")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
