"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, ChevronRight, HeartPulse, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingHealthBadge } from "@/components/listing-health-badge";
import type { ListingHealthFactor, ListingHealthSnapshotRecord } from "@/lib/listing-health/types";
import { cn } from "@/lib/utils";

type Props = {
  propertyId: string;
  locale: string;
  initialSnapshot: ListingHealthSnapshotRecord | null;
  truthCard?: {
    address: string;
    city: string;
    country: string;
    primaryRegistrationNumber: string | null;
    expiryDate: string | null;
    residencyStatus: string | null;
    propertyType: string;
  };
};

function formatFactorMessage(
  t: ReturnType<typeof useTranslations<"listingHealth">>,
  factor: ListingHealthFactor
): string {
  const key = factor.messageKey.replace(/^factors\./, "");
  const meta = factor.meta ?? {};
  return t(`factors.${key}` as never, meta as never);
}

export function ListingHealthCard({ propertyId, locale, initialSnapshot, truthCard }: Props) {
  const t = useTranslations("listingHealth");
  const tForm = useTranslations("properties.form");
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [loading, setLoading] = useState(false);

  const recompute = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/listing-health`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("recompute failed");
      const data = (await res.json()) as ListingHealthSnapshotRecord;
      setSnapshot(data);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [propertyId, router]);

  const showEmptyState = snapshot && !snapshot.isActivated;
  const blockingFactors = snapshot?.factors.filter((f) => f.severity === "blocking") ?? [];
  const warningFactors = snapshot?.factors.filter((f) => f.severity === "warning") ?? [];

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartPulse className="h-5 w-5 text-emerald-600" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {snapshot && !showEmptyState && (
            <ListingHealthBadge score={snapshot.score} />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={recompute}
            disabled={loading}
            aria-label={t("recompute")}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-slate-500">{t("disclaimer")}</p>

        {truthCard && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("truthCard.title")}
            </p>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">{t("truthCard.address")}</dt>
                <dd className="text-slate-900">
                  {truthCard.address}, {truthCard.city}, {truthCard.country}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">{t("truthCard.registration")}</dt>
                <dd className="font-mono text-slate-900">
                  {truthCard.primaryRegistrationNumber ?? t("truthCard.notSet")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">{t("truthCard.expiry")}</dt>
                <dd className="text-slate-900">
                  {truthCard.expiryDate
                    ? new Date(truthCard.expiryDate).toLocaleDateString(locale)
                    : t("truthCard.notSet")}
                </dd>
              </div>
              {truthCard.residencyStatus && (
                <div>
                  <dt className="text-xs text-slate-500">{t("truthCard.residency")}</dt>
                  <dd className="text-slate-900">
                    {tForm(`residency.${truthCard.residencyStatus}`)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-500">{t("truthCard.type")}</dt>
                <dd className="text-slate-900">{tForm(`types.${truthCard.propertyType}`)}</dd>
              </div>
            </dl>
          </div>
        )}

        {showEmptyState ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
            <p className="font-medium text-slate-900">{t("empty.title")}</p>
            <p className="mt-1 text-sm text-slate-600">{t("empty.description")}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href={`/${locale}/app/properties/${propertyId}?tab=compliance`}>
                <Button size="sm" variant="outline">{t("empty.addRegistration")}</Button>
              </Link>
              <Link href={`/${locale}/app/properties/${propertyId}?tab=listings`}>
                <Button size="sm">{t("empty.addListingUrl")}</Button>
              </Link>
            </div>
          </div>
        ) : snapshot && snapshot.factors.length === 0 ? (
          <p className="text-sm text-emerald-700">{t("allClear")}</p>
        ) : (
          <div className="space-y-3">
            {blockingFactors.length > 0 && (
              <FactorList
                title={t("factors.blocking")}
                factors={blockingFactors}
                locale={locale}
                formatMessage={(f) => formatFactorMessage(t, f)}
                fixLabel={t("fix")}
              />
            )}
            {warningFactors.length > 0 && (
              <FactorList
                title={t("factors.warnings")}
                factors={warningFactors}
                locale={locale}
                formatMessage={(f) => formatFactorMessage(t, f)}
                fixLabel={t("fix")}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FactorList({
  title,
  factors,
  locale,
  formatMessage,
  fixLabel,
}: {
  title: string;
  factors: ListingHealthFactor[];
  locale: string;
  formatMessage: (factor: ListingHealthFactor) => string;
  fixLabel: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="space-y-2">
        {factors.map((factor) => (
          <li key={factor.code}>
            <Link
              href={factor.href.startsWith("/") ? factor.href : `/${locale}${factor.href}`}
              className={cn(
                "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                factor.severity === "blocking"
                  ? "border-red-200 bg-red-50/80 hover:bg-red-50"
                  : "border-amber-200 bg-amber-50/80 hover:bg-amber-50"
              )}
            >
              <p className="text-sm text-slate-800">{formatMessage(factor)}</p>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700">
                {fixLabel}
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
