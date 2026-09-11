export const LISTING_PLATFORMS = ["airbnb", "booking", "vrbo"] as const;
export type ListingPlatform = (typeof LISTING_PLATFORMS)[number];

export type PlatformHelpLink = {
  url: string;
  label: { en: string; fr: string };
  urlVerified: boolean;
};

export const PLATFORM_HELP_LINKS: Record<ListingPlatform, PlatformHelpLink> = {
  airbnb: {
    url: "https://www.airbnb.com/help/article/1383",
    label: {
      en: "Airbnb — registration requirements",
      fr: "Airbnb — exigences d'enregistrement",
    },
    urlVerified: true,
  },
  booking: {
    url: "https://www.booking.com/content/how-to-add-registration-number.html",
    label: {
      en: "Booking.com — add registration number",
      fr: "Booking.com — ajouter le numéro d'enregistrement",
    },
    urlVerified: false,
  },
  vrbo: {
    url: "https://help.vrbo.com/articles/How-do-I-add-my-registration-number",
    label: {
      en: "Vrbo — add registration number",
      fr: "Vrbo — ajouter le numéro d'enregistrement",
    },
    urlVerified: true,
  },
};

export function updateListingsStepKey(city: string): string {
  const cityKey = city.trim().toLowerCase();
  const aliases: Record<string, string> = {
    paris: "paris",
    lyon: "lyon",
    marseille: "marseille",
    bordeaux: "bordeaux",
    nice: "nice",
  };
  const key = aliases[cityKey] ?? "fr";
  return `${key}-update-listings`;
}

export type PlatformProgressItem = {
  platform: ListingPlatform;
  completed: boolean;
  completedAt: string | null;
};

export function getLinkedPlatforms(urls: {
  airbnbUrl?: string | null;
  bookingUrl?: string | null;
  vrboUrl?: string | null;
}): ListingPlatform[] {
  return LISTING_PLATFORMS.filter((platform) => {
    const url = urls[`${platform}Url` as keyof typeof urls];
    return Boolean(url?.trim());
  });
}

export function getPlatformProgressSummary(
  linkedPlatforms: ListingPlatform[],
  progress: PlatformProgressItem[]
): { completed: number; total: number } {
  const progressMap = new Map(progress.map((p) => [p.platform, p.completed]));
  const completed = linkedPlatforms.filter((p) => progressMap.get(p)).length;
  return { completed, total: linkedPlatforms.length };
}

export function allLinkedPlatformsComplete(
  linkedPlatforms: ListingPlatform[],
  progress: PlatformProgressItem[]
): boolean {
  if (linkedPlatforms.length === 0) return false;
  const progressMap = new Map(progress.map((p) => [p.platform, p.completed]));
  return linkedPlatforms.every((p) => progressMap.get(p));
}
