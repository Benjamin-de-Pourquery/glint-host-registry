import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRuleImpactFeedForUser } from "@/lib/rule-radar/service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unseenOnly = searchParams.get("unseen") === "1";
  const propertyId = searchParams.get("propertyId") ?? undefined;
  const limit = searchParams.get("limit")
    ? Number.parseInt(searchParams.get("limit")!, 10)
    : undefined;

  const items = await getRuleImpactFeedForUser(session.user.id, {
    unseenOnly,
    propertyId,
    limit,
  });

  return NextResponse.json({ items });
}
