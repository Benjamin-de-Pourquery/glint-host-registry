import { getTranslations } from "next-intl/server";
import { MapPin, QrCode, ArrowRight } from "lucide-react";

export async function HeroMock() {
  const t = await getTranslations("landing.heroMock");

  const tabs = ["overview", "compliance", "register", "listings"] as const;

  return (
    <div className="landing-mock relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-slate-900/5 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
              G
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{t("property")}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                Paris, FR
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200/80">
            {t("status")}
          </span>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium ${
                i === 1
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t(`tabs.${tab}`)}
            </span>
          ))}
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {t("nextAction")}
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-900">{t("nextActionText")}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-700">
              <span>Étape 3 / 7</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-900">{t("guestTitle")}</p>
                <p className="mt-1 text-xs text-emerald-700">{t("guestLink")}</p>
                <p className="mt-2 text-xs text-slate-500">{t("guestRetention")}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <QrCode className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
