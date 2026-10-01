import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GUEST_STAY_TYPES } from "@/lib/germany/business-stay";
import { z } from "zod";

const patchSchema = z.object({
  stayType: z.enum(GUEST_STAY_TYPES).optional(),
  companyName: z.string().max(200).nullable().optional(),
  payer: z.string().max(200).nullable().optional(),
  projectRef: z.string().max(200).nullable().optional(),
  invoicePackJson: z.string().nullable().optional(),
  guestLabel: z.string().max(200).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, stayId } = await params;

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

  try {
    const body = await request.json();
    const data = patchSchema.parse(body);

    const updated = await prisma.guestStay.update({
      where: { id: stayId },
      data: {
        stayType: data.stayType,
        companyName: data.companyName,
        payer: data.payer,
        projectRef: data.projectRef,
        invoicePackJson: data.invoicePackJson,
        guestLabel: data.guestLabel,
        notes: data.notes,
      },
    });

    return NextResponse.json({
      id: updated.id,
      stayType: updated.stayType,
      companyName: updated.companyName,
      payer: updated.payer,
      projectRef: updated.projectRef,
      invoicePackJson: updated.invoicePackJson,
      guestLabel: updated.guestLabel,
      notes: updated.notes,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
