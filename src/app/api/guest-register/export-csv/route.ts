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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const records = await prisma.guestRecord.findMany({
    where: {
      property: { userId: session.user.id, archived: false },
      OR: [{ retentionExpiresAt: null }, { retentionExpiresAt: { gte: now } }],
    },
    include: { property: { select: { name: true } } },
    orderBy: [{ property: { name: "asc" } }, { arrivalDate: "asc" }],
  });

  const headers = [
    "propertyName",
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
      r.property.name,
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

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="guest-register-portfolio.csv"',
    },
  });
}
