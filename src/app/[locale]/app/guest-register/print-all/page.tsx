import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FICHE_PRINT_STYLES, renderFicheHtml } from "@/lib/guest-register/fiche-html";
import { format } from "date-fns";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PortfolioFichePrintAllPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guestRegister.fiche");
  const tPack = await getTranslations("guestRegister.export");

  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const records = await prisma.guestRecord.findMany({
    where: {
      property: { userId: session.user.id, archived: false },
      OR: [{ retentionExpiresAt: null }, { retentionExpiresAt: { gte: now } }],
    },
    include: {
      property: { select: { name: true, city: true } },
    },
    orderBy: [{ property: { name: "asc" } }, { arrivalDate: "asc" }],
  });

  const labels = {
    title: t("title"),
    lastName: t("lastName"),
    firstNames: t("firstNames"),
    dateOfBirth: t("dateOfBirth"),
    placeOfBirth: t("placeOfBirth"),
    nationality: t("nationality"),
    usualAddress: t("usualAddress"),
    mobile: t("mobile"),
    email: t("email"),
    arrivalDate: t("arrivalDate"),
    departureDate: t("departureDate"),
    childrenTitle: t("childrenTitle"),
    childFirstNames: t("childFirstNames"),
    childDateOfBirth: t("childDateOfBirth"),
    signature: t("signature"),
    retention: t("retention"),
  };

  const fichesHtml = records
    .map((record) =>
      renderFicheHtml(
        record,
        { name: record.property.name, city: record.property.city },
        labels
      )
    )
    .join("");

  const propertyCount = new Set(records.map((r) => r.propertyId)).size;

  return (
    <html lang={locale}>
      <head>
        <title>{tPack("portfolioPackTitle")}</title>
        <style>{FICHE_PRINT_STYLES}</style>
      </head>
      <body>
        <div className="pack-header no-print">
          <h1>{tPack("portfolioPackTitle")}</h1>
          <p className="subtitle">
            {tPack("portfolioSummary", {
              records: records.length,
              properties: propertyCount,
            })}{" "}
            · {format(now, "dd/MM/yyyy")}
          </p>
          <p
            dangerouslySetInnerHTML={{
              __html: `<button type="button" onclick="window.print()" style="margin-top:16px;padding:8px 16px;background:#059669;color:white;border:none;border-radius:6px;cursor:pointer">${tPack("printButton")}</button>`,
            }}
          />
        </div>
        {records.length === 0 ? (
          <p>{tPack("noRecords")}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: fichesHtml }} />
        )}
      </body>
    </html>
  );
}
