import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStayNotifyDueQueueForUser } from "@/lib/netherlands/due-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getStayNotifyDueQueueForUser(session.user.id);
  return NextResponse.json({ items });
}
