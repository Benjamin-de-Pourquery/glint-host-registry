import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const submissions = await prisma.sesSubmission.findMany({
    where: { propertyId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    submissions: submissions.map((s) => ({
      id: s.id,
      stayId: s.stayId,
      guestRecordId: s.guestRecordId,
      status: s.status,
      mode: s.mode,
      correlationId: s.correlationId,
      loteCode: s.loteCode,
      governmentCode: s.governmentCode,
      governmentMessage: s.governmentMessage,
      validationErrors: s.validationErrorsJson
        ? JSON.parse(s.validationErrorsJson)
        : null,
      submittedAt: s.submittedAt?.toISOString() ?? null,
      respondedAt: s.respondedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
