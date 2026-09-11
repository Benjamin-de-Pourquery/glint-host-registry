import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplianceStatus } from "@/lib/compliance";
import { hasActiveSubscription } from "@/lib/plans";
import { syncExpiryNotifications } from "@/lib/notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComplianceBadge } from "@/components/compliance-badge";
import { Building2, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  await syncExpiryNotifications(session.user.id);

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      registration: true,
      checklistItems: true,
    },
    orderBy: { name: "asc" },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { property: { select: { name: true } } },
  });

  const stats = { ready: 0, action_needed: 0, expired: 0, not_started: 0 };

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
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

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">{t("overview")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Building2} label={t("stats.total")} value={properties.length} />
          <StatCard icon={CheckCircle2} label={t("stats.ready")} value={stats.ready} color="text-emerald-600" />
          <StatCard icon={AlertTriangle} label={t("stats.action")} value={stats.action_needed} color="text-amber-600" />
          <StatCard icon={XCircle} label={t("stats.expired")} value={stats.expired} color="text-red-600" />
          <StatCard icon={Clock} label={t("stats.notStarted")} value={stats.not_started} color="text-slate-500" />
        </div>
      </div>

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
                  <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <Link href={`/${locale}/app/properties/${p.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                        {p.name}
                      </Link>
                      <p className="text-sm text-slate-500">{p.city}</p>
                    </div>
                    <div className="text-right">
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
                  <li key={n.id} className={`rounded-lg border p-3 ${n.read ? "border-slate-100" : "border-emerald-100 bg-emerald-50/50"}`}>
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
            <CardTitle>{t("overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {propertyStatuses.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/${locale}/app/properties/${p.id}`} className="font-medium text-slate-900 hover:text-emerald-600">
                      {p.name}
                    </Link>
                    <p className="text-sm text-slate-500">{p.city}, {p.country}</p>
                  </div>
                  <ComplianceBadge status={p.complianceStatus} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = "text-slate-600",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
