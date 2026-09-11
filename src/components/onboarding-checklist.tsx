"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, Check, Home, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type OnboardingSteps = {
  addProperty: boolean;
  setResidency: boolean;
  enableGuestRegister: boolean;
};

type Props = {
  locale: string;
  subscribed: boolean;
  dismissed: boolean;
  steps: OnboardingSteps;
  firstPropertyId: string | null;
};

type StepKey = keyof OnboardingSteps;

const stepMeta: Record<
  StepKey,
  { icon: typeof Building2; stepKey: StepKey }
> = {
  addProperty: { icon: Building2, stepKey: "addProperty" },
  setResidency: { icon: Home, stepKey: "setResidency" },
  enableGuestRegister: { icon: Link2, stepKey: "enableGuestRegister" },
};

const stepOrder: StepKey[] = ["addProperty", "setResidency", "enableGuestRegister"];

export function OnboardingChecklist({
  locale,
  subscribed,
  dismissed,
  steps,
  firstPropertyId,
}: Props) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);
  const [hidden, setHidden] = useState(false);

  const allComplete = stepOrder.every((key) => steps[key]);

  if (dismissed || hidden || allComplete) {
    return null;
  }

  const dismiss = async () => {
    setDismissing(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismiss: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setHidden(true);
      router.refresh();
    } catch {
      setDismissing(false);
    }
  };

  const completedCount = stepOrder.filter((key) => steps[key]).length;

  const getStepHref = (key: StepKey): string | null => {
    if (key === "addProperty") {
      return subscribed ? `/${locale}/app/properties/new` : `/${locale}/app/settings`;
    }
    if (!firstPropertyId) return null;
    if (key === "setResidency") {
      return `/${locale}/app/properties/${firstPropertyId}?tab=compliance`;
    }
    return `/${locale}/app/properties/${firstPropertyId}?tab=register`;
  };

  return (
    <Card className="border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="min-w-0">
          <CardTitle className="app-display text-lg font-bold text-slate-900 sm:text-xl">
            {t("title")}
          </CardTitle>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
          <p className="mt-2 text-xs font-medium text-emerald-700">
            {t("progress", { done: completedCount, total: stepOrder.length })}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-500 hover:text-slate-700"
          onClick={dismiss}
          disabled={dismissing}
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {stepOrder.map((key) => {
          const done = steps[key];
          const href = getStepHref(key);
          const { icon: Icon } = stepMeta[key];
          const isCurrent = !done && stepOrder.find((k) => !steps[k]) === key;

          const row = (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors",
                done
                  ? "border-emerald-200/60 bg-emerald-50/50"
                  : isCurrent
                    ? "border-emerald-300 bg-white shadow-sm"
                    : "border-slate-200/80 bg-white/60"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  done
                    ? "bg-emerald-600 text-white"
                    : isCurrent
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p
                  className={cn(
                    "text-sm font-medium",
                    done ? "text-emerald-800 line-through decoration-emerald-400/60" : "text-slate-900"
                  )}
                >
                  {t(`steps.${key}.title`)}
                </p>
                <p className="text-xs text-slate-500">{t(`steps.${key}.description`)}</p>
              </div>
              {!done && href && (
                <span className="shrink-0 text-xs font-medium text-emerald-700">{t("cta")} →</span>
              )}
            </div>
          );

          if (!done && href) {
            return (
              <Link key={key} href={href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                {row}
              </Link>
            );
          }

          return <div key={key}>{row}</div>;
        })}
      </CardContent>
    </Card>
  );
}
