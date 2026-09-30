"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { pickLocale } from "@/lib/pre-purchase/locale";
import type { PrePurchaseReport } from "@/lib/pre-purchase/report";
import { renderPrePurchaseReportPdf } from "@/lib/pre-purchase/render-report-pdf";

type Props = {
  report: PrePurchaseReport;
};

export function PrePurchaseReportActions({ report }: Props) {
  const t = useTranslations("prePurchase.report");
  const locale = pickLocale(useLocale());

  const onPrint = () => {
    window.print();
  };

  const onPdf = () => {
    const doc = renderPrePurchaseReportPdf(report, locale);
    doc.save(`glint-pre-purchase-${report.generatedAt}.pdf`);
  };

  return (
    <div className="pre-purchase-no-print flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={onPrint}>
        {t("print")}
      </Button>
      <Button type="button" variant="outline" onClick={onPdf}>
        {t("downloadPdf")}
      </Button>
    </div>
  );
}
