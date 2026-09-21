import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEvisitorDueQueueForUser } from "@/lib/croatia/due-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getEvisitorDueQueueForUser(session.user.id);
  return NextResponse.json({ items });
}
