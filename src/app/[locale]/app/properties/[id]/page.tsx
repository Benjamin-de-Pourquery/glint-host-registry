import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/property-form";
import { CompliancePanel } from "@/components/compliance-panel";
import { PropertyArchiveButton } from "@/components/property-archive-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function PropertyDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties");

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href={`/${locale}/app/properties${property.archived ? "?tab=archived" : ""}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
              {property.archived && (
                <Badge variant="secondary">{t("card.archived")}</Badge>
              )}
            </div>
            <p className="text-slate-600">
              {property.address}, {property.city}, {property.country}
            </p>
          </div>
        </div>
        <PropertyArchiveButton
          propertyId={property.id}
          propertyName={property.name}
          archived={property.archived}
          size="default"
          redirectOnArchive={
            property.archived
              ? `/${locale}/app/properties`
              : `/${locale}/app/properties?tab=archived`
          }
        />
      </div>

      <CompliancePanel
        propertyId={property.id}
        propertyName={property.name}
        address={property.address}
        city={property.city}
        country={property.country}
        propertyType={property.propertyType}
        notes={property.notes}
        registration={property.registration}
        checklistItems={property.checklistItems}
        locale={locale}
      />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t("form.edit")}</h2>
        <PropertyForm
          mode="edit"
          initial={{
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            country: property.country,
            propertyType: property.propertyType,
            airbnbUrl: property.airbnbUrl,
            bookingUrl: property.bookingUrl,
            vrboUrl: property.vrboUrl,
            notes: property.notes,
          }}
        />
      </div>
    </div>
  );
}
