import { addDays, startOfDay } from "date-fns";
import {
  getStayFicheDeadline,
  isStayMissingFiche,
  type GuestStayWithRecords,
} from "@/lib/guest-register/missing-fiches";

export type GuestDueSignals = {
  criticalCount: number;
  warningCount: number;
};

const WARNING_WINDOW_DAYS = 7;

export function computeGuestDueSignals(
  stays: GuestStayWithRecords[],
  now = new Date()
): GuestDueSignals {
  let criticalCount = 0;
  let warningCount = 0;

  for (const stay of stays) {
    if (!stay.expectsForeignGuest) continue;
    if (!isStayMissingFiche(stay, now)) continue;

    const deadline = getStayFicheDeadline(stay.checkInDate);
    const isOverdue = now >= deadline;

    if (isOverdue) {
      criticalCount++;
      continue;
    }

    const warningStart = startOfDay(addDays(stay.checkInDate, -WARNING_WINDOW_DAYS));
    if (now >= warningStart) {
      warningCount++;
    }
  }

  return { criticalCount, warningCount };
}
