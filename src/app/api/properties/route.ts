import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPropertyLimit, hasActiveSubscription } from "@/lib/plans";
import { DEFAULT_CHECKLIST_EN, DEFAULT_CHECKLIST_FR } from "@/lib/compliance";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  propertyType: z.string().min(1),
  residencyStatus: z.enum(["primary", "secondary", "other"]).nullable().optional(),
  airbnbUrl: z.string().optional(),
  bookingUrl: z.string().optional(),
  vrboUrl: z.string().optional(),
  notes: z.string().optional(),
  locale: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    include: {
      registration: true,
      checklistItems: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(properties);
}

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
    return NextResponse.json(
      { error: "Active subscription required" },
      { status: 403 }
    );
  }

  const count = await prisma.property.count({
    where: { userId: session.user.id, archived: false },
  });

  const limit = getPropertyLimit(user.subscriptionPlan);
  if (count >= limit) {
    return NextResponse.json(
      { error: "Property limit reached", limit, plan: user.subscriptionPlan },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const property = await prisma.property.create({
      data: {
        userId: session.user.id,
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        propertyType: data.propertyType,
        residencyStatus: data.residencyStatus ?? null,
        airbnbUrl: data.airbnbUrl || null,
        bookingUrl: data.bookingUrl || null,
        vrboUrl: data.vrboUrl || null,
        notes: data.notes || null,
      },
    });

    await prisma.registration.create({
      data: { propertyId: property.id, status: "not_started" },
    });

    const checklist =
      data.locale === "fr" ? DEFAULT_CHECKLIST_FR : DEFAULT_CHECKLIST_EN;

    for (let i = 0; i < checklist.length; i++) {
      await prisma.checklistItem.create({
        data: {
          propertyId: property.id,
          title: checklist[i],
          sortOrder: i,
        },
      });
    }

    const full = await prisma.property.findUnique({
      where: { id: property.id },
      include: { registration: true, checklistItems: true },
    });

    return NextResponse.json(full);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
