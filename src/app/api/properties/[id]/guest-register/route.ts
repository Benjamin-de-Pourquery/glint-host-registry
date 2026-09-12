import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGuestRegisterToken } from "@/lib/guest-register";
import { syncGuestRegisterPlaybookStep } from "@/lib/guest-register/playbook-sync";
import {
  getMissingFicheCountForProperty,
  getStayFicheDeadline,
  isStayMissingFiche,
  stayHasMatchingFiche,
} from "@/lib/guest-register/missing-fiches";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["enable", "disable", "rotate"]),
});

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: {
      guestRegisterToken: true,
      guestRecords: {
        where: {
          OR: [
            { retentionExpiresAt: null },
            { retentionExpiresAt: { gte: new Date() } },
          ],
        },
        orderBy: { submittedAt: "desc" },
        take: 100,
      },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.id);

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const guestsThisMonth = await prisma.guestRecord.count({
    where: {
      propertyId: id,
      submittedAt: { gte: monthStart },
    },
  });

  const guestStays = await prisma.guestStay.findMany({
    where: { propertyId: id },
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
  });

  const stays = guestStays
    .filter((stay) => stay.importStatus !== "removed_from_feed")
    .map((stay) => ({
      id: stay.id,
      checkInDate: stay.checkInDate.toISOString(),
      checkOutDate: stay.checkOutDate.toISOString(),
      expectsForeignGuest: stay.expectsForeignGuest,
      guestLabel: stay.guestLabel,
      notes: stay.notes,
      source: stay.source,
      importStatus: stay.importStatus,
      hasMatchingFiche: stayHasMatchingFiche(stay),
      isMissingFiche: isStayMissingFiche(stay, now),
      ficheDeadline: getStayFicheDeadline(stay.checkInDate).toISOString(),
    }));

  const missingFichesCount = await getMissingFicheCountForProperty(
    id,
    session.user.id
  );

  const records = property.guestRecords.map((r) => ({
    id: r.id,
    lastName: r.lastName,
    firstNames: r.firstNames,
    nationality: r.nationality,
    arrivalDate: r.arrivalDate.toISOString(),
    departureDate: r.departureDate.toISOString(),
    isFrenchNational: r.isFrenchNational,
    requiresPoliceForm: r.requiresPoliceForm,
    signedAt: r.signedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    retentionExpiresAt: r.retentionExpiresAt?.toISOString() ?? null,
  }));

  return NextResponse.json({
    token: property.guestRegisterToken
      ? {
          enabled: property.guestRegisterToken.enabled,
          token: property.guestRegisterToken.token,
          createdAt: property.guestRegisterToken.createdAt.toISOString(),
        }
      : null,
    records,
    stays,
    guestsThisMonth,
    missingFichesCount,
  });
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
    include: { guestRegisterToken: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { action } = actionSchema.parse(body);

    if (action === "disable") {
      if (property.guestRegisterToken) {
        await prisma.guestRegisterToken.update({
          where: { propertyId: id },
          data: { enabled: false },
        });
      }
      return NextResponse.json({ enabled: false });
    }

    const token = generateGuestRegisterToken();

    if (property.guestRegisterToken) {
      if (action === "rotate") {
        await prisma.guestRegisterToken.update({
          where: { propertyId: id },
          data: { token, enabled: true },
        });
      } else {
        await prisma.guestRegisterToken.update({
          where: { propertyId: id },
          data: { enabled: true },
        });
      }
    } else {
      await prisma.guestRegisterToken.create({
        data: {
          propertyId: id,
          token,
          enabled: true,
        },
      });
    }

    await syncGuestRegisterPlaybookStep(id);

    const updated = await prisma.guestRegisterToken.findUnique({
      where: { propertyId: id },
    });

    return NextResponse.json({
      enabled: updated?.enabled ?? true,
      token: updated?.token,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
