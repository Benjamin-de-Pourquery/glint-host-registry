import { getTranslations } from "next-intl/server";
import { Shield, MapPin, Languages } from "lucide-react";

export async function TrustStrip() {
  const t = await getTranslations("landing.trust");

  const items = [
    { icon: Shield, label: t("regulation") },
    { icon: MapPin, label: t("cities") },
    { icon: Languages, label: t("bilingual") },
  ];

  return (
    <section className="border-y border-emerald-200/50 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/80">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {items.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="landing-trust-badge inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-200/80 bg-white px-3 py-1.5 text-emerald-900 shadow-sm shadow-emerald-900/[0.04]"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              <span className="truncate">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
