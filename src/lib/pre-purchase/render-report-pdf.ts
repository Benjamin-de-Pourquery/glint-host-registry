import { jsPDF } from "jspdf";
import type { Locale } from "./locale";
import type { PrePurchaseReport } from "./report";

export function renderPrePurchaseReportPdf(
  report: PrePurchaseReport,
  locale: Locale
): jsPDF {
  const doc = new jsPDF();
  const margin = 16;
  let y = margin;

  doc.setFontSize(16);
  doc.text(locale === "fr" ? "Rapport parcours achat LCD" : "STR pre-purchase report", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`${locale === "fr" ? "Généré le" : "Generated"} ${report.generatedAt}`, margin, y);
  y += 6;
  if (report.datasetUpdatedAt) {
    doc.text(
      `${locale === "fr" ? "Open data registre" : "Register open data"}: ${report.datasetUpdatedAt}`,
      margin,
      y
    );
    y += 8;
  }

  doc.setFontSize(9);
  doc.text(report.disclaimer[locale], margin, y, { maxWidth: 180 });
  y += 14;

  for (const section of report.sections) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(section.title[locale], margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const item of section.items) {
      const block = `${item.title[locale]}\n${item.detail[locale]}${item.meta ? `\n(${item.meta})` : ""}`;
      const lines = doc.splitTextToSize(block, 180) as string[];
      if (y + lines.length * 5 > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, margin, y);
      y += lines.length * 5 + 4;
    }
    y += 4;
  }

  return doc;
}
