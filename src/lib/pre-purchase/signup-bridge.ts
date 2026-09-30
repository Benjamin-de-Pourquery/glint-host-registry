import type { Locale } from "./locale";
import type { PrePurchaseJourneyInput } from "./types";

/** Query-only bridge after purchase; signup form may ignore unknown params (no DB write). */
export function buildPrePurchaseSignupUrl(
  locale: Locale,
  input: PrePurchaseJourneyInput
): string {
  const params = new URLSearchParams();
  params.set("from", "pre-purchase");
  if (input.country === "ES") params.set("country", "ES");
  if (input.region === "CT") params.set("region", "CT");
  if (input.municipality.trim()) params.set("city", input.municipality.trim());
  if (input.licenceNumber.trim()) params.set("licence", input.licenceNumber.trim());
  const qs = params.toString();
  return `/${locale}/signup${qs ? `?${qs}` : ""}`;
}
