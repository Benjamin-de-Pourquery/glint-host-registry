# Compliance playbooks

Playbooks live in `france.ts` (city-specific FR guides + generic fallback) and `international.ts` (country stubs).

## Official URL policy

Every `officialUrls` entry must point to a public government or municipal page. Set `urlVerified: true` only when a live HTTP check returns **200** (or a stable redirect chain ending in 200). If the link is plausible but blocked, moved, or uncertain, keep the best known URL and set `urlVerified: false` with labels that tell hosts to confirm on the official site.

Prefer **registration portals** (téléservices, taxe de séjour portals) over generic homepages when the step is municipal registration.

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
4. Spot-check city demos (Settings → Load demo data → open Lyon/Paris property playbook links in a browser).
5. Commit playbook changes only after the script passes.

See also **Playbook URL maintenance** in `PRODUCT.md`.
