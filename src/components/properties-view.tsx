"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComplianceBadge } from "@/components/compliance-badge";
import { PropertyArchiveButton } from "@/components/property-archive-button";
import { getComplianceStatus } from "@/lib/compliance";
import { Building2, ExternalLink, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertyItem = {
  id: string;
  name: string;
  city: string;
  country: string;
  archived: boolean;
  airbnbUrl?: string | null;
  registration?: {
    registrationNumber?: string | null;
    status?: string | null;
    expiryDate?: Date | null;
  } | null;
  checklistItems: Array<{ completed: boolean }>;
};

type Props = {
  locale: string;
  tab: "active" | "archived";
  properties: PropertyItem[];
  subscribed: boolean;
  atLimit: boolean;
  plan: string;
  limit: number;
};

export function PropertiesView({
  locale,
  tab,
  properties,
  subscribed,
  atLimit,
  plan,
  limit,
}: Props) {
  const t = useTranslations("properties");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-slate-600">{t("subtitle")}</p>
        </div>
        {subscribed && !atLimit && tab === "active" && (
          <Link href={`/${locale}/app/properties/new`}>
            <Button>
              <Plus className="h-4 w-4" />
              {t("add")}
            </Button>
          </Link>
        )}
      </div>

      <div className="flex w-full max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200/90 bg-slate-50 p-1 shadow-sm sm:w-fit">
        <Link href={`/${locale}/app/properties`}>
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === "active"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t("tabs.active")}
          </button>
        </Link>
        <Link href={`/${locale}/app/properties?tab=archived`}>
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === "archived"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t("tabs.archived")}
          </button>
        </Link>
      </div>

      {subscribed && atLimit && tab === "active" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-amber-900">{t("limit.title")}</p>
              <p className="text-sm text-amber-800">
                {t("limit.description", { plan, limit })}
              </p>
            </div>
            <Link href={`/${locale}/app/settings`} className="shrink-0">
              <Button variant="outline" className="w-full sm:w-auto">{t("limit.cta")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {properties.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center text-center">
            <Building2 className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {tab === "archived" ? t("emptyArchived.title") : t("empty.title")}
            </h3>
            <p className="mt-2 max-w-sm text-slate-500">
              {tab === "archived"
                ? t("emptyArchived.description")
                : t("empty.description")}
            </p>
            {subscribed && tab === "active" && (
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
              <Card key={property.id} className="transition-shadow hover:shadow-md hover:shadow-slate-900/[0.05]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{property.name}</h3>
                      <p className="text-sm text-slate-500">
                        {property.city}, {property.country}
                      </p>
                    </div>
                    <ComplianceBadge status={status} />
                  </div>
                  {tab === "archived" && (
                    <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {t("card.archived")}
                    </p>
                  )}
                  {property.registration?.registrationNumber && (
                    <p className="mt-3 rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                      {property.registration.registrationNumber}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link href={`/${locale}/app/properties/${property.id}`}>
                      <Button variant="outline" size="sm">
                        {t("card.view")}
                      </Button>
                    </Link>
                    <PropertyArchiveButton
                      propertyId={property.id}
                      propertyName={property.name}
                      archived={tab === "archived"}
                    />
                    {property.airbnbUrl && (
                      <a
                        href={property.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
