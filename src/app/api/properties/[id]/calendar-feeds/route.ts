import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateCalendarFeedUrl } from "@/lib/calendar/ssrf-safe-fetch";
import { z } from "zod";

const createFeedSchema = z.object({
  url: z.string().min(1),
  sourceLabel: z.enum(["airbnb", "booking", "vrbo", "other"]).optional(),
  enabled: z.boolean().optional(),
});

const updateFeedSchema = z.object({
  feedId: z.string().min(1),
  enabled: z.boolean().optional(),
  sourceLabel: z.enum(["airbnb", "booking", "vrbo", "other"]).optional(),
});

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const feeds = await prisma.calendarFeed.findMany({
    where: { propertyId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    feeds: feeds.map((feed) => ({
      id: feed.id,
      url: feed.url,
      sourceLabel: feed.sourceLabel,
      enabled: feed.enabled,
      lastSyncedAt: feed.lastSyncedAt?.toISOString() ?? null,
      lastError: feed.lastError,
      createdAt: feed.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = createFeedSchema.parse(body);
    const normalizedUrl = validateCalendarFeedUrl(data.url).toString();

    const feed = await prisma.calendarFeed.create({
      data: {
        propertyId: id,
        url: normalizedUrl,
        sourceLabel: data.sourceLabel ?? null,
        enabled: data.enabled ?? true,
      },
    });

    return NextResponse.json({
      id: feed.id,
      url: feed.url,
      sourceLabel: feed.sourceLabel,
      enabled: feed.enabled,
      lastSyncedAt: feed.lastSyncedAt?.toISOString() ?? null,
      lastError: feed.lastError,
      createdAt: feed.createdAt.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateFeedSchema.parse(body);

    const feed = await prisma.calendarFeed.findFirst({
      where: {
        id: data.feedId,
        propertyId: id,
        property: { userId: session.user.id },
      },
    });

    if (!feed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.calendarFeed.update({
      where: { id: feed.id },
      data: {
        enabled: data.enabled,
        sourceLabel: data.sourceLabel,
      },
    });

    return NextResponse.json({
      id: updated.id,
      url: updated.url,
      sourceLabel: updated.sourceLabel,
      enabled: updated.enabled,
      lastSyncedAt: updated.lastSyncedAt?.toISOString() ?? null,
      lastError: updated.lastError,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const feedId = searchParams.get("feedId");

  if (!feedId) {
    return NextResponse.json({ error: "feedId required" }, { status: 400 });
  }

  const feed = await prisma.calendarFeed.findFirst({
    where: {
      id: feedId,
      propertyId: id,
      property: { userId: session.user.id },
    },
  });

  if (!feed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.calendarFeed.delete({ where: { id: feedId } });

  return NextResponse.json({ success: true });
}
