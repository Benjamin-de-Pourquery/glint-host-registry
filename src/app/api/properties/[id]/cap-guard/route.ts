import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nightCapApplies } from "@/lib/france/night-cap";
import { CAP_GUARD_MODES } from "@/lib/cap-guard/types";
import { getSiteUrl } from "@/lib/seo/site";
import { buildCapGuardFeedUrl } from "@/lib/cap-guard";
import {
  getRecentCapGuardEvents,
  recordCapGuardEvent,
} from "@/lib/cap-guard/events";
import {
  loadCapGuardContext,
  rotateCapGuardFeedToken,
  updateCapGuardPolicy,
} from "@/lib/cap-guard/service";
import { maybeRecordBreachNearEvent } from "@/lib/cap-guard/service";

const budgetWindowSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  allocatedNights: z.number().int().min(0).max(366),
});

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(CAP_GUARD_MODES).optional(),
  bufferNights: z.number().int().min(1).max(120).optional(),
  budgetWindows: z.array(budgetWindowSchema).optional(),
  registrationGate: z.boolean().optional(),
  propagationConfirmed: z.boolean().optional(),
});

const actionSchema = z.object({
  action: z.enum(["rotate"]),
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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applies = nightCapApplies(
    property.country,
    property.residencyStatus,
    property.city
  );

  if (!applies) {
    return NextResponse.json({
      applies: false,
      policy: null,
      forecast: null,
      blocks: [],
      feedUrl: null,
      events: [],
    });
  }

  const context = await loadCapGuardContext(property.id);
  if (!context) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (context.nightCap.computation?.enabled) {
    await maybeRecordBreachNearEvent(
      property.id,
      context.nightCap.computation.percentUsed
    );
  }

  const events = await getRecentCapGuardEvents(property.id, 8);
  const siteUrl = getSiteUrl();

  return NextResponse.json({
    applies: true,
    policy: {
      enabled: context.policy.enabled,
      mode: context.policy.mode,
      bufferNights: context.policy.bufferNights,
      budgetWindows: context.budgetWindows,
      registrationGate: context.policy.registrationGate,
      feedToken: context.policy.feedToken,
      feedTokenRotatedAt: context.policy.feedTokenRotatedAt?.toISOString() ?? null,
      propagationConfirmedAt:
        context.policy.propagationConfirmedAt?.toISOString() ?? null,
      suggestedBufferNights: Math.max(3, context.channelCount * 3),
    },
    computation: context.nightCap.computation,
    forecast: context.forecast,
    blocks: context.blockResult?.blocks.map((block) => ({
      start: block.start.toISOString(),
      end: block.end.toISOString(),
    })) ?? [],
    triggerReason: context.blockResult?.triggerReason ?? "none",
    feedUrl: buildCapGuardFeedUrl(context.policy.feedToken, siteUrl),
    registrationExpiry: context.registrationExpiry?.toISOString() ?? null,
    events: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
    })),
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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!nightCapApplies(property.country, property.residencyStatus, property.city)) {
    return NextResponse.json(
      { error: "Cap Guard not applicable for this property" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = patchSchema.parse(body);
    await updateCapGuardPolicy(property.id, data);
    return GET(request, { params: Promise.resolve({ id }) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
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
  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!nightCapApplies(property.country, property.residencyStatus, property.city)) {
    return NextResponse.json(
      { error: "Cap Guard not applicable for this property" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { action } = actionSchema.parse(body);

    if (action === "rotate") {
      await rotateCapGuardFeedToken(property.id);
      await recordCapGuardEvent(property.id, "blocks_published", {
        rotated: true,
      });
    }

    return GET(request, { params: Promise.resolve({ id }) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
