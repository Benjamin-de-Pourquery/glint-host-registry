"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radar } from "lucide-react";
import { format } from "date-fns";
import type { RuleImpactFeedItem } from "@/lib/rule-radar/service";

type Props = {
  locale: string;
};

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
  none: "outline",
};

export function RuleRadarFeed({ locale }: Props) {
  const t = useTranslations("ruleRadar");
  const [items, setItems] = useState<RuleImpactFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rule-radar/changes?limit=10");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markSeen = async (impactId: string) => {
    await fetch(`/api/rule-radar/impacts/${impactId}/seen`, { method: "PATCH" });
    setItems((prev) =>
      prev.map((item) =>
        item.id === impactId ? { ...item, seenAt: new Date().toISOString() } : item
      )
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("feed.loading")}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const unseenCount = items.filter((item) => !item.seenAt).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-slate-700" />
          <CardTitle>{t("feed.title")}</CardTitle>
          {unseenCount > 0 && (
            <Badge variant="destructive">{unseenCount}</Badge>
          )}
        </div>
        <CardDescription>{t("feed.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const summary = locale === "fr" ? item.summaryFr : item.summaryEn;
          const nightCapChanged =
            item.before.nightCap.limit !== item.after.nightCap.limit;
          const limitBefore = item.before.nightCap.limit;
          const limitAfter = item.after.nightCap.limit;

          return (
            <div
              key={item.id}
              className={`rounded-lg border p-4 ${item.seenAt ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={SEVERITY_VARIANT[item.severity] ?? "outline"}>
                  {t(`severity.${item.severity}`)}
                </Badge>
                <Badge variant="outline">{t(`confidence.${item.confidence}`)}</Badge>
                {item.publishedAt && (
                  <span className="text-xs text-slate-500">
                    {format(new Date(item.publishedAt), "dd MMM yyyy")}
                  </span>
                )}
              </div>
              <p className="font-medium text-slate-900">{summary}</p>
              <p className="mt-1 text-sm text-slate-600">
                <Link
                  href={`/${locale}/app/properties/${item.propertyId}`}
                  className="font-medium hover:underline"
                >
                  {item.propertyName}
                </Link>
                {nightCapChanged && limitBefore != null && limitAfter != null && (
                  <span>
                    {" "}
                    {t("feed.nightCapDelta", {
                      before: limitBefore,
                      after: limitAfter,
                    })}
                  </span>
                )}
              </p>
              <p className="mt-2 text-xs text-slate-500">{t("feed.disclaimer")}</p>
              {!item.seenAt && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => markSeen(item.id)}
                >
                  {t("feed.markSeen")}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
