import { prisma } from "@/lib/prisma";
import type { CapGuardEventType } from "./types";

export async function recordCapGuardEvent(
  propertyId: string,
  eventType: CapGuardEventType,
  payload?: Record<string, unknown>
): Promise<void> {
  await prisma.capGuardEvent.create({
    data: {
      propertyId,
      eventType,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
}

export async function getRecentCapGuardEvents(
  propertyId: string,
  limit = 10
): Promise<
  Array<{
    id: string;
    eventType: string;
    payload: string | null;
    createdAt: Date;
  }>
> {
  return prisma.capGuardEvent.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      eventType: true,
      payload: true,
      createdAt: true,
    },
  });
}
