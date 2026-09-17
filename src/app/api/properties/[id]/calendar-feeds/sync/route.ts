import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  syncCalendarFeed,
  syncPropertyCalendarFeeds,
} from "@/lib/calendar/sync";
import { z } from "zod";

const syncSchema = z.object({
  feedId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const data = syncSchema.parse(body);

    if (data.feedId) {
      const feed = await prisma.calendarFeed.findFirst({
        where: {
          id: data.feedId,
          propertyId: id,
        },
      });

      if (!feed) {
        return NextResponse.json({ error: "Feed not found" }, { status: 404 });
      }

      const result = await syncCalendarFeed(feed.id);
      const { syncNightCapNotifications } = await import("@/lib/notifications");
      await syncNightCapNotifications(session.user.id);
      return NextResponse.json({ results: [result] });
    }

    const results = await syncPropertyCalendarFeeds(id);
    const { syncNightCapNotifications } = await import("@/lib/notifications");
    await syncNightCapNotifications(session.user.id);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
