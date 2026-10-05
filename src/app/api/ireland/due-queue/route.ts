import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIrelandDueQueueForUser } from "@/lib/ireland/due-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getIrelandDueQueueForUser(session.user.id);
  return NextResponse.json({ items });
}
