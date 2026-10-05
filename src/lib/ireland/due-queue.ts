import { prisma } from "@/lib/prisma";
import { isIrelandCountry } from "./regions";
import {
  collectPlanningFormDueItems,
  daysUntilRegistrationDeadline,
  type PlanningFormDueItem,
} from "./planning-forms";
import { hasIeStlNumber, isIeRenewalDue } from "./registration-compliance";
import {
  FAILTE_STL_REGISTER_URL,
  FAILTE_STL_FAQ_URL,
  CITIZENS_INFO_STL_URL,
} from "./official-links";
import { IE_STL_REGISTRATION_DEADLINE } from "./constants";

export type IrelandDueItemKind =
  | "registration_deadline"
  | "renewal_due"
  | "form_15"
  | "form_16"
  | "form_17";

export type IrelandDueItem = {
  propertyId: string;
  propertyName: string;
  city: string;
  kind: IrelandDueItemKind;
  dueBy: string;
  daysRemaining: number | null;
  portalUrl: string;
  sourceUrl: string;
  year?: number;
  nightsUsedInYear?: number;
};

function toIso(d: Date): string {
  return d.toISOString();
}

export async function getIrelandDueQueueForUser(userId: string): Promise<IrelandDueItem[]> {
  const properties = await prisma.property.findMany({
    where: { userId, archived: false },
    include: {
      registration: true,
      guestStays: {
        where: {
          checkOutDate: { gte: new Date(new Date().getFullYear(), 0, 1) },
        },
        orderBy: { checkInDate: "asc" },
      },
    },
  });

  const now = new Date();
  const items: IrelandDueItem[] = [];

  for (const property of properties) {
    if (!isIrelandCountry(property.country)) continue;

    const reg = property.registration;
    const stays = property.guestStays.map((s) => ({
      checkInDate: s.checkInDate,
      checkOutDate: s.checkOutDate,
      importStatus: s.importStatus,
    }));

    const planningItems = collectPlanningFormDueItems(
      property.id,
      reg?.iePlanningStatus,
      stays,
      now
    );

    for (const form of planningItems) {
      const daysRemaining = Math.ceil(
        (form.dueBy.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (form.kind === "form_17" && daysRemaining < -28) continue;
      items.push({
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        kind: form.kind,
        dueBy: toIso(form.dueBy),
        daysRemaining,
        portalUrl: CITIZENS_INFO_STL_URL,
        sourceUrl: form.sourceUrl,
        year: form.year,
        nightsUsedInYear: form.nightsUsedInYear,
      });
    }

    if (!hasIeStlNumber(reg) && now <= IE_STL_REGISTRATION_DEADLINE) {
      const daysRemaining = daysUntilRegistrationDeadline(now);
      items.push({
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        kind: "registration_deadline",
        dueBy: toIso(IE_STL_REGISTRATION_DEADLINE),
        daysRemaining,
        portalUrl: FAILTE_STL_REGISTER_URL,
        sourceUrl: FAILTE_STL_REGISTER_URL,
      });
    }

    if (hasIeStlNumber(reg) && isIeRenewalDue(reg)) {
      const due = reg?.ieRenewalDueAt ? new Date(reg.ieRenewalDueAt) : null;
      items.push({
        propertyId: property.id,
        propertyName: property.name,
        city: property.city,
        kind: "renewal_due",
        dueBy: due ? toIso(due) : toIso(IE_STL_REGISTRATION_DEADLINE),
        daysRemaining: due
          ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        portalUrl: FAILTE_STL_REGISTER_URL,
        sourceUrl: FAILTE_STL_FAQ_URL,
      });
    }
  }

  const kindOrder: Record<IrelandDueItemKind, number> = {
    registration_deadline: 0,
    form_15: 1,
    form_16: 2,
    form_17: 3,
    renewal_due: 4,
  };

  items.sort((a, b) => {
    const oa = kindOrder[a.kind];
    const ob = kindOrder[b.kind];
    if (oa !== ob) return oa - ob;
    return (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999);
  });

  return items;
}

export type { PlanningFormDueItem };
