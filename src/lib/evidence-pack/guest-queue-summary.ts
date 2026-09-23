import { isBelgiumCountry } from "@/lib/belgium/regions";
import { isCroatiaCountry } from "@/lib/croatia/regions";
import { isGreeceCountry } from "@/lib/greece/regions";
import { isItalyCountry } from "@/lib/italy/regions";
import { getAlloggiatiDueQueueForUser } from "@/lib/italy/due-queue";
import { isNetherlandsCountry } from "@/lib/netherlands/regions";
import { getStayNotifyDueQueueForUser } from "@/lib/netherlands/due-queue";
import { isPortugalCountry } from "@/lib/portugal/regions";
import { getSibaDueQueueForUser } from "@/lib/portugal/due-queue";
import { getAadeDueQueueForUser } from "@/lib/greece/due-queue";
import { getEvisitorDueQueueForUser } from "@/lib/croatia/due-queue";
import { getSesDueQueueForUser } from "@/lib/ses/due-queue";
import { isSpainCountry } from "@/lib/spain/regions";
import type { EvidencePackGuestQueueItem, EvidencePackGuestQueueSummary } from "./types";

type DueQueueRow = {
  propertyId: string;
  queueStatus: string;
  deadline: string;
};

function summarizeItems(items: EvidencePackGuestQueueItem[]): EvidencePackGuestQueueSummary {
  const byStatus: Record<string, number> = {};
  for (const item of items) {
    byStatus[item.queueStatus] = (byStatus[item.queueStatus] ?? 0) + 1;
  }
  return { total: items.length, byStatus, items };
}

export async function loadGuestQueueSummaryForProperty(
  userId: string,
  propertyId: string,
  country: string
): Promise<EvidencePackGuestQueueSummary> {
  const loaders: Array<{ system: string; rows: Promise<DueQueueRow[]> }> = [];

  if (isSpainCountry(country)) {
    loaders.push({
      system: "SES Hospedajes",
      rows: getSesDueQueueForUser(userId).then((items) =>
        items
          .filter((item) => item.propertyId === propertyId)
          .map((item) => ({
            propertyId: item.propertyId,
            queueStatus: item.queueStatus,
            deadline: item.deadline,
          }))
      ),
    });
  }

  if (isItalyCountry(country)) {
    loaders.push({
      system: "Alloggiati Web",
      rows: getAlloggiatiDueQueueForUser(userId).then((items) =>
        items
          .filter((item) => item.propertyId === propertyId)
          .map((item) => ({
            propertyId: item.propertyId,
            queueStatus: item.queueStatus,
            deadline: item.deadline,
          }))
      ),
    });
  }

  if (isPortugalCountry(country)) {
    loaders.push({
      system: "SIBA",
      rows: getSibaDueQueueForUser(userId).then((items) =>
        items
          .filter((item) => item.propertyId === propertyId)
          .map((item) => ({
            propertyId: item.propertyId,
            queueStatus: item.queueStatus,
            deadline: item.deadline,
          }))
      ),
    });
  }

  if (isGreeceCountry(country)) {
    loaders.push({
      system: "AADE",
      rows: getAadeDueQueueForUser(userId).then((items) =>
        items
          .filter((item) => item.propertyId === propertyId)
          .map((item) => ({
            propertyId: item.propertyId,
            queueStatus: item.queueStatus,
            deadline: item.deadline,
          }))
      ),
    });
  }

  if (isCroatiaCountry(country)) {
    loaders.push({
      system: "eVisitor",
      rows: getEvisitorDueQueueForUser(userId).then((items) =>
        items
          .filter((item) => item.propertyId === propertyId)
          .map((item) => ({
            propertyId: item.propertyId,
            queueStatus: item.queueStatus,
            deadline: item.deadline,
          }))
      ),
    });
  }

  if (isNetherlandsCountry(country)) {
    loaders.push({
      system: "NL stay notification",
      rows: getStayNotifyDueQueueForUser(userId).then((items) =>
        items
          .filter((item) => item.propertyId === propertyId)
          .map((item) => ({
            propertyId: item.propertyId,
            queueStatus: item.queueStatus,
            deadline: item.deadline,
          }))
      ),
    });
  }

  if (isBelgiumCountry(country)) {
    // Belgium uses registration dossier rather than a guest queue in MVP scope.
  }

  const items: EvidencePackGuestQueueItem[] = [];
  const now = new Date().toISOString();

  for (const loader of loaders) {
    const rows = await loader.rows;
    for (const row of rows) {
      items.push({
        system: loader.system,
        queueStatus: row.queueStatus,
        deadline: row.deadline,
        updatedAt: now,
      });
    }
  }

  return summarizeItems(items);
}
