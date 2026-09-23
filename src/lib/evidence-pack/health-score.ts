import type { ListingChannelRecord } from "@/lib/listings/channels";
import type { EvidencePackHealthScore } from "./types";

type HealthScoreModule = {
  computeListingHealthScore?: (input: {
    propertyId: string;
    channels: ListingChannelRecord[];
  }) => {
    score: number;
    factors?: Array<{ id?: string; label?: string; status?: string }>;
  } | null;
};

/**
 * Attempts to load listing health score from the Listing Health module when present.
 * Uses a runtime dynamic import so this PR does not depend on the parallel Listing Health module.
 */
export async function tryLoadListingHealthScore(
  propertyId: string,
  channels: ListingChannelRecord[]
): Promise<EvidencePackHealthScore | null> {
  try {
    const dynamicImport = new Function(
      "specifier",
      "return import(specifier)"
    ) as (specifier: string) => Promise<HealthScoreModule>;

    const mod = await dynamicImport("@/lib/listings/health-score");
    if (typeof mod.computeListingHealthScore === "function") {
      const result = mod.computeListingHealthScore({ propertyId, channels });
      if (result && typeof result.score === "number") {
        return {
          score: result.score,
          factors: Array.isArray(result.factors)
            ? result.factors.map((f) => ({
                id: f.id ?? "unknown",
                label: f.label ?? f.id ?? "Factor",
                status: f.status ?? "unknown",
              }))
            : [],
        };
      }
    }
  } catch {
    // Listing Health module not available — omit section gracefully.
  }
  return null;
}
