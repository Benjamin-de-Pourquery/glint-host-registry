import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isGreeceCountry, isGreeceGuestReporting } from "@/lib/greece/regions";
import { getEffectiveGreeceRegistrationNumber } from "@/lib/greece/ama-compliance";
import { isLongTermStay } from "@/lib/greece/stay-duration";
import { AADE_PRINT_STYLES, renderAadeDeclarationHtml } from "@/lib/greece/export";

type Props = {
  params: Promise<{ locale: string; id: string; stayId: string }>;
};

export default async function AadeReportPrintPage({ params }: Props) {
  const { locale, id, stayId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) notFound();

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { registration: true },
  });

  if (
    !property ||
    !isGreeceCountry(property.country) ||
    !isGreeceGuestReporting(property.country, property.city)
  ) {
    notFound();
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay || !stay.guestRecords.length) notFound();

  if (isLongTermStay(stay.checkInDate, stay.checkOutDate)) notFound();

  const t = await getTranslations("aade.export");

  const html = renderAadeDeclarationHtml(
    {
      stayId: stay.id,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      guestLabel: stay.guestLabel,
      guests: stay.guestRecords,
      amaNumber: getEffectiveGreeceRegistrationNumber(property.registration),
      propertyAddress: property.address,
      propertyCity: property.city,
    },
    { name: property.name, city: property.city },
    {
      title: t("declarationTitle"),
      deadlineNote: t("deadlineNote"),
      portalNote: t("portalNote"),
      disclaimer: t("disclaimer"),
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
      amaLabel: t("amaLabel"),
      propertyLabel: t("propertyLabel"),
      footer: t("footer"),
    }
  );

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <title>{t("declarationTitle")} — {property.name}</title>
        <style>{AADE_PRINT_STYLES}</style>
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
