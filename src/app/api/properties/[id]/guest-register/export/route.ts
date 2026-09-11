import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { parseAccompanyingChildren } from "@/lib/guest-register";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const records = await prisma.guestRecord.findMany({
    where: {
      propertyId: id,
      OR: [
        { retentionExpiresAt: null },
        { retentionExpiresAt: { gte: now } },
      ],
    },
    orderBy: { submittedAt: "desc" },
  });

  const headers = [
    "lastName",
    "firstNames",
    "dateOfBirth",
    "placeOfBirth",
    "nationality",
    "usualAddress",
    "mobile",
    "email",
    "arrivalDate",
    "departureDate",
    "isFrenchNational",
    "requiresPoliceForm",
    "signedAt",
    "submittedAt",
    "retentionExpiresAt",
    "accompanyingChildren",
  ];

  const rows = records.map((r) => {
    const children = parseAccompanyingChildren(r.accompanyingChildrenJson);
    const childrenStr = children
      .map((c) => `${c.firstNames} (${c.dateOfBirth})`)
      .join("; ");

    return [
      r.lastName,
      r.firstNames,
      format(r.dateOfBirth, "yyyy-MM-dd"),
      r.placeOfBirth,
      r.nationality,
      r.usualAddress,
      r.mobile,
      r.email,
      format(r.arrivalDate, "yyyy-MM-dd"),
      format(r.departureDate, "yyyy-MM-dd"),
      r.isFrenchNational ? "yes" : "no",
      r.requiresPoliceForm ? "yes" : "no",
      r.signedAt ? format(r.signedAt, "yyyy-MM-dd HH:mm") : "",
      r.submittedAt ? format(r.submittedAt, "yyyy-MM-dd HH:mm") : "",
      r.retentionExpiresAt ? format(r.retentionExpiresAt, "yyyy-MM-dd") : "",
      childrenStr,
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `guest-register-${property.name.replace(/\s+/g, "-").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
