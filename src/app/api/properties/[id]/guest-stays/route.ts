import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getStayFicheDeadline,
  isStayMissingFiche,
  stayHasMatchingFiche,
} from "@/lib/guest-register/missing-fiches";
import { z } from "zod";

const createStaySchema = z.object({
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  expectsForeignGuest: z.boolean().default(true),
  guestLabel: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    select: {
      guestStays: {
        include: {
          guestRecords: {
            select: {
              id: true,
              arrivalDate: true,
              requiresPoliceForm: true,
              isFrenchNational: true,
            },
          },
        },
        orderBy: { checkInDate: "desc" },
        take: 50,
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const stays = property.guestStays.map((stay) => ({
    id: stay.id,
    checkInDate: stay.checkInDate.toISOString(),
    checkOutDate: stay.checkOutDate.toISOString(),
    expectsForeignGuest: stay.expectsForeignGuest,
    guestLabel: stay.guestLabel,
    notes: stay.notes,
    hasMatchingFiche: stayHasMatchingFiche(stay),
    isMissingFiche: isStayMissingFiche(stay, now),
    ficheDeadline: getStayFicheDeadline(stay.checkInDate).toISOString(),
  }));

  return NextResponse.json({ stays });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = createStaySchema.parse(body);
    const checkInDate = new Date(data.checkInDate);
    const checkOutDate = new Date(data.checkOutDate);

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    const stay = await prisma.guestStay.create({
      data: {
        propertyId: id,
        checkInDate,
        checkOutDate,
        expectsForeignGuest: data.expectsForeignGuest,
        guestLabel: data.guestLabel?.trim() || null,
        notes: data.notes?.trim() || null,
        source: "manual",
      },
    });

    return NextResponse.json({
      id: stay.id,
      checkInDate: stay.checkInDate.toISOString(),
      checkOutDate: stay.checkOutDate.toISOString(),
      expectsForeignGuest: stay.expectsForeignGuest,
      guestLabel: stay.guestLabel,
      notes: stay.notes,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const stayId = searchParams.get("stayId");

  if (!stayId) {
    return NextResponse.json({ error: "stayId required" }, { status: 400 });
  }

  const stay = await prisma.guestStay.findFirst({
    where: {
      id: stayId,
      propertyId: id,
      property: { userId: session.user.id },
    },
  });

  if (!stay) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.guestStay.delete({ where: { id: stayId } });

  return NextResponse.json({ success: true });
}
