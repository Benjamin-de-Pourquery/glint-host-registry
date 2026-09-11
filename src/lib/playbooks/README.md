# Compliance playbooks

Playbooks live in `france.ts` (city-specific FR guides + generic fallback) and `international.ts` (country stubs).

## Official URL policy

Every `officialUrls` entry must point to a public government or municipal page. Each URL has a `role`:

| Role | Use for |
|------|---------|
| `rules` | Regulation pages, legal requirements |
| `form` | Online declaration / registration forms |
| `portal` | Host portals (taxe de séjour, téléservices) |
| `tax` | Tax authority pages |
| `info` | Owner guides, procedure overviews |

Set `urlVerified: true` only when a live HTTP check returns **200** (or a stable redirect chain ending in 200). If the link is plausible but blocked, moved, or uncertain, keep the best known URL and set `urlVerified: false`.

### Precision checklist (required before merge)

1. **Registration steps must link to forms/portals, not rules pages.** If a city has a dedicated declaration form (e.g. `meubles-tourisme.paris.fr`), the registration step CTA must use `role: "form"` or `"portal"` — never reuse the paris.fr rules page as the register CTA.
2. **Rules steps use `role: "rules"`** on informational/regulation pages only.
3. **Branch non-primary tunnels** with `appliesWhen: "nonPrimary"` for change-of-use steps; `appliesWhen: "primaryResidence"` for primary-only declaration steps when tunnels diverge.
4. **Document `sourceReviewedAt`** on city playbooks (ISO date of last content review against official sources).
5. **Enrich Paris (and key cities) with `documentsDetailed`** explaining why each document is needed (e.g. taxe d'habitation identifiant du local).
6. Run `npm run verify-playbook-urls` — all `urlVerified: true` links must return HTTP 200.

## Residency branching

Properties have an optional `residencyStatus` field (`primary` | `secondary` | `other`). The next-action engine filters steps by `appliesWhen`:

- `always` — shown for all properties
- `primaryResidence` — only when `residencyStatus === "primary"`
- `secondaryResidence` — only when `residencyStatus === "secondary"`
- `nonPrimary` — when `residencyStatus` is `secondary` or `other`

When `residencyStatus` is unset, all steps are shown (host should select residency in the playbook panel).

## Re-checking URLs

Government sites move pages often. Before a release — or quarterly — run:

```bash
npm run verify-playbook-urls
```

The script fetches every unique playbook URL and fails if any `urlVerified: true` link does not return HTTP 200.

### Manual checklist

1. Run `npm run verify-playbook-urls`.
2. For each `WARN unverified but HTTP 200` line, consider flipping `urlVerified` to `true`.
3. For each `FAIL verified but not HTTP 200` line, find a replacement on the official site, update the playbook, and re-run.
4. Spot-check city demos (Settings → Load demo data → open Paris property → set residency → verify CTA links).
5. Commit playbook changes only after the script passes.

### Paris demo re-test

1. Settings → Load demo data
2. Open **Le Marais Studio** (Paris)
3. Set **Residency status** → Primary residence
4. Next action should be "Check Paris STR rules" with CTA **Read official regulations** → `paris.fr/meubles-touristiques`
5. After marking rules done, next action should be "Declare your furnished tourist rental" with CTA **Open official form** → `meubles-tourisme.paris.fr` (NOT the rules page)
6. Switch to **Secondary residence** — change-of-use step should appear before declaration

See also **Playbook URL maintenance** in `PRODUCT.md`.
