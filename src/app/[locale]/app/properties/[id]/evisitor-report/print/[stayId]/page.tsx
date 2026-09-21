import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCroatiaCountry, isCroatiaGuestReporting } from "@/lib/croatia/regions";
import { EVISITOR_PRINT_STYLES, renderEvisitorGuestHtml } from "@/lib/croatia/export";

type Props = {
  params: Promise<{ locale: string; id: string; stayId: string }>;
  searchParams: Promise<{ phase?: string }>;
};

export default async function EvisitorReportPrintPage({ params, searchParams }: Props) {
  const { locale, id, stayId } = await params;
  const { phase: phaseParam } = await searchParams;
  const phase = phaseParam === "departure" ? "departure" : "arrival";
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) notFound();

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
  });

  if (!property || !isCroatiaCountry(property.country) || !isCroatiaGuestReporting(property.city)) {
    notFound();
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay || !stay.guestRecords.length) notFound();

  const t = await getTranslations("evisitor.export");

  const html = renderEvisitorGuestHtml(
    {
      stayId: stay.id,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      guestLabel: stay.guestLabel,
      guests: stay.guestRecords,
      phase,
      hrObjectId: property.registration?.hrObjectId,
      hrCategorisationNumber: property.registration?.hrCategorisationNumber,
    },
    { name: property.name, city: property.city },
    {
      title: t("guestTitle"),
      deadlineNote: t("deadlineNote"),
      portalNote: t("portalNote"),
      phaseLabel: t("phaseLabel"),
      lastName: t("lastName"),
      firstNames: t("firstNames"),
      sex: t("sex"),
      dateOfBirth: t("dateOfBirth"),
      nationality: t("nationality"),
      documentType: t("documentType"),
      documentNumber: t("documentNumber"),
      arrivalDate: t("arrivalDate"),
      departureDate: t("departureDate"),
      footer: t("footer"),
      disclaimer: t("disclaimer"),
      objectIdLabel: t("objectIdLabel"),
    }
  );

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <title>{t("guestTitle")} — {property.name}</title>
        <style>{EVISITOR_PRINT_STYLES}</style>
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <script
          dangerouslySetInnerHTML={{
            __html: "window.onload = function() { window.print(); }",
          }}
        />
      </body>
    </html>
  );
}
