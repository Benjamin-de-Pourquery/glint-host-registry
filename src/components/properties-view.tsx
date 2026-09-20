"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComplianceBadge } from "@/components/compliance-badge";
import { PropertyArchiveButton } from "@/components/property-archive-button";
import { EmptyState } from "@/components/empty-state";
import {
  getComplianceNextActionKey,
  getComplianceStatus,
  propertiesListHref,
  propertyHasListingComplianceIssue,
  type PortfolioStatusFilter,
} from "@/lib/compliance";
import { needsNationalTransitionAttention } from "@/lib/national-transition";
import { needsGreeceAmaAttention } from "@/lib/greece/ama-compliance";
import { Building2, ExternalLink, LayoutGrid, List, Plus, X } from "lucide-react";
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
    nationalTransitionStatus?: string | null;
    nationalRegistrationNumber?: string | null;
    amaNumber?: string | null;
    amaStatus?: string | null;
    amaDisplayedOnListings?: boolean;
    greeceRegistrationKind?: string | null;
    greeceAlternateLicenseNumber?: string | null;
  } | null;
  checklistItems: Array<{ completed: boolean }>;
  listingChannels?: Array<{ displayStatus: string; listingUrl: string }>;
};

type ViewMode = "compact" | "cards";

const STATUS_FILTER_OPTIONS: PortfolioStatusFilter[] = [
  "all",
  "action_needed",
  "expired",
  "ready",
  "not_started",
  "listing_compliance",
  "greece_ama",
  "night_cap",
  "tourist_tax",
];

type Props = {
  locale: string;
  tab: "active" | "archived";
  statusFilter: PortfolioStatusFilter | null;
  properties: PropertyItem[];
  subscribed: boolean;
  atLimit: boolean;
  plan: string;
  limit: number;
  nightCapAttentionIds?: string[];
  touristTaxAttentionIds?: string[];
};

const VIEW_STORAGE_KEY = "glint-properties-view";

function useDefaultViewMode(): ViewMode {
  const [mode, setMode] = useState<ViewMode>("compact");

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "cards" || stored === "compact") {
      setMode(stored);
      return;
    }
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    setMode(isMobile ? "compact" : "cards");
  }, []);

  return mode;
}

function getPropertyComplianceStatus(property: PropertyItem) {
  const completed = property.checklistItems.filter((c) => c.completed).length;
  return getComplianceStatus({
    registrationNumber: property.registration?.registrationNumber,
    status: property.registration?.status,
    expiryDate: property.registration?.expiryDate,
    checklistCompleted: completed,
    checklistTotal: property.checklistItems.length,
  });
}

