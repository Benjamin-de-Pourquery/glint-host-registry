import { addMonths } from "date-fns";
import { randomBytes } from "crypto";

export type AccompanyingChild = {
  firstNames: string;
  dateOfBirth: string;
};

const FRENCH_NATIONALITY_PATTERNS = [
  /^france$/i,
  /^french$/i,
  /^français/i,
  /^francaise$/i,
  /^française$/i,
  /^fr\b/i,
];

export function generateGuestRegisterToken(): string {
  return randomBytes(32).toString("base64url");
}

export function isFrenchNationality(nationality: string): boolean {
  const normalized = nationality.trim();
  return FRENCH_NATIONALITY_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function computeRetentionExpiresAt(submittedAt: Date): Date {
  return addMonths(submittedAt, 6);
}

export function parseAccompanyingChildren(json: string | null | undefined): AccompanyingChild[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as AccompanyingChild[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guestRegisterStepKey(city: string): string {
  const cityKey = city.trim().toLowerCase();
  const aliases: Record<string, string> = {
    paris: "paris",
    lyon: "lyon",
    marseille: "marseille",
    bordeaux: "bordeaux",
    nice: "nice",
  };
  const key = aliases[cityKey] ?? "fr";
  return `${key}-guest-register`;
}
