import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplianceStatus, propertyHasListingComplianceIssue } from "@/lib/compliance";
import { needsNationalTransitionAttention } from "@/lib/national-transition";
import { hasActiveSubscription } from "@/lib/plans";
import { syncAllNotifications } from "@/lib/notifications";
import { getNightCapAttentionForUser } from "@/lib/france/night-cap-service";
import { getTouristTaxAttentionForUser } from "@/lib/france/tourist-tax-service";
import { getMissingFichesForUser } from "@/lib/guest-register/missing-fiches";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComplianceBadge } from "@/components/compliance-badge";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { EmptyState } from "@/components/empty-state";
import { format, differenceInDays } from "date-fns";
import { Building2 } from "lucide-react";
import { SesDueQueue } from "@/components/ses-due-queue";
import { RegionalDueQueue } from "@/components/regional-due-queue";
import { AlloggiatiDueQueue } from "@/components/alloggiati-due-queue";
import { SibaDueQueue } from "@/components/siba-due-queue";
import { AadeDueQueue } from "@/components/aade-due-queue";
import { EvisitorDueQueue } from "@/components/evisitor-due-queue";
import { NlDueQueue } from "@/components/nl-due-queue";
import { needsGreeceAmaAttention } from "@/lib/greece/ama-compliance";
import { needsCroatiaEvisitorAttention } from "@/lib/croatia/categorisation-compliance";
import { needsNlRegistrationAttention } from "@/lib/netherlands/registration-compliance";
import { needsBelgiumRegistrationAttention } from "@/lib/belgium/registration-compliance";
import { getListingHealthScoresForUser } from "@/lib/listing-health";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      subscriptionStatus: true,
      onboardingDismissedAt: true,
    },
  });

  await syncAllNotifications(session.user.id);

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      registration: true,
      checklistItems: true,
      guestRegisterToken: true,
      listingChannels: true,
    },
    orderBy: { name: "asc" },
  });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const guestsThisMonth = await prisma.guestRecord.count({
    where: {
      property: { userId: session.user.id, archived: false },
      submittedAt: { gte: monthStart },
    },
  });

  const missingFiches = await getMissingFichesForUser(session.user.id);
  const fichesNeeded = missingFiches.length;
  const nightCapAttention = await getNightCapAttentionForUser(session.user.id);
  const nightCapAttentionCount = nightCapAttention.length;
  const touristTaxAttention = await getTouristTaxAttentionForUser(session.user.id);
  const touristTaxAttentionCount = touristTaxAttention.length;
  const listingHealthScores = await getListingHealthScoresForUser(session.user.id, locale);
  const listingHealthAtRiskCount = listingHealthScores.filter(
    (s) => s.score === "ORANGE" || s.score === "RED"
  ).length;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { property: { select: { name: true } } },
  });

  const stats = { ready: 0, action_needed: 0, expired: 0, not_started: 0 };
  let nationalTransitionCount = 0;
  let listingComplianceCount = 0;
  let greeceAmaCount = 0;
  let croatiaEvisitorCount = 0;
  let netherlandsRegistrationCount = 0;
  let belgiumRegistrationCount = 0;

  const propertyStatuses = properties.map((p) => {
    const completed = p.checklistItems.filter((c) => c.completed).length;
    const status = getComplianceStatus({
      registrationNumber: p.registration?.registrationNumber,
      status: p.registration?.status,
      expiryDate: p.registration?.expiryDate,
      checklistCompleted: completed,
      checklistTotal: p.checklistItems.length,
    });
    stats[status]++;
    if (needsNationalTransitionAttention(p.country, p.registration)) {
      nationalTransitionCount++;
    }
    if (propertyHasListingComplianceIssue(p.listingChannels)) {
      listingComplianceCount++;
    }
    if (needsGreeceAmaAttention(p.country, p.registration)) {
      greeceAmaCount++;
    }
    if (needsCroatiaEvisitorAttention(p.country, p.registration)) {
      croatiaEvisitorCount++;
    }
    if (needsNlRegistrationAttention(p.country, p.registration)) {
      netherlandsRegistrationCount++;
    }
    if (needsBelgiumRegistrationAttention(p.country, p.registration, p.city)) {
      belgiumRegistrationCount++;
    }
    return { ...p, complianceStatus: status };
  });

  const upcoming = propertyStatuses
    .filter((p) => p.registration?.expiryDate)
    .map((p) => ({
      ...p,
      daysLeft: differenceInDays(p.registration!.expiryDate!, new Date()),
    }))
    .filter((p) => p.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const subscribed = user && hasActiveSubscription(user.subscriptionStatus);

  const onboardingSteps = {
    addProperty: properties.length > 0,
    setResidency: properties.some((p) => Boolean(p.residencyStatus)),
    enableGuestRegister: properties.some((p) => p.guestRegisterToken?.enabled),
  };
  const firstPropertyId = properties[0]?.id ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="app-display text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-slate-600">
            {t("welcome", { name: user?.name || session.user.email || "" })}
          </p>
        </div>
        {subscribed && (
          <Link href={`/${locale}/app/properties/new`}>
            <Button>{t("addProperty")}</Button>
          </Link>
        )}
      </div>

      {!subscribed && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">{t("subscribe.title")}</CardTitle>
            <CardDescription className="text-amber-800">
              {t("subscribe.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/app/settings`}>
              <Button>{t("subscribe.cta")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <OnboardingChecklist
        locale={locale}
        subscribed={Boolean(subscribed)}
        dismissed={Boolean(user?.onboardingDismissedAt)}
        steps={onboardingSteps}
        firstPropertyId={firstPropertyId}
      />

      <SesDueQueue locale={locale} />
      <RegionalDueQueue locale={locale} />
      <AlloggiatiDueQueue locale={locale} />
      <SibaDueQueue locale={locale} />
      <AadeDueQueue locale={locale} />
      <EvisitorDueQueue locale={locale} />
      <NlDueQueue locale={locale} />

      {properties.length === 0 && (
        <EmptyState
          icon={Building2}
          title={t("empty.title")}
          description={subscribed ? t("empty.description") : t("empty.subscribeDescription")}
        >
          {subscribed ? (
            <Link href={`/${locale}/app/properties/new`}>
              <Button>{t("empty.cta")}</Button>
            </Link>
          ) : (
            <Link href={`/${locale}/app/settings`}>
              <Button>{t("subscribe.cta")}</Button>
            </Link>
          )}
        </EmptyState>
      )}

      <PortfolioOverview
        locale={locale}
        stats={{
          total: properties.length,
          ready: stats.ready,
          actionNeeded: stats.action_needed,
          expired: stats.expired,
          notStarted: stats.not_started,
          guestsThisMonth: guestsThisMonth,
          fichesNeeded: fichesNeeded,
          nationalTransition: nationalTransitionCount,
          listingCompliance: listingComplianceCount,
          greeceAma: greeceAmaCount,
          croatiaEvisitor: croatiaEvisitorCount,
          netherlandsRegistration: netherlandsRegistrationCount,
          belgiumRegistration: belgiumRegistrationCount,
          nightCapAttention: nightCapAttentionCount,
          touristTaxAttention: touristTaxAttentionCount,
          listingHealthAtRisk: listingHealthAtRiskCount,
        }}
      />

      {fichesNeeded > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900">
              {t("missingFiches.title", { count: fichesNeeded })}
            </CardTitle>
            <CardDescription className="text-amber-800">
              {t("missingFiches.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mb-4 space-y-2">
              {missingFiches.slice(0, 5).map((item) => (
                <li key={item.stayId} className="text-sm text-amber-900">
                  <Link
                    href={`/${locale}/app/properties/${item.propertyId}?tab=register`}
                    className="font-medium hover:underline"
                  >
                    {item.propertyName}
                  </Link>
                  {" — "}
                  {format(item.checkInDate, "dd MMM yyyy")}
                  {item.guestLabel ? ` (${item.guestLabel})` : ""}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/app/guest-register/print-all`} target="_blank">
                <Button variant="outline" size="sm">{t("missingFiches.exportPdf")}</Button>
              </Link>
              <a href="/api/guest-register/export-csv">
                <Button variant="outline" size="sm">{t("missingFiches.exportCsv")}</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("upcoming")}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">{t("noDeadlines")}</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((p) => (
                  <li key={p.id} className="flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-slate-50/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link href={`/${locale}/app/properties/${p.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                        {p.name}
                      </Link>
                      <p className="text-sm text-slate-500">{p.city}</p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-sm font-medium text-slate-700">
                        {format(p.registration!.expiryDate!, "dd MMM yyyy")}
                      </p>
                      <p className={`text-xs ${p.daysLeft < 0 ? "text-red-600" : p.daysLeft <= 30 ? "text-amber-600" : "text-slate-500"}`}>
                        {p.daysLeft < 0 ? t("expired") : t("daysLeft", { days: p.daysLeft })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("recentAlerts")}</CardTitle>
            <Link href={`/${locale}/app/notifications`} className="text-sm text-emerald-600 hover:underline">
              {t("viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">{t("noAlerts")}</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className={`rounded-lg border p-3 ${n.read ? "border-slate-200/80 bg-white" : "border-emerald-200/80 bg-emerald-50/60"}`}>
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {format(n.createdAt, "dd MMM yyyy HH:mm")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="app-display">{t("overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {propertyStatuses.map((p) => (
                <div key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/${locale}/app/properties/${p.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                      {p.name}
                    </Link>
                    <p className="text-sm text-slate-500">{p.city}, {p.country}</p>
                  </div>
                  <ComplianceBadge status={p.complianceStatus} className="shrink-0 self-start sm:self-center" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
