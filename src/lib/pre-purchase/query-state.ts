import type { PrePurchaseJourneyInput } from "./types";

export function journeyInputFromSearchParams(
  params: URLSearchParams
): PrePurchaseJourneyInput {
  const countryParam = params.get("country")?.toUpperCase();
  const regionParam = params.get("region")?.toUpperCase();

  return {
    country: countryParam === "ES" ? "ES" : "",
    region:
      regionParam === "CT"
        ? "CT"
        : regionParam === "OTHER" || regionParam === "NA"
          ? "other"
          : "",
    municipality: params.get("municipality") ?? params.get("city") ?? "",
    addressOrListing: params.get("address") ?? params.get("listing") ?? "",
    licenceNumber: params.get("licence") ?? params.get("license") ?? "",
  };
}

export function buildJourneySearchParams(input: PrePurchaseJourneyInput): URLSearchParams {
  const p = new URLSearchParams();
  if (input.country) p.set("country", input.country);
  if (input.region === "CT") p.set("region", "CT");
  if (input.region === "other") p.set("region", "other");
  if (input.municipality) p.set("municipality", input.municipality);
  if (input.addressOrListing) p.set("address", input.addressOrListing);
  if (input.licenceNumber) p.set("licence", input.licenceNumber);
  return p;
}

export function normalizeJourneyInput(input: PrePurchaseJourneyInput): PrePurchaseJourneyInput {
  return {
    country: input.country === "ES" ? "ES" : input.country,
    region: input.region,
    municipality: input.municipality.trim(),
    addressOrListing: input.addressOrListing.trim(),
    licenceNumber: input.licenceNumber.trim(),
  };
}
