import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlloggiatiDueQueueForUser } from "@/lib/italy/due-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await getAlloggiatiDueQueueForUser(session.user.id);
  return NextResponse.json({ items });
}
