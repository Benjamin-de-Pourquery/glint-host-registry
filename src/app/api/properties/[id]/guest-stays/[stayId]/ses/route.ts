import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitSesParteViajeros } from "@/lib/ses/submit";
import { buildStayInputFromRecords } from "@/lib/ses/mappers";
import { buildSesPayload } from "@/lib/ses/xml-builder";
import { validateStayForSes } from "@/lib/ses/validation";
import { checkSesRateLimit } from "@/lib/ses/rate-limit";
import { isSpainCountry, usesSesHospedajes } from "@/lib/spain/regions";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["prepare", "submit"]),
  mode: z.enum(["dry_run", "live"]).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; stayId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateCheck = checkSesRateLimit(session.user.id);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterMs: rateCheck.retryAfterMs },
      { status: 429 }
    );
  }

  const { id, stayId } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { sesCredential: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSpainCountry(property.country)) {
    return NextResponse.json({ error: "SES only applies to Spain" }, { status: 400 });
  }

  if (!usesSesHospedajes(property.city)) {
    return NextResponse.json(
      { error: "This region uses a regional guest system, not SES" },
      { status: 400 }
    );
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay) {
    return NextResponse.json({ error: "Stay not found" }, { status: 404 });
  }

  if (!stay.guestRecords.length) {
    return NextResponse.json({ error: "No guest records for this stay" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { action, mode } = actionSchema.parse(body);
    const stayInput = buildStayInputFromRecords(
      stay.id,
      stay.checkInDate,
      stay.checkOutDate,
      stay.guestRecords
    );

    if (action === "prepare") {
      if (!property.sesCredential) {
        return NextResponse.json({ error: "SES credentials not configured" }, { status: 400 });
      }

      const validationErrors = validateStayForSes(stayInput);
      const payload = buildSesPayload(
        property.sesCredential.codigoEstablecimiento,
        stayInput
      );

      return NextResponse.json({
        ready: validationErrors.length === 0,
        validationErrors,
        summary: payload.summary,
        xmlPreview: payload.xml.slice(0, 3000),
        guestCount: stay.guestRecords.length,
      });
    }

    const result = await submitSesParteViajeros({
      propertyId: id,
      userId: session.user.id,
      stayId,
      stay: stayInput,
      mode: mode ?? "dry_run",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NO_CREDENTIALS") {
        return NextResponse.json({ error: "SES credentials not configured" }, { status: 400 });
      }
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
