import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isItalyCountry, isItalyGuestReporting } from "@/lib/italy/regions";
import {
  ALLOGGIATI_PRINT_STYLES,
  renderAlloggiatiSchedinaHtml,
} from "@/lib/italy/export";

type Props = {
  params: Promise<{ locale: string; id: string; stayId: string }>;
};

export default async function AlloggiatiReportPrintPage({ params }: Props) {
  const { locale, id, stayId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) notFound();

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property || !isItalyCountry(property.country) || !isItalyGuestReporting(property.city)) {
    notFound();
  }

  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay || !stay.guestRecords.length) notFound();

  const t = await getTranslations("alloggiati.export");

  const html = renderAlloggiatiSchedinaHtml(
    {
      stayId: stay.id,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      guestLabel: stay.guestLabel,
      guests: stay.guestRecords,
    },
    { name: property.name, city: property.city },
    {
      title: t("schedinaTitle"),
      deadlineNote: t("deadlineNote"),
      portalNote: t("portalNote"),
      lastName: t("lastName"),
      firstNames: t("firstNames"),
      sex: t("sex"),
      dateOfBirth: t("dateOfBirth"),
      placeOfBirth: t("placeOfBirth"),
      nationality: t("nationality"),
      documentType: t("documentType"),
      documentNumber: t("documentNumber"),
      address: t("address"),
      postalCode: t("postalCode"),
      municipality: t("municipality"),
      country: t("country"),
      mobile: t("mobile"),
      email: t("email"),
      arrivalDate: t("arrivalDate"),
      departureDate: t("departureDate"),
      childrenTitle: t("childrenTitle"),
      footer: t("footer"),
    }
  );

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <title>{t("schedinaTitle")} — {property.name}</title>
        <style>{ALLOGGIATI_PRINT_STYLES}</style>
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
