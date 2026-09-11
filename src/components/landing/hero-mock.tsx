import { getTranslations } from "next-intl/server";
import { MapPin, QrCode, ArrowRight, CheckCircle2 } from "lucide-react";

export async function HeroMock() {
  const t = await getTranslations("landing.heroMock");

  const tabs = ["overview", "compliance", "register", "listings"] as const;

  return (
    <div className="landing-mock relative mx-auto w-full min-w-0 lg:mx-0">
      <div className="landing-mock-chrome relative min-w-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white ring-1 ring-slate-900/[0.04]">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 bg-slate-100/90 px-4 py-2.5">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="min-w-0 flex-1 rounded-md bg-white/80 px-3 py-1 text-center">
            <span className="truncate text-[11px] font-medium text-slate-400">app.glint.host</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm shadow-emerald-600/25 sm:h-9 sm:w-9">
              G
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{t("property")}</p>
              <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                <MapPin className="h-3 w-3 shrink-0" />
                Paris, FR
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200/80 sm:px-3 sm:text-xs">
            {t("status")}
          </span>
        </div>

        <div className="scroll-fade-x flex gap-1 border-b border-slate-100 px-3 pb-px pt-2 sm:px-4 sm:pt-2.5">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium sm:px-3.5 sm:py-2 ${
                i === 1
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t(`tabs.${tab}`)}
            </span>
          ))}
        </div>

        <div className="space-y-3 p-4 sm:space-y-3 sm:p-5">
          <div className="rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white p-4 shadow-sm shadow-emerald-900/[0.04] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {t("nextAction")}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{t("nextActionText")}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span>Étape 3 / 7</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900">{t("guestTitle")}</p>
                <p className="mt-1.5 text-xs font-medium text-emerald-700">{t("guestLink")}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                  {t("guestRetention")}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm sm:h-14 sm:w-14">
                <QrCode className="h-6 w-6 text-slate-400 sm:h-7 sm:w-7" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
