"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Info } from "lucide-react";
import type { SpainGuestReportingMode } from "@/lib/spain/regions";
import {
  MOSSOS_LOGIN_URL,
  MOSSOS_PI15_INFO_URL,
  MOSSOS_PORTAL_URL,
  ERTZAINTZA_PORTAL_URL,
  EUSKADI_HOSTELERO_URL,
  RD_933_URL,
} from "@/lib/spain/official-links";

type Props = {
  city: string;
  system: SpainGuestReportingMode;
};

export function RegionalReportingPanel({ city, system }: Props) {
  const t = useTranslations("regional");

  if (system !== "mossos" && system !== "ertzaintza") return null;

  const isMossos = system === "mossos";

  return (
    <Card className="border-violet-200 bg-violet-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-violet-600" />
          {isMossos ? t("panel.mossosTitle") : t("panel.ertzaintzaTitle")}
          <Badge variant="outline" className="ml-1 text-xs">
            {isMossos ? t("system.mossos") : t("system.ertzaintza")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-violet-900">
        <p>
          {isMossos
            ? t("panel.mossosDescription", { city })
            : t("panel.ertzaintzaDescription", { city })}
        </p>

        <div className="flex gap-3 rounded-lg border border-violet-200 bg-white/60 p-3 text-xs text-violet-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
          <p>{t("panel.honestyNote")}</p>
        </div>

        <div className="space-y-2">
          <p className="font-medium">{t("panel.workflowTitle")}</p>
          <ol className="list-decimal space-y-1 pl-5 text-xs text-violet-800">
            <li>{t("panel.step1")}</li>
            <li>{t("panel.step2")}</li>
            <li>{t("panel.step3")}</li>
            <li>{t("panel.step4")}</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          {isMossos ? (
            <>
              <a href={MOSSOS_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  {t("panel.mossosPortal")}
                </Button>
              </a>
              <a href={MOSSOS_LOGIN_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  {t("panel.mossosLogin")}
                </Button>
              </a>
              <a href={MOSSOS_PI15_INFO_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  {t("panel.pi15Info")}
                </Button>
              </a>
            </>
          ) : (
            <>
              <a href={ERTZAINTZA_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  {t("panel.ertzaintzaPortal")}
                </Button>
              </a>
              <a href={EUSKADI_HOSTELERO_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  {t("panel.euskadiHostelero")}
                </Button>
              </a>
            </>
          )}
          <a href={RD_933_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              {t("panel.rd933")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-violet-700">{t("panel.retentionNote")}</p>
      </CardContent>
    </Card>
  );
}
