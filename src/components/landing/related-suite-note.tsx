import { getTranslations } from "next-intl/server";
import { suiteProductUrl } from "@/lib/suite-urls";

type Props = { locale: string };

export async function RelatedSuiteNote({ locale }: Props) {
  const t = await getTranslations("landing.relatedSuite");

  const labelHref = suiteProductUrl("label", locale);
  const productHref = suiteProductUrl("product", locale);

  return (
    <section
      className="border-b border-slate-200/80 bg-slate-50/80"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("prefix")}{" "}
          <a
            href={labelHref}
            className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
            rel="noopener noreferrer"
          >
            {t("labelName")}
          </a>{" "}
          {t("labelDescription")}{" "}
          <a
            href={productHref}
            className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
            rel="noopener noreferrer"
          >
            {t("productName")}
          </a>{" "}
          {t("productDescription")}{" "}
          <span className="text-slate-500">{t("note")}</span>
        </p>
      </div>
    </section>
  );
}
