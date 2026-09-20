"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, Users, MapPin } from "lucide-react";
import { format } from "date-fns";

type DueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  system: "aade_short_term";
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  nightCount: number;
  deadline: string;
  daysRemaining: number;
  latestReportStatus: string | null;
  queueStatus: string;
};

type Props = {
  locale: string;
};

export function AadeDueQueue({ locale }: Props) {
  const t = useTranslations("aade");
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/greece/due-queue")
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
        : status === "awaiting_guest_data"
          ? "outline"
          : "secondary";

    const label = t(`dueQueue.status.${status}` as "dueQueue.status.overdue");

    return (
      <Badge variant={variant} className="text-xs">
        {status === "awaiting_guest_data" && <Users className="mr-1 h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-emerald-600" />
          {t("dueQueue.title")}
          <Badge variant="destructive">{items.length}</Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">{t("dueQueue.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.propertyId}-${item.stayId}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3"
          >
            <div>
              <p className="font-medium text-slate-900">
                {item.propertyName}
                {item.guestLabel ? ` — ${item.guestLabel}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {item.city} · {format(new Date(item.checkInDate), "dd/MM/yyyy")} –{" "}
                {format(new Date(item.checkOutDate), "dd/MM/yyyy")} ·{" "}
                {t("dueQueue.nightCount", { count: item.nightCount })}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs text-emerald-700">
                  <MapPin className="mr-1 h-3 w-3" />
                  {t("system.aade")}
                </Badge>
                {statusBadge(item)}
                {item.queueStatus !== "prep_window" &&
                  item.queueStatus !== "awaiting_guest_data" && (
                    <Badge
                      variant={item.daysRemaining <= 0 ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {item.daysRemaining <= 0
                        ? t("dueQueue.overdue")
                        : t("dueQueue.daysLeft", { days: item.daysRemaining })}
                    </Badge>
                  )}
                {item.queueStatus === "prep_window" && (
                  <Badge variant="outline" className="text-xs text-emerald-700">
                    {t("dueQueue.prepWindow")}
                  </Badge>
                )}
                {item.latestReportStatus && (
                  <Badge variant="outline" className="text-xs">
                    {t(
                      `submission.status.${item.latestReportStatus}` as "submission.status.prepared"
                    )}
                  </Badge>
                )}
              </div>
            </div>
            <Link href={`/${locale}/app/properties/${item.propertyId}?tab=register`}>
              <Button size="sm" variant="outline">
                {item.queueStatus === "awaiting_guest_data"
                  ? t("dueQueue.actionGuest")
                  : t("dueQueue.action")}
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
