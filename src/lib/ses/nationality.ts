/** Map common nationality strings to ISO 3166-1 alpha-3 for SES. */
const NATIONALITY_ALPHA3: Record<string, string> = {
  spain: "ESP",
  españa: "ESP",
  espana: "ESP",
  spanish: "ESP",
  espagnol: "ESP",
  france: "FRA",
  french: "FRA",
  français: "FRA",
  francais: "FRA",
  germany: "DEU",
  german: "DEU",
  allemagne: "DEU",
  italy: "ITA",
  italian: "ITA",
  italie: "ITA",
  portugal: "PRT",
  portuguese: "PRT",
  uk: "GBR",
  "united kingdom": "GBR",
  british: "GBR",
  usa: "USA",
  "united states": "USA",
  american: "USA",
  netherlands: "NLD",
  belgium: "BEL",
  morocco: "MAR",
  argentina: "ARG",
  brazil: "BRA",
  mexico: "MEX",
  china: "CHN",
  japan: "JPN",
  russia: "RUS",
  switzerland: "CHE",
  austria: "AUT",
  poland: "POL",
  sweden: "SWE",
  norway: "NOR",
  denmark: "DNK",
  ireland: "IRL",
  canada: "CAN",
  australia: "AUS",
};

export function toAlpha3Nationality(
  nationality: string,
  explicitAlpha3?: string | null
): string | null {
  if (explicitAlpha3 && /^[A-Z]{3}$/.test(explicitAlpha3.trim())) {
    return explicitAlpha3.trim().toUpperCase();
  }

  const trimmed = nationality.trim();
  if (/^[A-Z]{3}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const key = trimmed.toLowerCase();
  return NATIONALITY_ALPHA3[key] ?? null;
}
