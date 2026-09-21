# Glint Host Registry — Brand

The **site mark** is the source of truth for LinkedIn, social profiles, and all product surfaces.

## Mark

- **Shape:** Rounded square tile with emerald **G** and a small emerald **check badge** (compliance / registry verified).
- **Implementation:** `GlintIconMark` (`src/lib/seo/icon-mark.tsx`) for favicon, Apple touch icon, and Open Graph; `GlintBrandIcon` (`src/components/brand/glint-brand-icon.tsx`) for in-app UI.

## Palette

| Role        | Hex       | Usage                          |
| ----------- | --------- | ------------------------------ |
| Slate dark  | `#0f172a` | Mark background (gradient start) |
| Slate mid   | `#1e293b` | Mark background (gradient end)   |
| Emerald     | `#10b981` | Letter G, check badge            |

Constants: `src/lib/seo/brand-colors.ts`.

## Assets (routes)

| Route               | Size    | Purpose              |
| ------------------- | ------- | -------------------- |
| `/icon`             | 32×32   | Primary favicon (PNG) |
| `/favicon.ico`      | 32×32   | Browser default (rewrites to `/icon`) |
| `/apple-icon`       | 180×180 | Apple touch icon     |
| `/opengraph-image`  | 1200×630| Social / OG preview  |

Do **not** use LinkedIn’s navy/teal key logo — the site mark above is canonical.
