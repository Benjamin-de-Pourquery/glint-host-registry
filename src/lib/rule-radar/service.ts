import { prisma } from "@/lib/prisma";
import type { RuleConfidence, ImpactSeverity } from "./keys";
import type { PropertyImpactPayload } from "./types";

export type RuleImpactFeedItem = {
  id: string;
  ruleChangeId: string;
  propertyId: string;
  propertyName: string;
  summaryEn: string;
  summaryFr: string;
  confidence: RuleConfidence;
  severity: ImpactSeverity;
  publishedAt: string | null;
  seenAt: string | null;
  before: PropertyImpactPayload;
  after: PropertyImpactPayload;
};

function parseImpactPayload(json: string): PropertyImpactPayload {
  try {
    return JSON.parse(json) as PropertyImpactPayload;
  } catch {
    return {
      nightCap: {
        applies: false,
        limit: null,
        source: null,
        nightsUsed: 0,
        remaining: null,
        status: null,
      },
    };
  }
}

export async function getRuleImpactFeedForUser(
  userId: string,
  options: { unseenOnly?: boolean; propertyId?: string; limit?: number } = {}
): Promise<RuleImpactFeedItem[]> {
  const impacts = await prisma.ruleImpact.findMany({
    where: {
      property: { userId, archived: false },
      ...(options.unseenOnly ? { seenAt: null } : {}),
      ...(options.propertyId ? { propertyId: options.propertyId } : {}),
    },
    include: {
      property: { select: { name: true } },
      ruleChange: true,
    },
    orderBy: [{ ruleChange: { publishedAt: "desc" } }, { createdAt: "desc" }],
    take: options.limit ?? 50,
  });

  return impacts
    .filter((impact) => impact.ruleChange.publishedAt)
    .map((impact) => ({
      id: impact.id,
      ruleChangeId: impact.ruleChangeId,
      propertyId: impact.propertyId,
      propertyName: impact.property.name,
      summaryEn: impact.ruleChange.summaryEn,
      summaryFr: impact.ruleChange.summaryFr,
      confidence: impact.ruleChange.confidence as RuleConfidence,
      severity: impact.severity as ImpactSeverity,
      publishedAt: impact.ruleChange.publishedAt?.toISOString() ?? null,
      seenAt: impact.seenAt?.toISOString() ?? null,
      before: parseImpactPayload(impact.beforeJson),
      after: parseImpactPayload(impact.afterJson),
    }));
}

export async function getUnseenImpactCountForUser(userId: string): Promise<number> {
  return prisma.ruleImpact.count({
    where: {
      seenAt: null,
      property: { userId, archived: false },
      ruleChange: { publishedAt: { not: null } },
    },
  });
}

export async function getUnseenImpactCountForProperty(
  propertyId: string,
  userId: string
): Promise<number> {
  return prisma.ruleImpact.count({
    where: {
      propertyId,
      seenAt: null,
      property: { userId },
      ruleChange: { publishedAt: { not: null } },
    },
  });
}

export async function markRuleImpactSeen(
  impactId: string,
  userId: string
): Promise<boolean> {
  const impact = await prisma.ruleImpact.findFirst({
    where: {
      id: impactId,
      property: { userId },
    },
  });

  if (!impact) return false;

  await prisma.ruleImpact.update({
    where: { id: impactId },
    data: { seenAt: new Date() },
  });

  return true;
}

export async function markAllRuleImpactsSeenForProperty(
  propertyId: string,
  userId: string
): Promise<number> {
  const result = await prisma.ruleImpact.updateMany({
    where: {
      propertyId,
      seenAt: null,
      property: { userId },
    },
    data: { seenAt: new Date() },
  });

  return result.count;
}
