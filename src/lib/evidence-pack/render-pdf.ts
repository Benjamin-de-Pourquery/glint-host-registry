import { format } from "date-fns";
import { jsPDF } from "jspdf";
import {
  BRAND_EMERALD,
  BRAND_SLATE_DARK,
  BRAND_SLATE_MID,
} from "@/lib/seo/brand-colors";
import { getEvidencePackLabels } from "./labels";
import type { EvidencePackManifest } from "./types";

const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
  doc.text(title, PAGE_MARGIN, y);
  doc.setDrawColor(...hexToRgb(BRAND_EMERALD));
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, y + 2, PAGE_MARGIN + 40, y + 2);
  return y + 10;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}

export function renderEvidencePackPdf(manifest: EvidencePackManifest): Uint8Array {
  const labels = getEvidencePackLabels(manifest.locale);
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFillColor(...hexToRgb(BRAND_SLATE_MID));
  doc.rect(0, 0, PAGE_WIDTH, 48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(labels.productTitle, PAGE_MARGIN, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(manifest.propertyName, PAGE_MARGIN, 32);
  doc.setFontSize(9);
  doc.text(manifest.propertyAddress, PAGE_MARGIN, 39);

  let y = 58;
  doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(labels.disclaimerTitle, PAGE_MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  y = addWrappedText(doc, labels.disclaimer, PAGE_MARGIN, y, CONTENT_WIDTH, 4.5) + 6;

  doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
  doc.setFontSize(9);
  doc.text(
    `${labels.coverPeriod}: ${format(new Date(manifest.periodStart), "dd/MM/yyyy")} – ${format(new Date(manifest.periodEnd), "dd/MM/yyyy")}`,
    PAGE_MARGIN,
    y
  );
  y += 5;
  doc.text(
    `${labels.coverGenerated}: ${format(new Date(manifest.generatedAt), "dd/MM/yyyy HH:mm")}`,
    PAGE_MARGIN,
    y
  );
  y += 12;

  y = ensureSpace(doc, y, 20);
  y = addSectionTitle(doc, labels.sectionIdentity, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (manifest.identity.length === 0) {
    doc.setTextColor(100, 100, 100);
    doc.text(labels.notConfigured, PAGE_MARGIN, y);
    y += 8;
  } else {
    for (const field of manifest.identity) {
      y = ensureSpace(doc, y, 8);
      doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
      doc.setFont("helvetica", "bold");
      doc.text(`${field.label}:`, PAGE_MARGIN, y);
      doc.setFont("helvetica", "normal");
      doc.text(field.value, PAGE_MARGIN + 62, y);
      y += 6;
    }
  }
  y += 4;

  if (manifest.playbookSteps.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, labels.sectionPlaybook, y);
    if (manifest.playbookSummary) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `${manifest.playbookSummary.completed}/${manifest.playbookSummary.total} complete (${manifest.playbookSummary.skipped} skipped)`,
        PAGE_MARGIN,
        y
      );
      y += 7;
    }
    for (const step of manifest.playbookSteps) {
      y = ensureSpace(doc, y, 8);
      const statusLabel =
        step.status === "done"
          ? labels.playbookStatusDone
          : step.status === "skipped"
            ? labels.playbookStatusSkipped
            : labels.playbookStatusPending;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
      const line = `[${statusLabel}] ${step.title}${step.completedAt ? ` (${step.completedAt.slice(0, 10)})` : ""}`;
      y = addWrappedText(doc, line, PAGE_MARGIN, y, CONTENT_WIDTH, 4.5) + 2;
    }
    y += 4;
  }

  y = ensureSpace(doc, y, 20);
  y = addSectionTitle(doc, labels.sectionStays, y);
  doc.setFontSize(9);
  if (manifest.stays.length === 0) {
    doc.setTextColor(100, 100, 100);
    doc.text(labels.noStays, PAGE_MARGIN, y);
    y += 8;
  } else {
    for (const stay of manifest.stays) {
      y = ensureSpace(doc, y, 10);
      doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
      const stayLine = `${format(new Date(stay.checkInDate), "dd/MM/yyyy")} – ${format(new Date(stay.checkOutDate), "dd/MM/yyyy")} | ${stay.nights} ${labels.stayNights.toLowerCase()} | ${labels.staySource}: ${stay.source}${stay.channel ? ` | ${labels.stayChannel}: ${stay.channel}` : ""}`;
      y = addWrappedText(doc, stayLine, PAGE_MARGIN, y, CONTENT_WIDTH, 4.5) + 2;
    }
  }
  y += 4;

  if (manifest.nightCap) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, labels.sectionNightCap, y);
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
    doc.text(
      `${labels.nightCapUsed}: ${manifest.nightCap.nightsUsed} / ${labels.nightCapLimit.toLowerCase()}: ${manifest.nightCap.limit} | ${labels.nightCapRemaining}: ${manifest.nightCap.remaining} (${manifest.nightCap.status})`,
      PAGE_MARGIN,
      y
    );
    y += 6;
    if (manifest.capGuard) {
      doc.text(
        `${labels.capGuardActive}: ${labels.capGuardMode} ${manifest.capGuard.mode} | ${labels.capGuardSince} ${format(new Date(manifest.capGuard.activeSince), "dd/MM/yyyy")}`,
        PAGE_MARGIN,
        y
      );
      y += 6;
    }
    y += 4;
  }

  y = ensureSpace(doc, y, 20);
  y = addSectionTitle(doc, labels.sectionGuestQueue, y);
  doc.setFontSize(9);
  if (manifest.guestQueue.total === 0) {
    doc.setTextColor(100, 100, 100);
    doc.text(labels.noQueueItems, PAGE_MARGIN, y);
    y += 8;
  } else {
    for (const item of manifest.guestQueue.items) {
      y = ensureSpace(doc, y, 8);
      doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
      const queueLine = `${item.system} | ${labels.queueStatus}: ${item.queueStatus} | ${labels.queueDeadline}: ${item.deadline.slice(0, 10)}`;
      y = addWrappedText(doc, queueLine, PAGE_MARGIN, y, CONTENT_WIDTH, 4.5) + 2;
    }
  }
  y += 4;

  y = ensureSpace(doc, y, 20);
  y = addSectionTitle(doc, labels.sectionChannels, y);
  doc.setFontSize(9);
  if (!manifest.channelsConfigured) {
    doc.setTextColor(100, 100, 100);
    doc.text(labels.notConfigured, PAGE_MARGIN, y);
    y += 8;
  } else {
    for (const channel of manifest.channels) {
      y = ensureSpace(doc, y, 12);
      doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
      doc.setFont("helvetica", "bold");
      doc.text(channel.channel, PAGE_MARGIN, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      y = addWrappedText(
        doc,
        `${labels.channelUrl}: ${channel.listingUrl}`,
        PAGE_MARGIN,
        y,
        CONTENT_WIDTH,
        4.5
      );
      if (channel.registrationNumberDisplayed) {
        doc.text(
          `${labels.channelNumber}: ${channel.registrationNumberDisplayed} (${labels.channelStatus}: ${channel.displayStatus})`,
          PAGE_MARGIN,
          y
        );
        y += 5;
      } else {
        doc.text(`${labels.channelStatus}: ${channel.displayStatus}`, PAGE_MARGIN, y);
        y += 5;
      }
      y += 2;
    }
  }

  if (manifest.healthScore) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, labels.sectionHealthScore, y);
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
    doc.text(`${labels.healthScore}: ${manifest.healthScore.score}`, PAGE_MARGIN, y);
    y += 6;
    for (const factor of manifest.healthScore.factors) {
      y = ensureSpace(doc, y, 6);
      doc.text(`• ${factor.label}: ${factor.status}`, PAGE_MARGIN + 2, y);
      y += 5;
    }
    y += 4;
  }

  if (manifest.nerMigration) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, labels.sectionNer, y);
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(BRAND_SLATE_DARK));
    if (manifest.nerMigration.nationalRegistrationNumber) {
      doc.text(
        `${labels.fieldNationalNumber}: ${manifest.nerMigration.nationalRegistrationNumber}`,
        PAGE_MARGIN,
        y
      );
      y += 5;
    }
    doc.text(
      `${labels.fieldNationalStatus}: ${manifest.nerMigration.nationalTransitionStatus ?? labels.notConfigured}`,
      PAGE_MARGIN,
      y
    );
    y += 5;
    if (manifest.nerMigration.nationalRenewalDeadline) {
      doc.text(
        `${labels.fieldNationalDeadline}: ${manifest.nerMigration.nationalRenewalDeadline.slice(0, 10)}`,
        PAGE_MARGIN,
        y
      );
      y += 5;
    }
    y += 4;
  }

  y = ensureSpace(doc, y, 24);
  y = addSectionTitle(doc, labels.sectionHowToRead, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  addWrappedText(doc, labels.howToReadBody, PAGE_MARGIN, y, CONTENT_WIDTH, 4.5);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(labels.footer, PAGE_MARGIN, 290);
    doc.text(`${page} / ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, 290, { align: "right" });
  }

  const buffer = doc.output("arraybuffer");
  return new Uint8Array(buffer);
}
