import { getTranslations } from "next-intl/server";

export async function TrustStrip() {
  const t = await getTranslations("landing.trust");

  const items = [t("regulation"), t("cities"), t("bilingual")];

  return (
    <section className="border-y border-slate-200/90 bg-slate-100/60">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {items.map((label, i) => (
            <span key={label} className="flex items-center gap-3">
              {i > 0 && (
                <span className="hidden text-slate-300 sm:inline" aria-hidden>
                  ·
                </span>
              )}
              <span className="landing-trust-badge inline-flex items-center rounded-md border border-slate-200/90 bg-white px-2.5 py-1 text-slate-700 shadow-sm">
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
