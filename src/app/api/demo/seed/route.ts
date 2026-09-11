import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedDemoData } from "@/lib/demo-data";
import { hasActiveSubscription } from "@/lib/plans";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!hasActiveSubscription(user.subscriptionStatus)) {
    // Allow demo seed for exploration by temporarily granting starter access
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionPlan: "starter",
        subscriptionStatus: "active",
      },
    });
  }

  const body = await request.json().catch(() => ({}));
  const locale = body.locale || user.language || "en";

  await seedDemoData(session.user.id, locale);

  return NextResponse.json({ success: true });
}
