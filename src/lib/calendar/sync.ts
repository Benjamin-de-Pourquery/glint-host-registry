import { prisma } from "@/lib/prisma";
import { fetchCalendarFeedText } from "@/lib/calendar/ssrf-safe-fetch";
import {
  buildExternalUid,
  parseIcalEvents,
} from "@/lib/calendar/ical-parser";

export type CalendarFeedSyncResult = {
  feedId: string;
  created: number;
  updated: number;
  cancelled: number;
  removed: number;
  eventCount: number;
  error?: string;
};

function resolveStaySource(sourceLabel: string | null | undefined): string {
  if (
    sourceLabel === "airbnb" ||
    sourceLabel === "booking" ||
    sourceLabel === "vrbo" ||
    sourceLabel === "other"
  ) {
    return sourceLabel;
  }
  return "ical";
}

export async function syncCalendarFeed(
  feedId: string
): Promise<CalendarFeedSyncResult> {
  const feed = await prisma.calendarFeed.findUnique({
    where: { id: feedId },
    include: {
      guestStays: {
        select: {
          id: true,
          externalUid: true,
          importStatus: true,
          guestRecords: { select: { id: true }, take: 1 },
        },
      },
    },
  });

  if (!feed) {
    throw new Error("Calendar feed not found");
  }

  if (!feed.enabled) {
    return {
      feedId,
      created: 0,
      updated: 0,
      cancelled: 0,
      removed: 0,
      eventCount: 0,
    };
  }

  let created = 0;
  let updated = 0;
  let cancelled = 0;
  let removed = 0;

  try {
    const icalText = await fetchCalendarFeedText(feed.url);
    const events = parseIcalEvents(icalText);
    const activeExternalUids = new Set<string>();

    for (const event of events) {
      const externalUid = buildExternalUid(feed.id, event.uid);
      activeExternalUids.add(externalUid);

      const importStatus = event.cancelled ? "cancelled" : "active";
      const guestLabel = event.summary.trim() || null;
      const source = resolveStaySource(feed.sourceLabel);

      const existing = feed.guestStays.find(
        (stay) => stay.externalUid === externalUid
      );

      if (existing) {
        await prisma.guestStay.update({
          where: { id: existing.id },
          data: {
            checkInDate: event.checkInDate,
            checkOutDate: event.checkOutDate,
            guestLabel,
            source,
            importStatus,
            calendarFeedId: feed.id,
          },
        });
        updated += 1;
        if (event.cancelled) cancelled += 1;
      } else {
        await prisma.guestStay.create({
          data: {
            propertyId: feed.propertyId,
            calendarFeedId: feed.id,
            externalUid,
            checkInDate: event.checkInDate,
            checkOutDate: event.checkOutDate,
            guestLabel,
            source,
            importStatus,
            expectsForeignGuest: true,
          },
        });
        created += 1;
        if (event.cancelled) cancelled += 1;
      }
    }

    for (const stay of feed.guestStays) {
      if (!stay.externalUid || activeExternalUids.has(stay.externalUid)) {
        continue;
      }

      const hasGuestRecords = stay.guestRecords.length > 0;
      if (hasGuestRecords) {
        await prisma.guestStay.update({
          where: { id: stay.id },
          data: { importStatus: "removed_from_feed" },
        });
        removed += 1;
      } else {
        await prisma.guestStay.delete({ where: { id: stay.id } });
        removed += 1;
      }
    }

    await prisma.calendarFeed.update({
      where: { id: feed.id },
      data: {
        lastSyncedAt: new Date(),
        lastError: null,
      },
    });

    return {
      feedId,
      created,
      updated,
      cancelled,
      removed,
      eventCount: events.length,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Calendar sync failed";

    await prisma.calendarFeed.update({
      where: { id: feed.id },
      data: { lastError: message },
    });

    return {
      feedId,
      created,
      updated,
      cancelled,
      removed,
      eventCount: 0,
      error: message,
    };
  }
}

export async function syncPropertyCalendarFeeds(
  propertyId: string
): Promise<CalendarFeedSyncResult[]> {
  const feeds = await prisma.calendarFeed.findMany({
    where: { propertyId, enabled: true },
    select: { id: true },
  });

  const results: CalendarFeedSyncResult[] = [];
  for (const feed of feeds) {
    results.push(await syncCalendarFeed(feed.id));
  }
  return results;
}

export async function syncAllEnabledCalendarFeeds(): Promise<{
  feedCount: number;
  results: CalendarFeedSyncResult[];
}> {
  const feeds = await prisma.calendarFeed.findMany({
    where: { enabled: true },
    select: { id: true },
  });

  const results: CalendarFeedSyncResult[] = [];
  for (const feed of feeds) {
    results.push(await syncCalendarFeed(feed.id));
  }

  return { feedCount: feeds.length, results };
}
