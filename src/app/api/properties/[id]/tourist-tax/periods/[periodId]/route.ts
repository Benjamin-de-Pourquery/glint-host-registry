import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { DECLARATION_CHANNELS, getTouristTaxPriorityAction, touristTaxApplies } from "@/lib/france/tourist-tax";
import {
  loadPropertyTouristTax,
  markTouristTaxPeriodDeclared,
} from "@/lib/france/tourist-tax-service";

const patchSchema = z.object({
  status: z.enum(["declared", "waived"]).optional(),
  declarationChannel: z.enum(DECLARATION_CHANNELS).nullable().optional(),
  amountCents: z.number().int().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; periodId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, periodId } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { touristTaxSettings: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!touristTaxApplies(property.country)) {
    return NextResponse.json(
      { error: "Tourist tax tracking applies only to French properties" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = patchSchema.parse(body);

    if (data.status === "waived") {
      const period = await prisma.touristTaxPeriod.findFirst({
        where: { id: periodId, propertyId: id },
      });
      if (!period) {
        return NextResponse.json({ error: "Period not found" }, { status: 404 });
      }
      await prisma.touristTaxPeriod.update({
        where: { id: periodId },
        data: {
          status: "waived",
          notes: data.notes ?? period.notes,
        },
      });
    } else {
      const updated = await markTouristTaxPeriodDeclared(id, periodId, {
        declarationChannel: data.declarationChannel,
        amountCents: data.amountCents,
        notes: data.notes,
      });
      if (!updated) {
        return NextResponse.json({ error: "Period not found" }, { status: 404 });
      }
    }

    const result = await loadPropertyTouristTax({
      propertyId: property.id,
      country: property.country,
      settings: property.touristTaxSettings,
    });

    const priorityAction = result.summary
      ? getTouristTaxPriorityAction(result.summary)
      : null;

    return NextResponse.json({
      applies: true,
      settings: result.settings,
      summary: result.summary,
      priorityAction,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
