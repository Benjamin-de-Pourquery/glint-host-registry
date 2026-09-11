import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncUpdateListingsPlaybookStep } from "@/lib/listings/playbook-sync";
import {
  LISTING_PLATFORMS,
  type ListingPlatform,
} from "@/lib/listings/platforms";
import { z } from "zod";

const updateSchema = z.object({
  platform: z.enum(LISTING_PLATFORMS),
  completed: z.boolean(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { listingPlatformProgress: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const progress = LISTING_PLATFORMS.map((platform) => {
    const row = property.listingPlatformProgress.find((p) => p.platform === platform);
    return {
      platform,
      completed: row?.completed ?? false,
      completedAt: row?.completedAt?.toISOString() ?? null,
    };
  });

  return NextResponse.json({ progress });
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

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.listingPlatformProgress.upsert({
      where: {
        propertyId_platform: {
          propertyId: id,
          platform: data.platform,
        },
      },
      create: {
        propertyId: id,
        platform: data.platform,
        completed: data.completed,
        completedAt: data.completed ? new Date() : null,
      },
      update: {
        completed: data.completed,
        completedAt: data.completed ? new Date() : null,
      },
    });

    await syncUpdateListingsPlaybookStep(id);

    return NextResponse.json({
      platform: updated.platform as ListingPlatform,
      completed: updated.completed,
      completedAt: updated.completedAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
