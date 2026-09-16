import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasEncryptionKey } from "@/lib/crypto/secrets";
import { testAlloggiatiCredentials } from "@/lib/italy/alloggiati/submit";
import { checkAlloggiatiRateLimit } from "@/lib/italy/alloggiati/rate-limit";
import { getAlloggiatiEndpoint } from "@/lib/italy/alloggiati/config";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateCheck = checkAlloggiatiRateLimit(session.user.id);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterMs: rateCheck.retryAfterMs },
      { status: 429 }
    );
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { alloggiatiCredential: true },
  });

  if (!property?.alloggiatiCredential) {
    return NextResponse.json({ error: "Credentials not configured" }, { status: 404 });
  }

  if (!hasEncryptionKey()) {
    return NextResponse.json({ error: "Encryption not configured" }, { status: 503 });
  }

  try {
    const result = await testAlloggiatiCredentials(id, session.user.id);

    return NextResponse.json({
      status: result.testStatus,
      httpStatus: 200,
      governmentCode: result.governmentCode,
      governmentMessage: result.governmentMessage,
      governmentDetail: result.governmentDetail,
      tokenExpires: result.tokenExpires,
      endpoint: getAlloggiatiEndpoint(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CREDENTIALS") {
      return NextResponse.json({ error: "Credentials not configured" }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : "Connection failed";
    await prisma.alloggiatiCredential.update({
      where: { propertyId: id },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: "connection_failed",
      },
    });

    return NextResponse.json({ status: "connection_failed", message }, { status: 502 });
  }
}
