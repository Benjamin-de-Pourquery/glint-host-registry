export function isIrelandCountry(country: string): boolean {
  const c = country.trim().toLowerCase();
  return (
    c === "ie" ||
    c === "ireland" ||
    c === "éire" ||
    c === "eire" ||
    c === "irlande" ||
    c === "irlanda"
  );
}

export function normalizeIrelandCity(city: string): string {
  const key = city.trim().toLowerCase();
  if (key === "dublin" || key === "baile átha cliath" || key === "baile atha cliath") {
    return "Dublin";
  }
  return city.trim();
}

export function isDublinCity(city: string): boolean {
  return normalizeIrelandCity(city) === "Dublin";
}
