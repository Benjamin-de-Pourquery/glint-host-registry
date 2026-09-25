import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getRuleImpactFeedForUser,
  getUnseenImpactCountForProperty,
  markAllRuleImpactsSeenForProperty,
} from "@/lib/rule-radar/service";

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { id: true, name: true },
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

  const [items, unseenCount] = await Promise.all([
    getRuleImpactFeedForUser(session.user.id, {
      propertyId: id,
      limit: 10,
    }),
    getUnseenImpactCountForProperty(id, session.user.id),
  ]);

  return NextResponse.json({
    propertyId: id,
    propertyName: property.name,
    unseenCount,
    items,
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
  const property = await getOwnedProperty(id, session.user.id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.action !== "mark_all_seen") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const marked = await markAllRuleImpactsSeenForProperty(id, session.user.id);
  return NextResponse.json({ success: true, marked });
}
