"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { IrelandDueItem } from "@/lib/ireland/due-queue";

type Props = {
  locale: string;
};

export function IrelandDueQueue({ locale }: Props) {
  const t = useTranslations("ie.dueQueue");
  const [items, setItems] = useState<IrelandDueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ireland/due-queue")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("loading")}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  const kindLabel = (kind: IrelandDueItem["kind"]) => t(`kinds.${kind}`);

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-emerald-700" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 8).map((item, index) => (
          <div
            key={`${item.propertyId}-${item.kind}-${index}`}
            className="flex flex-col gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm">
              <Link
                href={`/${locale}/app/properties/${item.propertyId}?tab=register`}
                className="font-medium text-emerald-900 hover:underline"
              >
                {item.propertyName}
              </Link>
              <span className="text-emerald-800"> · {item.city}</span>
              <p className="mt-1 text-xs text-emerald-700">{kindLabel(item.kind)}</p>
              <p className="text-xs text-emerald-600">
                {t("dueBy", { date: format(new Date(item.dueBy), "dd MMM yyyy") })}
                {item.daysRemaining != null && item.daysRemaining >= 0
                  ? ` (${t("daysLeft", { days: item.daysRemaining })})`
                  : item.daysRemaining != null && item.daysRemaining < 0
                    ? ` (${t("overdue")})`
                    : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {item.daysRemaining != null && item.daysRemaining < 0 && (
                <Badge variant="destructive">{t("overdue")}</Badge>
              )}
              <a href={item.portalUrl} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  {t("officialLink")}
                </Button>
              </a>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
