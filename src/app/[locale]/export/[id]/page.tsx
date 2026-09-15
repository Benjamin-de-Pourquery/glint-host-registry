import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplianceStatus } from "@/lib/compliance";
import { format } from "date-fns";
import { NOINDEX_METADATA } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; id: string }> };

export const metadata: Metadata = NOINDEX_METADATA;

export default async function ExportPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("compliance");

  const session = await auth();
  if (!session?.user?.id) return null;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: {
      registration: true,
      checklistItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!property) notFound();

  const completed = property.checklistItems.filter((c) => c.completed).length;
  const status = getComplianceStatus({
    registrationNumber: property.registration?.registrationNumber,
    status: property.registration?.status,
    expiryDate: property.registration?.expiryDate,
    checklistCompleted: completed,
    checklistTotal: property.checklistItems.length,
  });

  return (
    <html lang={locale}>
      <head>
        <title>{property.name} — Listing Readiness</title>
        <style>{`
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #64748b; margin-bottom: 32px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
          .ready { background: #d1fae5; color: #065f46; }
          .action_needed { background: #fef3c7; color: #92400e; }
          .expired { background: #fee2e2; color: #991b1b; }
          .not_started { background: #f1f5f9; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          th { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
          .reg-number { font-family: monospace; font-size: 18px; font-weight: 700; background: #f8fafc; padding: 12px; border-radius: 8px; }
          .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
          @media print { body { margin: 0; } }
        `}</style>
      </head>
      <body>
        <h1>{property.name}</h1>
        <p className="subtitle">{property.address}, {property.city}, {property.country}</p>

        <p>
          <span className={`badge ${status}`}>{t(`status.${status}`)}</span>
        </p>

        <h2>{t("readiness.title")}</h2>
        <table>
          <tbody>
            <tr>
              <th>{t("registration.number")}</th>
              <td>
                <div className="reg-number">
                  {property.registration?.registrationNumber || "—"}
                </div>
              </td>
            </tr>
            <tr>
              <th>{t("registration.authority")}</th>
              <td>{property.registration?.issuingAuthority || "—"}</td>
            </tr>
            <tr>
              <th>{t("registration.status")}</th>
              <td>
                {property.registration?.status
                  ? t(`registration.statuses.${property.registration.status}`)
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>{t("registration.issueDate")}</th>
              <td>
                {property.registration?.issueDate
                  ? format(property.registration.issueDate, "dd/MM/yyyy")
                  : "—"}
              </td>
            </tr>
            <tr>
              <th>{t("registration.expiryDate")}</th>
              <td>
                {property.registration?.expiryDate
                  ? format(property.registration.expiryDate, "dd/MM/yyyy")
                  : "—"}
              </td>
            </tr>
          </tbody>
        </table>

        <h2>{t("checklist.title")}</h2>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Requirement</th>
            </tr>
          </thead>
          <tbody>
            {property.checklistItems.map((item) => (
              <tr key={item.id}>
                <td>{item.completed ? "✓" : "○"}</td>
                <td>{item.title}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer">
          <p>Glint Host Registry — {format(new Date(), "dd/MM/yyyy")}</p>
          <p>Generated for EU Regulation (EU) 2024/1028 compliance verification</p>
        </div>
      </body>
    </html>
  );
}
