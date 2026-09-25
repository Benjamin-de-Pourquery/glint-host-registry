import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markRuleImpactSeen } from "@/lib/rule-radar/service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const updated = await markRuleImpactSeen(id, session.user.id);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
