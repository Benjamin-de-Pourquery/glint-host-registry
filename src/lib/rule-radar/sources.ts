import { createHash } from "node:crypto";
import { ALL_PLAYBOOKS } from "@/lib/playbooks";
import { RULE_KEYS, type RuleKey } from "./keys";
import type { RegulatorySource, TriageQueueItem } from "./types";

function hashContent(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

const ROLE_RULE_KEY_HINTS: Record<string, RuleKey[]> = {
  rules: [
    RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT,
    RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES,
    RULE_KEYS.NL_AMSTERDAM_NIGHT_CAP_DEFAULT,
    RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES,
  ],
  tax: [RULE_KEYS.FR_TOURIST_TAX_DEFAULT_CADENCE],
  portal: [RULE_KEYS.FR_GUEST_FICHE_DEADLINE_DAYS],
};

export function collectRegulatorySources(): RegulatorySource[] {
  const seen = new Set<string>();
  const sources: RegulatorySource[] = [];

  for (const playbook of ALL_PLAYBOOKS) {
    for (const step of playbook.steps) {
      for (const official of step.officialUrls) {
        if (seen.has(official.url)) continue;
        seen.add(official.url);

        sources.push({
          url: official.url,
          labelEn: official.label.en,
          labelFr: official.label.fr,
          role: official.role,
          playbookId: playbook.id,
          contentHash: hashContent(official.url),
          lastCheckedAt: null,
        });
      }
    }
  }

  return sources.sort((a, b) => a.url.localeCompare(b.url));
}

export function buildTriageQueue(): TriageQueueItem[] {
  const sources = collectRegulatorySources();

  return sources
    .filter((source) => source.role === "rules" || source.role === "tax")
    .map((source) => ({
      source,
      suggestedRuleKeys: ROLE_RULE_KEY_HINTS[source.role] ?? [],
    }));
}
