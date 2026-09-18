import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPortugalCountry, isPortugalGuestReporting } from "@/lib/portugal/regions";
import { SIBA_PRINT_STYLES, renderSibaBoletimHtml } from "@/lib/portugal/export";

type Props = {
  params: Promise<{ locale: string; id: string; stayId: string }>;
  searchParams: Promise<{ phase?: string }>;
};

export default async function SibaReportPrintPage({ params, searchParams }: Props) {
  const { locale, id, stayId } = await params;
  const { phase: phaseParam } = await searchParams;
  const phase = phaseParam === "departure" ? "departure" : "arrival";
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) notFound();

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property || !isPortugalCountry(property.country) || !isPortugalGuestReporting(property.city)) {
    notFound();
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay || !stay.guestRecords.length) notFound();

  const t = await getTranslations("siba.export");

  const html = renderSibaBoletimHtml(
    {
      stayId: stay.id,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      guestLabel: stay.guestLabel,
      guests: stay.guestRecords,
      phase,
    },
    { name: property.name, city: property.city },
    {
      title: t("boletimTitle"),
      deadlineNote: t("deadlineNote"),
      portalNote: t("portalNote"),
      phaseLabel: t("phaseLabel"),
      lastName: t("lastName"),
      firstNames: t("firstNames"),
      sex: t("sex"),
      dateOfBirth: t("dateOfBirth"),
      placeOfBirth: t("placeOfBirth"),
      nationality: t("nationality"),
      documentType: t("documentType"),
      documentNumber: t("documentNumber"),
      address: t("address"),
      mobile: t("mobile"),
      email: t("email"),
      arrivalDate: t("arrivalDate"),
      departureDate: t("departureDate"),
      footer: t("footer"),
      disclaimer: t("disclaimer"),
    }
  );

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <title>{t("boletimTitle")} — {property.name}</title>
        <style>{SIBA_PRINT_STYLES}</style>
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <script
          dangerouslySetInnerHTML={{
            __html: "window.addEventListener('load', () => setTimeout(() => window.print(), 300));",
          }}
        />
      </body>
    </html>
  );
}
