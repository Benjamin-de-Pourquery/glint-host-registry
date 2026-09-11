import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseAccompanyingChildren } from "@/lib/guest-register";
import { format } from "date-fns";

type Props = {
  params: Promise<{ locale: string; id: string; recordId: string }>;
};

export default async function GuestFichePrintPage({ params }: Props) {
  const { locale, id, recordId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guestRegister.fiche");

  const session = await auth();
  if (!session?.user?.id) return null;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property) notFound();

  const record = await prisma.guestRecord.findFirst({
    where: { id: recordId, propertyId: id },
  });

  if (!record) notFound();

  const children = parseAccompanyingChildren(record.accompanyingChildrenJson);

  const fields = [
    { label: t("lastName"), value: record.lastName },
    { label: t("firstNames"), value: record.firstNames },
    { label: t("dateOfBirth"), value: format(record.dateOfBirth, "dd/MM/yyyy") },
    { label: t("placeOfBirth"), value: record.placeOfBirth },
    { label: t("nationality"), value: record.nationality },
    { label: t("usualAddress"), value: record.usualAddress },
    { label: t("mobile"), value: record.mobile },
    { label: t("email"), value: record.email },
    { label: t("arrivalDate"), value: format(record.arrivalDate, "dd/MM/yyyy") },
    { label: t("departureDate"), value: format(record.departureDate, "dd/MM/yyyy") },
  ];

  return (
    <html lang={locale}>
      <head>
        <title>{t("title")} — {record.lastName}</title>
        <style>{`
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
          .bilingual { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-bottom: 24px; font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
          th { background: #f8fafc; font-weight: 600; width: 35%; }
          .signature { margin-top: 24px; border: 1px solid #e2e8f0; padding: 12px; }
          .signature img { max-height: 80px; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
          @media print { body { margin: 0; } }
        `}</style>
      </head>
      <body>
        <h1>{t("title")}</h1>
        <p className="subtitle">{property.name} — {property.city}</p>

        <div className="bilingual">
          <span>Fiche individuelle de police — Article R. 814-1 du CESEDA</span>
          <span>Individual police form — CESEDA Article R. 814-1</span>
        </div>

        <table>
          <tbody>
            {fields.map((f) => (
              <tr key={f.label}>
                <th>{f.label}</th>
                <td>{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {children.length > 0 && (
          <>
            <h2 style={{ fontSize: 14, marginTop: 24 }}>{t("childrenTitle")}</h2>
            <table>
              <thead>
                <tr>
                  <th>{t("childFirstNames")}</th>
                  <th>{t("childDateOfBirth")}</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child, i) => (
                  <tr key={i}>
                    <td>{child.firstNames}</td>
                    <td>{child.dateOfBirth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {record.signatureDataUrl && (
          <div className="signature">
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              {t("signature")} / Signature
            </p>
            <img src={record.signatureDataUrl} alt="Signature" />
            {record.signedAt && (
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                {format(record.signedAt, "dd/MM/yyyy HH:mm")}
              </p>
            )}
          </div>
        )}

        <div className="footer">
          <p>{t("retention")}</p>
          <p>Glint Host Registry — {format(new Date(), "dd/MM/yyyy")}</p>
        </div>
      </body>
    </html>
  );
}
