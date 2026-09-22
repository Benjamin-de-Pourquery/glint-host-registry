"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Info } from "lucide-react";
import { getStayNotificationPortalUrl } from "@/lib/netherlands/official-links";

type Props = {
  city: string;
};

export function NlStayNotifyPanel({ city }: Props) {
  const t = useTranslations("nl");
  const portalUrl = getStayNotificationPortalUrl(city);

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          {t("panel.title")}
          <Badge variant="outline" className="ml-1 text-xs">
            {t("system.stayNotify")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-orange-900">
        <p>{t("panel.description", { city })}</p>

        <div className="flex gap-3 rounded-lg border border-orange-200 bg-white/60 p-3 text-xs text-orange-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
          <p>{t("panel.honestyNote")}</p>
        </div>

        <div className="space-y-2">
          <p className="font-medium">{t("panel.workflowTitle")}</p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-orange-800">
            <li>{t("panel.step1")}</li>
            <li>{t("panel.step2")}</li>
            <li>{t("panel.step3")}</li>
            <li>{t("panel.step4")}</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={portalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("panel.portal")}
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
