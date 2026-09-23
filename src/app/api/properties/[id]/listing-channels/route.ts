import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildStatusTransition,
  legacyUrlPatchFromChannels,
  toListingChannelRecord,
  validateChannelInput,
  LISTING_CHANNELS,
  DISPLAY_STATUSES,
} from "@/lib/listings/channels";
import { syncUpdateListingsPlaybookStep } from "@/lib/listings/playbook-sync";
import { recomputeListingHealth } from "@/lib/listing-health";
import { normalizeListingUrl } from "@/lib/listings/url-validation";
import { z } from "zod";

const createSchema = z.object({
  channel: z.enum(LISTING_CHANNELS),
  listingUrl: z.string().min(1),
  registrationNumberDisplayed: z.string().nullable().optional(),
  displayStatus: z.enum(DISPLAY_STATUSES).optional(),
  notes: z.string().nullable().optional(),
  blockReason: z.string().nullable().optional(),
});

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { listingChannels: true },
  });
}

async function syncLegacyUrls(propertyId: string) {
  const channels = await prisma.listingChannel.findMany({
    where: { propertyId },
    select: { channel: true, listingUrl: true },
  });
  const patch = legacyUrlPatchFromChannels(
    channels.map((c) => ({
      channel: c.channel as "AIRBNB" | "BOOKING" | "VRBO" | "OTHER",
      listingUrl: c.listingUrl,
    }))
  );
  await prisma.property.update({
    where: { id: propertyId },
    data: patch,
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

  return NextResponse.json({
    channels: property.listingChannels.map(toListingChannelRecord),
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
    const data = createSchema.parse(body);
    const validation = validateChannelInput({
      channel: data.channel,
      listingUrl: data.listingUrl,
      displayStatus: data.displayStatus,
    });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const listingUrl = normalizeListingUrl(data.listingUrl);
    const displayStatus = data.displayStatus ?? "UNKNOWN";
    const transition = buildStatusTransition(displayStatus, {
      blockReason: data.blockReason,
    });

    const channel = await prisma.listingChannel.upsert({
      where: {
        propertyId_channel: {
          propertyId: id,
          channel: data.channel,
        },
      },
      create: {
        propertyId: id,
        channel: data.channel,
        listingUrl,
        registrationNumberDisplayed: data.registrationNumberDisplayed ?? null,
        displayStatus: transition.displayStatus,
        blockedAt: transition.blockedAt,
        blockReason: transition.blockReason,
        lastCheckedAt: transition.lastCheckedAt,
        notes: data.notes ?? null,
      },
      update: {
        listingUrl,
        registrationNumberDisplayed: data.registrationNumberDisplayed ?? null,
        displayStatus: transition.displayStatus,
        blockedAt: transition.blockedAt,
        blockReason: transition.blockReason,
        lastCheckedAt: transition.lastCheckedAt,
        notes: data.notes ?? null,
      },
    });

    await syncLegacyUrls(id);
    await syncUpdateListingsPlaybookStep(id);
    await recomputeListingHealth(id);

    return NextResponse.json(toListingChannelRecord(channel));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
