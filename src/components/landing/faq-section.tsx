import { getTranslations } from "next-intl/server";

const faqKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];

export async function FaqSection() {
  const t = await getTranslations("landing.faq");

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("title")}
        </h2>
        <div className="mt-12 space-y-4">
          {faqKeys.map((key) => (
            <details
              key={key}
              className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm open:shadow-md"
            >
              <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {t(`items.${key}.q`)}
                  <span className="text-emerald-600 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {t(`items.${key}.a`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
