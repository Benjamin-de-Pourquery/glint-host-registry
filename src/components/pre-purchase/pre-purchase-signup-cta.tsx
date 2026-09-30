import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { buildPrePurchaseSignupUrl } from "@/lib/pre-purchase/signup-bridge";
import type { Locale } from "@/lib/pre-purchase/locale";
import type { PrePurchaseJourneyInput } from "@/lib/pre-purchase/types";

type Props = {
  locale: Locale;
  input: PrePurchaseJourneyInput;
};

export async function PrePurchaseSignupCta({ locale, input }: Props) {
  const t = await getTranslations({ locale, namespace: "prePurchase.signupCta" });
  const href = buildPrePurchaseSignupUrl(locale, input);

  return (
    <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
      <h2 className="text-lg font-bold text-slate-900">{t("title")}</h2>
      <p className="mt-2 text-sm text-slate-700">{t("body")}</p>
      <div className="mt-4">
        <Link href={href}>
          <Button>{t("button")}</Button>
        </Link>
      </div>
    </div>
  );
}
