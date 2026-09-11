import { getTranslations } from "next-intl/server";
import { MapPin, QrCode, ArrowRight, CheckCircle2 } from "lucide-react";

export async function HeroMock() {
  const t = await getTranslations("landing.heroMock");

  const tabs = ["overview", "compliance", "register", "listings"] as const;

  return (
    <div className="landing-mock relative mx-auto w-full lg:mx-0">
      <div className="landing-mock-chrome relative overflow-hidden rounded-xl border border-slate-200/90 bg-white">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 bg-slate-100/90 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="flex-1 rounded-md bg-white/80 px-3 py-1 text-center">
            <span className="text-[11px] font-medium text-slate-400">app.glint.host</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
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
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80">
            {t("status")}
          </span>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-2.5">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={`shrink-0 rounded-md px-3.5 py-2 text-xs font-medium ${
                i === 1
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t(`tabs.${tab}`)}
            </span>
          ))}
        </div>

        <div className="space-y-3 p-5">
          <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {t("nextAction")}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{t("nextActionText")}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span>Étape 3 / 7</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-900">{t("guestTitle")}</p>
                <p className="mt-1.5 text-xs font-medium text-emerald-700">{t("guestLink")}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {t("guestRetention")}
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                <QrCode className="h-7 w-7 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
