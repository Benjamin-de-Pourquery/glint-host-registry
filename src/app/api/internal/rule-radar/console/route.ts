import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessRuleRadarConsole } from "@/lib/rule-radar/auth";
import { buildTriageQueue, collectRegulatorySources } from "@/lib/rule-radar/sources";
import { ensureJurisdictionRulesSeeded } from "@/lib/rule-radar/seed";

export async function GET() {
  const session = await auth();
  if (!canAccessRuleRadarConsole(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureJurisdictionRulesSeeded();

  const [rules, changes, triageQueue] = await Promise.all([
    prisma.jurisdictionRule.findMany({
      orderBy: [{ key: "asc" }, { effectiveFrom: "desc" }],
      take: 200,
    }),
    prisma.ruleChange.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        impacts: {
          select: { id: true, propertyId: true, severity: true, seenAt: true },
        },
      },
    }),
    Promise.resolve(buildTriageQueue()),
  ]);

  return NextResponse.json({
    sources: collectRegulatorySources(),
    triageQueue,
    rules: rules.map((rule) => ({
      id: rule.id,
      key: rule.key,
      country: rule.country,
      city: rule.city,
      zone: rule.zone,
      residency: rule.residency,
      valueJson: rule.valueJson,
      effectiveFrom: rule.effectiveFrom.toISOString(),
      effectiveTo: rule.effectiveTo?.toISOString() ?? null,
      sourceUrl: rule.sourceUrl,
      reviewedAt: rule.reviewedAt?.toISOString() ?? null,
    })),
    changes: changes.map((change) => ({
      id: change.id,
      ruleKeysJson: change.ruleKeysJson,
      summaryEn: change.summaryEn,
      summaryFr: change.summaryFr,
      confidence: change.confidence,
      publishedAt: change.publishedAt?.toISOString() ?? null,
      createdAt: change.createdAt.toISOString(),
      impactCount: change.impacts.length,
    })),
  });
}
