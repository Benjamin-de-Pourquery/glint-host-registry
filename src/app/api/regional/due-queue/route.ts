import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRegionalDueQueueForUser } from "@/lib/spain/regional-due-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getRegionalDueQueueForUser(session.user.id);
  return NextResponse.json({ items, count: items.length });
}
