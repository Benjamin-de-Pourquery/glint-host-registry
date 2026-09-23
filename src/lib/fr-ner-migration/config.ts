/**
 * Configurable NER migration timeline. Update when official dates are published.
 * Do not scatter these dates elsewhere in the codebase.
 */
export const NER_MIGRATION_TIMELINE = {
  /** Expected national teleservice opening (display only). */
  portalOpensLabel: {
    en: "Q4 2026",
    fr: "T4 2026",
  },
  /** ISO date when transition window ends; null until the State publishes it. */
  transitionEndsAt: null as string | null,
  /** Service-Public article for national registration news. */
  servicePublicNewsUrl:
    "https://www.service-public.gouv.fr/particuliers/actualites/A18880",
} as const;
