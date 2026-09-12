import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSesDueQueueForUser } from "@/lib/ses/due-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getSesDueQueueForUser(session.user.id);
  return NextResponse.json({ items, count: items.length });
}
