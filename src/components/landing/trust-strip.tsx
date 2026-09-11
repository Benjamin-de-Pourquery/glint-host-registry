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
    <section className="border-y border-slate-200/80 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-6 px-4 py-8 sm:flex-row sm:gap-12 sm:px-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm text-slate-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
