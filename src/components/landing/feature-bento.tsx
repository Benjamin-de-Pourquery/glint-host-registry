import { getTranslations } from "next-intl/server";
import {
  Route,
  Users,
  LayoutGrid,
  Zap,
  Building2,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FeatureKey =
  | "compliance"
  | "guestRegister"
  | "tabs"
  | "nextAction"
  | "portfolio"
  | "listings";

const layout: { key: FeatureKey; icon: LucideIcon; className: string }[] = [
  {
    key: "compliance",
    icon: Route,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    key: "guestRegister",
    icon: Users,
    className: "md:col-span-1",
  },
  {
    key: "nextAction",
    icon: Zap,
    className: "md:col-span-1",
  },
  {
    key: "tabs",
    icon: LayoutGrid,
    className: "md:col-span-1",
  },
  {
    key: "portfolio",
    icon: Building2,
    className: "md:col-span-1",
  },
  {
    key: "listings",
    icon: FileText,
    className: "md:col-span-2",
  },
];

export async function FeatureBento() {
  const t = await getTranslations("landing.features");

  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid auto-rows-fr gap-4 md:grid-cols-3">
          {layout.map(({ key, icon: Icon, className }) => (
            <article
              key={key}
              className={`group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:shadow-slate-900/5 ${className}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {t(`${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
