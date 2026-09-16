"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Info } from "lucide-react";
import {
  ALLOGGIATI_PORTAL_URL,
  BDSR_PORTAL_URL,
} from "@/lib/italy/official-links";

type Props = {
  city: string;
};

export function AlloggiatiReportingPanel({ city }: Props) {
  const t = useTranslations("alloggiati");

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-emerald-600" />
          {t("panel.title")}
          <Badge variant="outline" className="ml-1 text-xs">
            {t("system.alloggiati")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-emerald-900">
        <p>{t("panel.description", { city })}</p>

        <div className="flex gap-3 rounded-lg border border-emerald-200 bg-white/60 p-3 text-xs text-emerald-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p>{t("panel.honestyNote")}</p>
        </div>

        <div className="space-y-2">
          <p className="font-medium">{t("panel.workflowTitle")}</p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-emerald-800">
            <li>{t("panel.step1")}</li>
            <li>{t("panel.step2")}</li>
            <li>{t("panel.step3")}</li>
            <li>{t("panel.step4")}</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={ALLOGGIATI_PORTAL_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("panel.alloggiatiPortal")}
            </Button>
          </a>
          <a href={BDSR_PORTAL_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              {t("panel.bdsrPortal")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-emerald-700">{t("panel.cinSeparateNote")}</p>
      </CardContent>
    </Card>
  );
}
