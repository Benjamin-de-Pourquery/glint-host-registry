/** eVisitor submission deadlines — 24 hours after arrival / departure. */

export const EVISITOR_HOURS_DEADLINE = 24;

export function getEvisitorDeadline(eventDate: Date): Date {
  return new Date(
    eventDate.getTime() + EVISITOR_HOURS_DEADLINE * 60 * 60 * 1000
  );
}

export function getHoursRemaining(deadline: Date, now: Date): number {
  const ms = deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (60 * 60 * 1000)));
}
