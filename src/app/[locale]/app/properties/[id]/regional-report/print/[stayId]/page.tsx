import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getSpainGuestReportingMode,
  isRegionalSpainReporting,
  isSpainCountry,
} from "@/lib/spain/regions";
import {
  REGIONAL_FITXA_PRINT_STYLES,
  renderRegionalFitxaHtml,
} from "@/lib/spain/regional-export";
import { getRegionalSystemLabel } from "@/lib/spain/regions";

type Props = {
  params: Promise<{ locale: string; id: string; stayId: string }>;
};

export default async function RegionalReportPrintPage({ params }: Props) {
  const { locale, id, stayId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) notFound();

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!property || !isSpainCountry(property.country) || !isRegionalSpainReporting(property.city)) {
    notFound();
  }

  const system = getSpainGuestReportingMode(property.city);
  const stay = await prisma.guestStay.findFirst({
    where: { id: stayId, propertyId: id },
    include: { guestRecords: true },
  });

  if (!stay || !stay.guestRecords.length) notFound();

  const t = await getTranslations("regional.export");
  const systemLabel = getRegionalSystemLabel(system, locale as "en" | "fr");

  const html = renderRegionalFitxaHtml(
    {
      stayId: stay.id,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      guestLabel: stay.guestLabel,
      guests: stay.guestRecords,
    },
    { name: property.name, city: property.city },
    system,
    {
      title: t("fitxaTitle"),
      systemLabel,
      deadlineNote: t("deadlineNote"),
      portalNote: t("portalNote", { system: systemLabel }),
      lastName: t("lastName"),
      firstNames: t("firstNames"),
      dateOfBirth: t("dateOfBirth"),
      placeOfBirth: t("placeOfBirth"),
      nationality: t("nationality"),
      documentType: t("documentType"),
      documentNumber: t("documentNumber"),
      documentSupport: t("documentSupport"),
      sex: t("sex"),
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
        <title>{t("fitxaTitle")} — {property.name}</title>
        <style>{REGIONAL_FITXA_PRINT_STYLES}</style>
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
