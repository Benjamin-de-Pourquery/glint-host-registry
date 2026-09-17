import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  NIGHT_CAP_SOURCES,
  getNightCapPriorityAction,
  nightCapApplies,
} from "@/lib/france/night-cap";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";

const patchSchema = z.object({
  nightCapEnabled: z.boolean().optional(),
  nightCapLimit: z.number().int().min(1).max(366).optional(),
  nightCapYear: z.number().int().min(2020).max(2100).optional(),
  nightCapSource: z.enum(NIGHT_CAP_SOURCES).optional(),
  notes: z.string().nullable().optional(),
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
    include: { nightCapSettings: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applies = nightCapApplies(property.country, property.residencyStatus);
  if (!applies) {
    return NextResponse.json({
      applies: false,
      settings: null,
      computation: null,
      priorityAction: null,
    });
  }

  const result = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: property.nightCapSettings,
  });

  const priorityAction = result.computation
    ? getNightCapPriorityAction(result.computation)
    : null;

  return NextResponse.json({
    applies: true,
    settings: result.settings,
    computation: result.computation,
    priorityAction,
  });
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
    include: { nightCapSettings: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!nightCapApplies(property.country, property.residencyStatus)) {
    return NextResponse.json(
      { error: "Night cap applies only to French primary residences" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = patchSchema.parse(body);

    const currentYear = new Date().getFullYear();

    const updatedSettings = await prisma.nightCapSettings.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        nightCapEnabled: data.nightCapEnabled ?? true,
        nightCapLimit: data.nightCapLimit ?? 120,
        nightCapYear: data.nightCapYear ?? currentYear,
        nightCapSource: data.nightCapSource ?? "statutory_120",
        notes: data.notes ?? null,
      },
      update: {
        ...(data.nightCapEnabled !== undefined && {
          nightCapEnabled: data.nightCapEnabled,
        }),
        ...(data.nightCapLimit !== undefined && {
          nightCapLimit: data.nightCapLimit,
        }),
        ...(data.nightCapYear !== undefined && { nightCapYear: data.nightCapYear }),
        ...(data.nightCapSource !== undefined && {
          nightCapSource: data.nightCapSource,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    const result = await loadPropertyNightCap({
      propertyId: property.id,
      country: property.country,
      city: property.city,
      residencyStatus: property.residencyStatus,
      settings: updatedSettings,
    });

    const priorityAction = result.computation
      ? getNightCapPriorityAction(result.computation)
      : null;

    return NextResponse.json({
      applies: true,
      settings: result.settings,
      computation: result.computation,
      priorityAction,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
