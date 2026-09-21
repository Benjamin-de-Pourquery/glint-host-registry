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
  system: "evisitor";
  stayId: string;
  phase: "arrival" | "departure";
  checkInDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  hoursRemaining: number;
  latestReportStatus: string | null;
  queueStatus: string;
};

type Props = {
  locale: string;
};

export function EvisitorDueQueue({ locale }: Props) {
  const t = useTranslations("evisitor");
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/croatia/due-queue")
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
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-red-600" />
          {t("dueQueue.title")}
        </CardTitle>
        <p className="text-xs text-slate-600">{t("dueQueue.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.stayId}-${item.phase}`}
            className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/30 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm text-slate-900">
                  {item.propertyName}
                </span>
                {statusBadge(item)}
                <Badge variant="outline" className="text-xs">
                  {item.phase === "arrival"
                    ? t("dueQueue.phaseArrival")
                    : t("dueQueue.phaseDeparture")}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.city}
                </span>
                <span>
                  {format(new Date(item.checkInDate), "dd/MM/yyyy")}
                  {item.guestLabel ? ` · ${item.guestLabel}` : ""}
                </span>
                <span>
                  {item.guestCount > 0
                    ? t("dueQueue.guestCount", { count: item.guestCount })
                    : t("dueQueue.noGuests")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {item.queueStatus === "overdue"
                  ? t("dueQueue.overdue")
                  : t("dueQueue.hoursLeft", { hours: item.hoursRemaining })}
              </p>
            </div>
            <Link href={`/${locale}/app/properties/${item.propertyId}?tab=register`}>
              <Button size="sm" variant="outline">
                {item.guestCount === 0 ? t("dueQueue.actionGuest") : t("dueQueue.action")}
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
