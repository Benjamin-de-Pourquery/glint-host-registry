import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplianceStatus } from "@/lib/compliance";
import { hasActiveSubscription, getPropertyLimit } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComplianceBadge } from "@/components/compliance-badge";
import { Building2, Plus, ExternalLink } from "lucide-react";

type Props = { params: Promise<{ locale: string }> };

export default async function PropertiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("properties");

  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      registration: true,
      checklistItems: true,
    },
    orderBy: { name: "asc" },
  });

  const subscribed = user && hasActiveSubscription(user.subscriptionStatus);
  const limit = user ? getPropertyLimit(user.subscriptionPlan) : 0;
  const atLimit = properties.length >= limit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-slate-600">{t("subtitle")}</p>
        </div>
        {subscribed && !atLimit && (
          <Link href={`/${locale}/app/properties/new`}>
            <Button>
              <Plus className="h-4 w-4" />
              {t("add")}
            </Button>
          </Link>
        )}
      </div>

      {subscribed && atLimit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-amber-900">{t("limit.title")}</p>
              <p className="text-sm text-amber-800">
                {t("limit.description", { plan: user?.subscriptionPlan || "", limit })}
              </p>
            </div>
            <Link href={`/${locale}/app/settings`}>
              <Button variant="outline">{t("limit.cta")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {properties.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <Building2 className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{t("empty.title")}</h3>
            <p className="mt-2 max-w-sm text-slate-500">{t("empty.description")}</p>
            {subscribed && (
              <Link href={`/${locale}/app/properties/new`} className="mt-6">
                <Button>{t("empty.cta")}</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => {
            const completed = property.checklistItems.filter((c) => c.completed).length;
            const status = getComplianceStatus({
              registrationNumber: property.registration?.registrationNumber,
              status: property.registration?.status,
              expiryDate: property.registration?.expiryDate,
              checklistCompleted: completed,
              checklistTotal: property.checklistItems.length,
            });

            return (
              <Card key={property.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{property.name}</h3>
                      <p className="text-sm text-slate-500">{property.city}, {property.country}</p>
                    </div>
                    <ComplianceBadge status={status} />
                  </div>
                  {property.registration?.registrationNumber && (
                    <p className="mt-3 rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                      {property.registration.registrationNumber}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/${locale}/app/properties/${property.id}`}>
                      <Button variant="outline" size="sm">{t("card.view")}</Button>
                    </Link>
                    {property.airbnbUrl && (
                      <a href={property.airbnbUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
