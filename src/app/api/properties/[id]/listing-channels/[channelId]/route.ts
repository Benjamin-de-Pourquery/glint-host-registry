import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildStatusTransition,
  legacyUrlPatchFromChannels,
  toListingChannelRecord,
  validateChannelInput,
  DISPLAY_STATUSES,
} from "@/lib/listings/channels";
import { syncUpdateListingsPlaybookStep } from "@/lib/listings/playbook-sync";
import { recomputeListingHealth } from "@/lib/listing-health";
import { normalizeListingUrl } from "@/lib/listings/url-validation";
import { z } from "zod";

const updateSchema = z.object({
  listingUrl: z.string().min(1).optional(),
  registrationNumberDisplayed: z.string().nullable().optional(),
  displayStatus: z.enum(DISPLAY_STATUSES).optional(),
  notes: z.string().nullable().optional(),
  blockReason: z.string().nullable().optional(),
});

async function getOwnedChannel(
  propertyId: string,
  channelId: string,
  userId: string
) {
  return prisma.listingChannel.findFirst({
    where: {
      id: channelId,
      propertyId,
      property: { userId },
    },
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, channelId } = await params;
  const existing = await getOwnedChannel(id, channelId, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (data.listingUrl) {
      const validation = validateChannelInput({
        channel: existing.channel,
        listingUrl: data.listingUrl,
        displayStatus: data.displayStatus,
      });
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    let statusFields: ReturnType<typeof buildStatusTransition> | undefined;
    if (data.displayStatus) {
      statusFields = buildStatusTransition(data.displayStatus, {
        blockReason: data.blockReason,
      });
    }

    const channel = await prisma.listingChannel.update({
      where: { id: channelId },
      data: {
        ...(data.listingUrl
          ? { listingUrl: normalizeListingUrl(data.listingUrl) }
          : {}),
        ...(data.registrationNumberDisplayed !== undefined
          ? { registrationNumberDisplayed: data.registrationNumberDisplayed }
          : {}),
        ...(statusFields
          ? {
              displayStatus: statusFields.displayStatus,
              blockedAt: statusFields.blockedAt,
              blockReason: statusFields.blockReason,
              lastCheckedAt: statusFields.lastCheckedAt,
            }
          : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, channelId } = await params;
  const existing = await getOwnedChannel(id, channelId, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.listingChannel.delete({ where: { id: channelId } });
  await syncLegacyUrls(id);
  await syncUpdateListingsPlaybookStep(id);
  await recomputeListingHealth(id);

  return NextResponse.json({ ok: true });
}
