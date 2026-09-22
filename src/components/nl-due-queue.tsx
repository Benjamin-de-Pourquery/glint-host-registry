"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";

type DueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "amsterdam_stay_notify";
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  latestReportStatus: string | null;
  queueStatus: string;
  portalUrl: string;
};

type Props = {
  locale: string;
};

export function NlDueQueue({ locale }: Props) {
  const t = useTranslations("nl");
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/netherlands/due-queue")
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
          {t("dueQueue.loading")}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  const statusBadge = (item: DueItem) => {
    const status = item.queueStatus;
    const variant =
      status === "overdue"
        ? "destructive"
        : status === "awaiting_notification"
          ? "secondary"
          : "outline";

    const label = t(`dueQueue.status.${status}` as "dueQueue.status.overdue");

    return (
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
    );
  };

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-orange-600" />
          {t("dueQueue.title")}
          <Badge variant="outline" className="text-xs">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 8).map((item) => (
          <div
            key={item.stayId}
            className="flex flex-col gap-2 rounded-lg border border-orange-100 bg-orange-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-slate-900">{item.propertyName}</p>
              <p className="flex items-center gap-1 text-xs text-slate-600">
                <MapPin className="h-3 w-3" />
                {item.city} · {format(new Date(item.checkInDate), "d MMM")} →{" "}
                {format(new Date(item.checkOutDate), "d MMM")}
              </p>
              {item.guestLabel && (
                <p className="text-xs text-slate-500">{item.guestLabel}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {statusBadge(item)}
              <Link href={`/${locale}/app/properties/${item.propertyId}?tab=register`}>
                <Button size="sm" variant="outline">
                  {t("dueQueue.action")}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
