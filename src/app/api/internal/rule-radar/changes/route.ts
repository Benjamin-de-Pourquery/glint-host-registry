import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessRuleRadarConsole } from "@/lib/rule-radar/auth";
import { RULE_CONFIDENCE_LEVELS, RULE_KEYS, type RuleKey } from "@/lib/rule-radar/keys";
import { publishRuleChange } from "@/lib/rule-radar/impact-engine";

const ruleKeyValues = Object.values(RULE_KEYS);

const createSchema = z.object({
  ruleKeys: z.array(z.enum(ruleKeyValues as [string, ...string[]])).min(1),
  summaryEn: z.string().min(1),
  summaryFr: z.string().min(1),
  confidence: z.enum(RULE_CONFIDENCE_LEVELS),
  publish: z.boolean().optional(),
  ruleUpdates: z
    .array(
      z.object({
        key: z.enum(ruleKeyValues as [string, ...string[]]),
        country: z.string().min(1),
        city: z.string().nullable().optional(),
        zone: z.string().nullable().optional(),
        residency: z.string().nullable().optional(),
        value: z.unknown(),
        sourceUrl: z.string().nullable().optional(),
        effectiveFrom: z.string().datetime().optional(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!canAccessRuleRadarConsole(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const change = await prisma.ruleChange.create({
      data: {
        ruleKeysJson: JSON.stringify(data.ruleKeys),
        summaryEn: data.summaryEn,
        summaryFr: data.summaryFr,
        confidence: data.confidence,
      },
    });

    if (!data.publish) {
      return NextResponse.json({ change, published: false });
    }

    const ruleUpdates = (data.ruleUpdates ?? []).map((update) => ({
      ...update,
      key: update.key as RuleKey,
      effectiveFrom: update.effectiveFrom ? new Date(update.effectiveFrom) : undefined,
    }));

    const { impactsCreated } = await publishRuleChange(change.id, ruleUpdates);

    const published = await prisma.ruleChange.findUnique({
      where: { id: change.id },
    });

    return NextResponse.json({
      change: published,
      published: true,
      impactsCreated,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
