import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { parsePortfolioStatusFilter } from "@/lib/compliance";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription, getPropertyLimit } from "@/lib/plans";
import { PropertiesView } from "@/components/properties-view";
import { getNightCapAttentionForUser } from "@/lib/france/night-cap-service";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; status?: string }>;
};

export default async function PropertiesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { tab: tabParam, status: statusParam } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) return null;

  const tab = tabParam === "archived" ? "archived" : "active";
  const statusFilter = tab === "active" ? parsePortfolioStatusFilter(statusParam) : null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const properties = await prisma.property.findMany({
    where: {
      userId: session.user.id,
      archived: tab === "archived",
    },
    include: {
      registration: true,
      checklistItems: true,
      listingChannels: true,
    },
    orderBy: { name: "asc" },
  });

  const activeCount = await prisma.property.count({
    where: { userId: session.user.id, archived: false },
  });

  const subscribed = user ? hasActiveSubscription(user.subscriptionStatus) : false;
  const limit = user ? getPropertyLimit(user.subscriptionPlan) : 0;
  const atLimit = activeCount >= limit;
  const nightCapAttentionIds = new Set(
    (await getNightCapAttentionForUser(session.user.id)).map((item) => item.propertyId)
  );

  return (
    <PropertiesView
      locale={locale}
      tab={tab}
      statusFilter={statusFilter}
      properties={properties}
      subscribed={subscribed}
      atLimit={atLimit}
      plan={user?.subscriptionPlan || ""}
      limit={limit}
      nightCapAttentionIds={Array.from(nightCapAttentionIds)}
    />
  );
}
