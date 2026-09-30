"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildJourneySearchParams,
  normalizeJourneyInput,
} from "@/lib/pre-purchase/query-state";
import type { PrePurchaseJourneyInput } from "@/lib/pre-purchase/types";

type Props = {
  initialInput: PrePurchaseJourneyInput;
};

export function PrePurchaseJourneyForm({ initialInput }: Props) {
  const t = useTranslations("prePurchase.form");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [input, setInput] = useState<PrePurchaseJourneyInput>(initialInput);

  const update = (patch: Partial<PrePurchaseJourneyInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeJourneyInput(input);
    const params = buildJourneySearchParams(normalized);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">{t("country")}</Label>
          <select
            id="country"
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={input.country}
            onChange={(e) =>
              update({ country: e.target.value === "ES" ? "ES" : "" })
            }
          >
            <option value="">{t("countryPlaceholder")}</option>
            <option value="ES">{t("countrySpain")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">{t("region")}</Label>
          <select
            id="region"
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={input.region}
            onChange={(e) =>
              update({
                region:
                  e.target.value === "CT"
                    ? "CT"
                    : e.target.value === "other"
                      ? "other"
                      : "",
              })
            }
            disabled={input.country !== "ES"}
          >
            <option value="">{t("regionPlaceholder")}</option>
            <option value="CT">{t("regionCatalonia")}</option>
            <option value="other">{t("regionOther")}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="municipality">{t("municipality")}</Label>
        <Input
          id="municipality"
          value={input.municipality}
          onChange={(e) => update({ municipality: e.target.value })}
          placeholder={t("municipalityPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t("address")}</Label>
        <Input
          id="address"
          value={input.addressOrListing}
          onChange={(e) => update({ addressOrListing: e.target.value })}
          placeholder={t("addressPlaceholder")}
        />
        <p className="text-xs text-slate-500">{t("addressHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="licence">{t("licence")}</Label>
        <Input
          id="licence"
          value={input.licenceNumber}
          onChange={(e) => update({ licenceNumber: e.target.value })}
          placeholder={t("licencePlaceholder")}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
