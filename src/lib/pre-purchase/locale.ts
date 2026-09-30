export type Locale = "en" | "fr";

export function pickLocale(value: string): Locale {
  return value === "fr" ? "fr" : "en";
}
