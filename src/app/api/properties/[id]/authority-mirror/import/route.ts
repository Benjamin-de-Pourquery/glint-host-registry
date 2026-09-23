import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  detectCsvHeaders,
  importPlatformReservations,
  loadColumnMapping,
  PLATFORM_CHANNELS,
  rematchPropertyReservations,
} from "@/lib/authority-mirror";
import type { ColumnMapping, PlatformChannel } from "@/lib/authority-mirror";
import { recomputeListingHealth } from "@/lib/listing-health";

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { id: true },
  });
}

const channelSchema = z.enum(PLATFORM_CHANNELS);

export async function GET(
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

  const url = new URL(request.url);
  const preview = url.searchParams.get("preview");
  if (!preview) {
    const mapping = await loadColumnMapping(id, session.user.id, "GENERIC");
    return NextResponse.json({ mapping });
  }

  return NextResponse.json({ error: "Use POST with file for preview" }, { status: 400 });
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
    const formData = await request.formData();
    const file = formData.get("file");
    const channelRaw = String(formData.get("channel") ?? "GENERIC");
    const previewOnly = formData.get("preview") === "true";
    const channel = channelSchema.parse(channelRaw);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;

    if (previewOnly) {
      const headers = detectCsvHeaders(buffer.toString("utf-8"));
      const savedMapping = await loadColumnMapping(id, session.user.id, channel);
      return NextResponse.json({ headers, mapping: savedMapping });
    }

    let mapping: ColumnMapping | undefined;
    const mappingRaw = formData.get("mapping");
    if (mappingRaw) {
      mapping = JSON.parse(String(mappingRaw)) as ColumnMapping;
    } else if (channel === "GENERIC") {
      mapping = await loadColumnMapping(id, session.user.id, "GENERIC");
    }

    const result = await importPlatformReservations(
      id,
      session.user.id,
      channel as PlatformChannel,
      buffer,
      { filename, mapping }
    );

    await rematchPropertyReservations(id);
    await recomputeListingHealth(id);

    return NextResponse.json({
      ...result,
      message: "Imported in memory; raw file not retained.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid import" }, { status: 400 });
  }
}
