import type { EvidencePackHealthScore, EvidencePackLocale } from "./types";

type ListingHealthFactor = {
  code: string;
  severity: string;
  messageKey: string;
};

type ListingHealthResultLike = {
  score: string;
  factors: ListingHealthFactor[];
};

type ListingHealthModule = {
  getLatestListingHealth?: (
    propertyId: string,
    locale?: string
  ) => Promise<ListingHealthResultLike | null>;
  buildListingHealthInput?: (
    propertyId: string,
    locale?: string
  ) => Promise<unknown | null>;
  computeScore?: (input: unknown) => ListingHealthResultLike;
};

function mapListingHealthResult(
  result: ListingHealthResultLike
): EvidencePackHealthScore {
  return {
    score: result.score,
    factors: result.factors.map((factor) => ({
      id: factor.code,
      label: factor.messageKey,
      status: factor.severity,
    })),
  };
}

/**
 * Attempts to load listing health score from the Listing Health module when present.
 * Uses a runtime dynamic import so this PR does not depend on the parallel Listing Health module.
 */
export async function tryLoadListingHealthScore(
  propertyId: string,
  locale: EvidencePackLocale
): Promise<EvidencePackHealthScore | null> {
  try {
    const dynamicImport = new Function(
      "specifier",
      "return import(specifier)"
    ) as (specifier: string) => Promise<ListingHealthModule>;

    const mod = await dynamicImport("@/lib/listing-health");

    if (typeof mod.getLatestListingHealth === "function") {
      const snapshot = await mod.getLatestListingHealth(propertyId, locale);
      if (snapshot) {
        return mapListingHealthResult(snapshot);
      }
    }

    if (
      typeof mod.buildListingHealthInput === "function" &&
      typeof mod.computeScore === "function"
    ) {
      const input = await mod.buildListingHealthInput(propertyId, locale);
      if (input) {
        return mapListingHealthResult(mod.computeScore(input));
      }
    }
  } catch {
    // Listing Health module not available: omit section gracefully.
  }
  return null;
}
