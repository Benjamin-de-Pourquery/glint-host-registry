import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  CLASSIFICATIONS,
  COLLECTION_MODES,
  DECLARATION_CADENCES,
  getTouristTaxPriorityAction,
  touristTaxApplies,
} from "@/lib/france/tourist-tax";
import { loadPropertyTouristTax } from "@/lib/france/tourist-tax-service";

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  collectionMode: z.enum(COLLECTION_MODES).optional(),
  declarationCadence: z.enum(DECLARATION_CADENCES).optional(),
  portalUrl: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value)),
  classification: z.enum(CLASSIFICATIONS).optional(),
  attestationOnFile: z.boolean().optional(),
  notes: z.string().nullable().optional(),
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
    include: { touristTaxSettings: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!touristTaxApplies(property.country)) {
    return NextResponse.json({
      applies: false,
      settings: null,
      summary: null,
      priorityAction: null,
    });
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
}

export async function PATCH(
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

    const updatedSettings = await prisma.touristTaxSettings.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        enabled: data.enabled ?? true,
        collectionMode: data.collectionMode ?? "unknown",
        declarationCadence: data.declarationCadence ?? "monthly",
        portalUrl: data.portalUrl ?? null,
        classification: data.classification ?? "unclassified",
        attestationOnFile: data.attestationOnFile ?? false,
        notes: data.notes ?? null,
      },
      update: {
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.collectionMode !== undefined && {
          collectionMode: data.collectionMode,
        }),
        ...(data.declarationCadence !== undefined && {
          declarationCadence: data.declarationCadence,
        }),
        ...(data.portalUrl !== undefined && { portalUrl: data.portalUrl }),
        ...(data.classification !== undefined && {
          classification: data.classification,
        }),
        ...(data.attestationOnFile !== undefined && {
          attestationOnFile: data.attestationOnFile,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    const result = await loadPropertyTouristTax({
      propertyId: property.id,
      country: property.country,
      settings: updatedSettings,
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