export function PropertiesView({
  locale,
  tab,
  statusFilter,
  properties,
  subscribed,
  atLimit,
  plan,
  limit,
  nightCapAttentionIds = [],
  touristTaxAttentionIds = [],
}: Props) {
  const nightCapSet = new Set(nightCapAttentionIds);
  const touristTaxSet = new Set(touristTaxAttentionIds);
  const t = useTranslations("properties");
  const tCompliance = useTranslations("compliance.status");
  const viewMode = useDefaultViewMode();
  const [activeView, setActiveView] = useState<ViewMode>(viewMode);

  useEffect(() => {
    setActiveView(viewMode);
  }, [viewMode]);

  const setView = (mode: ViewMode) => {
    setActiveView(mode);
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  };

  const filteredProperties =
    tab === "active" && statusFilter
      ? properties.filter((property) => {
          if (statusFilter === "national_transition") {
            return needsNationalTransitionAttention(property.country, property.registration);
          }
          if (statusFilter === "listing_compliance") {
            return propertyHasListingComplianceIssue(property.listingChannels ?? []);
          }
          if (statusFilter === "greece_ama") {
            return needsGreeceAmaAttention(property.country, property.registration);
          }
          if (statusFilter === "night_cap") {
            return nightCapSet.has(property.id);
          }
          if (statusFilter === "tourist_tax") {
            return touristTaxSet.has(property.id);
          }
          return getPropertyComplianceStatus(property) === statusFilter;
        })
      : properties;

  const activeStatusFilter = statusFilter ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-display text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-slate-600">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {filteredProperties.length > 0 && (
            <div
              className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
              role="group"
              aria-label={t("list.viewToggle")}
            >
              <button
                type="button"
                onClick={() => setView("compact")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                  activeView === "compact"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
                aria-pressed={activeView === "compact"}
              >
                <List className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{t("list.compact")}</span>
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                  activeView === "cards"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
                aria-pressed={activeView === "cards"}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{t("list.cards")}</span>
              </button>
            </div>
          )}
          {subscribed && !atLimit && tab === "active" && (
            <Link href={`/${locale}/app/properties/new`}>
              <Button>
                <Plus className="h-4 w-4" />
                {t("add")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex w-full max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200/90 bg-slate-50 p-1 shadow-sm sm:w-fit">
        <Link href={propertiesListHref(locale, { status: statusFilter })}>
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
              tab === "active"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t("tabs.active")}
          </button>
        </Link>
        <Link href={propertiesListHref(locale, { tab: "archived" })}>
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
              tab === "archived"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {t("tabs.archived")}
          </button>
        </Link>
      </div>

      {tab === "active" && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex w-full max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200/90 bg-slate-50 p-1 shadow-sm sm:w-fit">
            {STATUS_FILTER_OPTIONS.map((status) => (
              <Link key={status} href={propertiesListHref(locale, { status })}>
                <button
                  type="button"
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                    activeStatusFilter === status
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {status === "all" ? t("filters.all") : tCompliance(status)}
                </button>
              </Link>
            ))}
          </div>
          {statusFilter && (
            <Link
              href={propertiesListHref(locale)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              {t("filters.clear")}
            </Link>
          )}
        </div>
      )}

      {subscribed && atLimit && tab === "active" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-amber-950">{t("limit.title")}</p>
              <p className="text-sm text-amber-900">
                {t("limit.description", { plan, limit })}
              </p>
            </div>
            <Link href={`/${locale}/app/settings`} className="shrink-0">
              <Button variant="outline" className="w-full sm:w-auto">{t("limit.cta")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={
            tab === "archived"
              ? t("emptyArchived.title")
              : statusFilter
                ? t("emptyFiltered.title")
                : t("empty.title")
          }
          description={
            tab === "archived"
              ? t("emptyArchived.description")
              : statusFilter
                ? t("emptyFiltered.description", { status: tCompliance(statusFilter) })
                : t("empty.description")
          }
        >
          {statusFilter && tab === "active" && (
            <Link href={propertiesListHref(locale)}>
              <Button variant="outline">{t("filters.clear")}</Button>
            </Link>
          )}
          {subscribed && tab === "active" && !statusFilter && (
            <Link href={`/${locale}/app/properties/new`}>
              <Button>{t("empty.cta")}</Button>
            </Link>
          )}
        </EmptyState>
      ) : activeView === "compact" ? (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
          {filteredProperties.map((property) => {
            const status = getPropertyComplianceStatus(property);
            const hasListingIssue = propertyHasListingComplianceIssue(
              property.listingChannels ?? []
            );
            const nextActionKey = hasListingIssue
              ? "listing_compliance"
              : getComplianceNextActionKey(status);

            return (
              <Link
                key={property.id}
                href={`/${locale}/app/properties/${property.id}`}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900">{property.name}</p>
                    {tab === "archived" && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {t("card.archived")}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{property.city}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <ComplianceBadge status={status} />
                  <span className="hidden text-xs text-slate-500 sm:inline">
                    {t(`list.nextAction.${nextActionKey}`)}
                  </span>
                  <span className="text-[11px] text-slate-400 sm:hidden">
                    {tCompliance(nextActionKey)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => {
            const status = getPropertyComplianceStatus(property);

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
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
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
