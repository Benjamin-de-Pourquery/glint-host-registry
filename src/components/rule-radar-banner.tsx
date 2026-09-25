"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Radar, X } from "lucide-react";

type BannerData = {
  unseenCount: number;
  items: Array<{
    id: string;
    summaryEn: string;
    summaryFr: string;
    confidence: string;
    severity: string;
    publishedAt: string | null;
  }>;
};

type Props = {
  propertyId: string;
  locale: string;
};

export function RuleRadarBanner({ propertyId, locale }: Props) {
  const t = useTranslations("ruleRadar");
  const [data, setData] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/properties/${propertyId}/rule-radar`);
    if (!res.ok) return;
    const json = await res.json();
    setData({
      unseenCount: json.unseenCount ?? 0,
      items: json.items ?? [],
    });
  }, [propertyId]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const markAllSeen = async () => {
    await fetch(`/api/properties/${propertyId}/rule-radar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_seen" }),
    });
    setDismissed(true);
    setData((prev) => (prev ? { ...prev, unseenCount: 0 } : prev));
  };

  if (!data || data.unseenCount === 0 || dismissed) {
    return null;
  }

  const latest = data.items.find((item) => item);
  const summary = latest
    ? locale === "fr"
      ? latest.summaryFr
      : latest.summaryEn
    : t("banner.generic");

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <Radar className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <div>
            <p className="font-medium text-blue-900">{t("banner.title")}</p>
            <p className="mt-1 text-sm text-blue-800">{summary}</p>
            <p className="mt-2 text-xs text-blue-700">{t("banner.disclaimer")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={markAllSeen}>
                {t("banner.markSeen")}
              </Button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-blue-700 hover:text-blue-900"
          aria-label={t("banner.dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
