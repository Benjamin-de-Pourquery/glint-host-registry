import { useTranslations } from "next-intl";

type Props = {
  variant?: "default" | "compact";
};

export function PrePurchaseDisclaimer({ variant = "default" }: Props) {
  const t = useTranslations("prePurchase.disclaimer");
  const className =
    variant === "compact"
      ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      : "rounded-xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950";

  return (
    <aside className={className} role="note">
      <p className="font-semibold">{t("title")}</p>
      <p className="mt-2">{t("body")}</p>
    </aside>
  );
}
