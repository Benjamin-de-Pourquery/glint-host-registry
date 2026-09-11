import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LISTING_PLATFORMS } from "@/lib/listings/platforms";
import { PropertyDetailTabs } from "@/components/property-detail-tabs";
import { PropertyArchiveButton } from "@/components/property-archive-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getMissingFicheCountForProperty } from "@/lib/guest-register/missing-fiches";

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
      listingPlatformProgress: true,
    },
  });

  if (!property) notFound();

  const listingPlatformProgress = LISTING_PLATFORMS.map((platform) => {
    const row = property.listingPlatformProgress.find((p) => p.platform === platform);
    return {
      platform,
      completed: row?.completed ?? false,
      completedAt: row?.completedAt?.toISOString() ?? null,
    };
  });

  const missingFichesCount = await getMissingFicheCountForProperty(
    id,
    session.user.id
  );

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Link href={`/${locale}/app/properties${property.archived ? "?tab=archived" : ""}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 break-words">{property.name}</h1>
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

      <Suspense fallback={<div className="py-12 text-center text-slate-500">{t("detail.loading")}</div>}>
        <PropertyDetailTabs
          locale={locale}
          missingFichesCount={missingFichesCount}
          property={{
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            country: property.country,
            propertyType: property.propertyType,
            residencyStatus: property.residencyStatus,
            airbnbUrl: property.airbnbUrl,
            bookingUrl: property.bookingUrl,
            vrboUrl: property.vrboUrl,
            notes: property.notes,
            registration: property.registration,
            checklistItems: property.checklistItems,
            listingPlatformProgress,
          }}
        />
      </Suspense>
    </div>
  );
}
