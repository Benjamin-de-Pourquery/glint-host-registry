import type { RuleImpactFeedItem } from "./service";
import type { PropertyImpactPayload } from "./types";

export function nightCapLimit(
  payload: PropertyImpactPayload | null | undefined
): number | null {
  const limit = payload?.nightCap?.limit;
  return typeof limit === "number" ? limit : null;
}

export function sanitizeRuleImpactFeedItem(
  raw: unknown
): RuleImpactFeedItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<RuleImpactFeedItem>;
  if (
    typeof item.id !== "string" ||
    typeof item.propertyId !== "string" ||
    typeof item.propertyName !== "string"
  ) {
    return null;
  }

  const summaryEn = typeof item.summaryEn === "string" ? item.summaryEn : "";
  const summaryFr = typeof item.summaryFr === "string" ? item.summaryFr : "";
  const severity =
    typeof item.severity === "string" ? item.severity : "none";
  const confidence =
    typeof item.confidence === "string" ? item.confidence : "low";

  return {
    id: item.id,
    ruleChangeId:
      typeof item.ruleChangeId === "string" ? item.ruleChangeId : item.id,
    propertyId: item.propertyId,
    propertyName: item.propertyName,
    summaryEn,
    summaryFr,
    confidence: confidence as RuleImpactFeedItem["confidence"],
    severity: severity as RuleImpactFeedItem["severity"],
    publishedAt:
      typeof item.publishedAt === "string" || item.publishedAt === null
        ? item.publishedAt
        : null,
    seenAt:
      typeof item.seenAt === "string" || item.seenAt === null ? item.seenAt : null,
    before: (item.before ?? {}) as PropertyImpactPayload,
    after: (item.after ?? {}) as PropertyImpactPayload,
  };
}

export function sanitizeRuleImpactFeedItems(raw: unknown): RuleImpactFeedItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((entry) => sanitizeRuleImpactFeedItem(entry))
    .filter((entry): entry is RuleImpactFeedItem => entry !== null);
}
