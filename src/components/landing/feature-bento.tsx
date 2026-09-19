import { getTranslations } from "next-intl/server";
import { Route, Users, Zap, Building2, Clock, Moon, Receipt, ArrowRight, QrCode, CheckCircle2 } from "lucide-react";

export async function FeatureBento() {
  const t = await getTranslations("landing.features");

  return (
    <section id="features" className="scroll-mt-20 overflow-x-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl min-w-0 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {/* Hero feature: Démarches */}
          <article className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-900/5 sm:p-7 md:col-span-2 md:row-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Route className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">{t("compliance.title")}</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
              {t("compliance.description")}
            </p>

            {/* Mini-UI: compliance steps */}
            <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{t("miniUi.complianceHeader")}</span>
                <span className="text-emerald-700">3 / 7</span>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: t("miniUi.step1"), done: true },
                  { label: t("miniUi.step2"), done: true },
                  { label: t("miniUi.step3"), done: false, active: true },
                ].map((step) => (
                  <div
                    key={step.label}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs ${
                      step.active
                        ? "border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800"
                        : step.done
                          ? "text-slate-500"
                          : "text-slate-400"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : step.active ? (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" />
                    )}
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Hero feature: Registre */}
          <article className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-900/5 sm:p-7 md:row-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">{t("guestRegister.title")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("guestRegister.description")}
            </p>

            {/* Mini-UI: guest register */}
            <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">{t("miniUi.registerTitle")}</p>
                  <p className="mt-1 truncate text-[11px] font-medium text-emerald-700">
                    glint.host/check-in/…
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">{t("miniUi.registerRetention")}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                  <QrCode className="h-5 w-5 text-slate-400" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200/60 bg-emerald-50/80 px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium text-emerald-800">{t("miniUi.registerSignature")}</span>
              </div>
            </div>
          </article>

          {/* Secondary features */}
          {[
            { key: "nextAction" as const, icon: Zap },
            { key: "sesQueue" as const, icon: Clock },
            { key: "nightCap" as const, icon: Moon },
            { key: "touristTax" as const, icon: Receipt },
            { key: "portfolio" as const, icon: Building2 },
          ].map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-slate-900/5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600 ring-1 ring-slate-200/80">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{t(`${key}.title`)}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                {t(`${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
