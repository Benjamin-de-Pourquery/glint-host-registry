"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceBadge } from "@/components/compliance-badge";
import { PlaybookPanel, PlaybookNextActionTeaser } from "@/components/playbook-panel";
import { PropertyRegisterTab } from "@/components/property-register-tab";
import { PropertyOverviewForm } from "@/components/property-overview-form";
import { PropertyListingsForm } from "@/components/property-listings-form";
import { PropertyNotesForm } from "@/components/property-notes-form";
import { getComplianceStatus } from "@/lib/compliance";
import type { PlatformProgressItem } from "@/lib/listings/platforms";
import { cn } from "@/lib/utils";

const TAB_IDS = ["overview", "compliance", "register", "listings", "notes"] as const;
export type PropertyDetailTab = (typeof TAB_IDS)[number];

type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

type Registration = {
  registrationNumber?: string | null;
  issuingAuthority?: string | null;
  status?: string | null;
  issueDate?: string | Date | null;
  expiryDate?: string | Date | null;
  notes?: string | null;
};

type PropertyData = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  residencyStatus?: string | null;
  airbnbUrl?: string | null;
  bookingUrl?: string | null;
  vrboUrl?: string | null;
  notes?: string | null;
  registration: Registration | null;
  checklistItems: ChecklistItem[];
  listingPlatformProgress: PlatformProgressItem[];
};

type Props = {
  property: PropertyData;
  locale: string;
};

function isValidTab(tab: string | null): tab is PropertyDetailTab {
  return TAB_IDS.includes(tab as PropertyDetailTab);
}

export function PropertyDetailTabs({ property, locale }: Props) {
  const t = useTranslations("properties.detail");
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const initialTab = isValidTab(tabParam) ? tabParam : "overview";
  const [activeTab, setActiveTab] = useState<PropertyDetailTab>(initialTab);

  useEffect(() => {
    if (isValidTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const setTab = useCallback(
    (tab: PropertyDetailTab) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "overview") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(
        `/${locale}/app/properties/${property.id}${query ? `?${query}` : ""}`,
        { scroll: false }
      );
    },
    [locale, property.id, router, searchParams]
  );

  const completed = property.checklistItems.filter((c) => c.completed).length;
  const complianceStatus = getComplianceStatus({
    registrationNumber: property.registration?.registrationNumber,
    status: property.registration?.status,
    expiryDate: property.registration?.expiryDate
      ? new Date(property.registration.expiryDate)
      : null,
    checklistCompleted: completed,
    checklistTotal: property.checklistItems.length,
  });

  const tForm = useTranslations("properties.form");
  const propertyTypeLabel = tForm(`types.${property.propertyType}`);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setTab(v as PropertyDetailTab)} className="min-w-0">
      <div className="sticky top-0 z-10 -mx-4 bg-white/95 px-0 pb-2 pt-1 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:-mx-0">
        <TabsList
          className={cn(
            "scroll-fade-x h-auto w-full max-w-full justify-start gap-0 rounded-none border-0 border-b border-slate-200 bg-transparent p-0 px-4 sm:px-0"
          )}
        >
          <TabsTrigger value="overview" className="shrink-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm sm:px-4 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
            {t("tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="shrink-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm sm:px-4 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
            {t("tabs.compliance")}
          </TabsTrigger>
          <TabsTrigger value="register" className="shrink-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm sm:px-4 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
            {t("tabs.register")}
          </TabsTrigger>
          <TabsTrigger value="listings" className="shrink-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm sm:px-4 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
            {t("tabs.listings")}
          </TabsTrigger>
          <TabsTrigger value="notes" className="shrink-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm sm:px-4 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
            {t("tabs.notes")}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t("overview.title")}</h2>
            <ComplianceBadge status={complianceStatus} className="shrink-0 self-start sm:self-center" />
          </div>

          <PlaybookNextActionTeaser
            propertyId={property.id}
            locale={locale}
            onGoToCompliance={() => setTab("compliance")}
          />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("overview.address")}
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                {property.address}, {property.city}, {property.country}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("overview.type")}
              </dt>
              <dd className="mt-1 text-sm text-slate-900">{propertyTypeLabel}</dd>
            </div>
            {property.registration?.registrationNumber && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t("overview.registration")}
                </dt>
                <dd className="mt-1 font-mono text-sm text-slate-900">
                  {property.registration.registrationNumber}
                </dd>
              </div>
            )}
          </dl>

          <PropertyOverviewForm
            propertyId={property.id}
            initial={{
              name: property.name,
              address: property.address,
              city: property.city,
              country: property.country,
              propertyType: property.propertyType,
              residencyStatus: property.residencyStatus,
            }}
          />
        </div>
      </TabsContent>

      <TabsContent value="compliance" className="mt-6">
        <PlaybookPanel
          propertyId={property.id}
          property={{
            name: property.name,
            address: property.address,
            city: property.city,
            country: property.country,
            propertyType: property.propertyType,
            residencyStatus: property.residencyStatus as
              | "primary"
              | "secondary"
              | "other"
              | null,
            notes: property.notes,
          }}
          locale={locale}
        />
      </TabsContent>

      <TabsContent value="register" className="mt-6">
        <PropertyRegisterTab
          propertyId={property.id}
          locale={locale}
          registration={property.registration}
          checklistItems={property.checklistItems}
        />
      </TabsContent>

      <TabsContent value="listings" className="mt-6">
        <PropertyListingsForm
          propertyId={property.id}
          initial={{
            airbnbUrl: property.airbnbUrl,
            bookingUrl: property.bookingUrl,
            vrboUrl: property.vrboUrl,
            registrationNumber: property.registration?.registrationNumber,
          }}
          platformProgress={property.listingPlatformProgress}
        />
      </TabsContent>

      <TabsContent value="notes" className="mt-6">
        <PropertyNotesForm propertyId={property.id} initialNotes={property.notes} />
      </TabsContent>
    </Tabs>
  );
}
