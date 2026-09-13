"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, AlertTriangle, Users, FileWarning } from "lucide-react";
import { format } from "date-fns";

type DueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  stayId: string;
  checkInDate: string;
  guestLabel: string | null;
  guestCount: number;
  deadline: string;
  hoursRemaining: number;
  hasCredentials: boolean;
  latestSubmissionStatus: string | null;
  queueStatus: string;
};

type Props = {
  locale: string;
};

export function SesDueQueue({ locale }: Props) {
  const t = useTranslations("ses");
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ses/due-queue")
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
          : status === "validation_needed"
            ? "outline"
            : "secondary";

    const label = t(`dueQueue.status.${status}` as "dueQueue.status.overdue");

    return (
      <Badge variant={variant} className="text-xs">
        {status === "awaiting_guest_data" && <Users className="mr-1 h-3 w-3" />}
        {status === "validation_needed" && <FileWarning className="mr-1 h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-amber-600" />
          {t("dueQueue.title")}
          <Badge variant="destructive">{items.length}</Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">{t("dueQueue.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={`${item.propertyId}-${item.stayId}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3"
          >
            <div>
              <p className="font-medium text-slate-900">
                {item.propertyName}
                {item.guestLabel ? ` — ${item.guestLabel}` : ""}
              </p>
              <p className="text-xs text-slate-500">
                {item.city} · {format(new Date(item.checkInDate), "dd/MM/yyyy")} ·{" "}
                {item.guestCount > 0
                  ? t("dueQueue.guestCount", { count: item.guestCount })
                  : t("dueQueue.noGuestsYet")}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {statusBadge(item)}
                {item.queueStatus !== "prep_window" &&
                  item.queueStatus !== "awaiting_guest_data" && (
                    <Badge
                      variant={item.hoursRemaining === 0 ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {item.hoursRemaining === 0
                        ? t("dueQueue.overdue")
                        : t("dueQueue.hoursLeft", { hours: item.hoursRemaining })}
                    </Badge>
                  )}
                {item.queueStatus === "prep_window" && (
                  <Badge variant="outline" className="text-xs text-blue-700">
                    {t("dueQueue.prepWindow")}
                  </Badge>
                )}
                {item.latestSubmissionStatus && (
                  <Badge variant="outline" className="text-xs">
                    {t(`submission.status.${item.latestSubmissionStatus}` as "submission.status.dry_run")}
                  </Badge>
                )}
                {!item.hasCredentials && (
                  <Badge variant="outline" className="text-xs text-amber-700">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {t("dueQueue.noCredentials")}
                  </Badge>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}/app/properties/${item.propertyId}?tab=register`}
            >
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
