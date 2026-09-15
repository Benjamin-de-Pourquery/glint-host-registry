# Glint Host Registry — Go-Live Checklist

**Production URL:** https://glint-host-registry.vercel.app  
**Audience:** Benjamin — approve in ~10 seconds after Money Maker applies staged secrets.

---

## Already done (no action tomorrow)

| Area | Status |
|------|--------|
| Security audit | XSS/signature validation, CSP headers, open-redirect fix, demo seed blocked in production — see [SHIP_READINESS.md](./SHIP_READINESS.md) |
| Auth & billing gates | Signup/login, 14-day trial checkout, subscription gates on property create |
| FR compliance playbooks | Paris, Lyon, Marseille, Bordeaux, Nice — verified official links |
| Guest register | Public check-in link, signature, 6-month retention, CSV/print export |
| iCal calendar sync | SSRF-safe fetch, manual sync in app, daily cron via `vercel.json` (`/api/cron/sync-calendars`) |
| SES due queue + cron | 48h prep window, overdue tracking, in-app notifications via `/api/cron/ses-due` (daily 08:00 UTC) |
| Mossos / Ertzaintza ops | Regional due queue, Annex I check-in, fitxa/CSV export, manual status — no live API push |
| Turso production DB | Migrations applied; `DATABASE_URL` + `TURSO_AUTH_TOKEN` on Vercel Production |
| Spain SES integration | SOAP credentials UI, validation + **dry-run only** (test endpoint) |
| Landing & pricing copy | Starter **€19/mo** (≤3 properties), Pro **€49/mo** (≤50 properties), 14-day trial |
| Stripe live catalog | Product + prices + webhook created in Stripe **live mode** (IDs below) |
| Stripe (current state) | **Live keys on Production** (flipped at go-live); Preview stays on test keys |

---

## Live Stripe catalog (safe to reference — no secrets)

Created in Stripe live mode. Price IDs are public identifiers; **never commit** `sk_live_`, `pk_live_`, or `whsec_` to git.

| Resource | ID |
|----------|-----|
| Product | `prod_VFAYxblULxh9Nl` |
| Starter €19/mo | `price_1UEgDXFmO19WLWW8U4lFbo6Y` |
| Pro €49/mo | `price_1UEgDYFmO19WLWW8exs9fWvU` |
| Webhook endpoint | `we_1UEgDpFmO19WLWW8OM2hpyd0` → `https://glint-host-registry.vercel.app/api/stripe/webhook` |

Webhook events configured: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

**Secrets (offline only):** Money Maker has staged `sk_live_…`, `pk_live_…`, and `whsec_…` offline. Benjamin validates the flip; secrets are pasted into Vercel Production at go-live — not stored in this repo.

---

## Stripe flip — Production (completed)

Stripe live keys are active on **Production**. Preview remains on test keys.

If re-flipping or verifying:

1. `STRIPE_SECRET_KEY` = live secret (`sk_live_…`)
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = live publishable key (`pk_live_…`)
3. `STRIPE_PRICE_STARTER` → `price_1UEgDXFmO19WLWW8U4lFbo6Y`
4. `STRIPE_PRICE_PRO` → `price_1UEgDYFmO19WLWW8exs9fWvU`
5. `STRIPE_WEBHOOK_SECRET` for webhook `we_1UEgDpFmO19WLWW8OM2hpyd0`
6. Confirm `SES_LIVE` = `false` on Production
7. Redeploy Production after any env change

Customer Portal should already be enabled in Stripe Dashboard → Settings → Billing → Customer portal.

---

## Stays OFF at go-live

| Item | Why |
|------|-----|
| `SES_LIVE=false` | Spain SES guest reporting stays on the **test/dry-run** endpoint — zero MIR submissions until a deliberate later flip |
| Mossos/Ertzaintza API | No automated push — Glint prepares exports; host submits on official portal (same honesty model as FR fiche de police) |
| Custom paid domain | Optional later; default `*.vercel.app` URL is fine |
| Preview env Stripe keys | Keep `sk_test_` / `pk_test_` on Preview for safe QA |

---

## Morning smoke test (~2 min)

After Production redeploy with live Stripe:

1. **Landing** — https://glint-host-registry.vercel.app shows €19 / €49 pricing, no test-card hints.
2. **Signup** — create a fresh account (or use a throwaway email).
3. **Checkout** — Settings → subscribe to Starter; complete Stripe Checkout with a **real card** (live mode charges real money — use a low-limit card or cancel immediately after test).
   - *Note:* Test card `4242…` only works in test mode; it will **fail** once live keys are active — that confirms live mode is on.
4. **Webhook** — subscription status shows `trialing` or `active` in Settings within ~30 s (webhook `we_1UEgDpFmO19WLWW8OM2hpyd0`).
5. **Property** — add one property (billing gate should pass).
6. **Cron jobs** — confirm `CRON_SECRET` is set on Production:
   - iCal sync: daily at 04:00 UTC (`/api/cron/sync-calendars`)
   - SES due notifications: daily at 08:00 UTC (`/api/cron/ses-due`)
   - Check Vercel → Cron Jobs tab after deploy
7. **Spain SES** — add a Madrid property, enable check-in link, confirm Annex I fields appear; due queue shows prep/overdue statuses; dry-run validate works; `SES_LIVE` remains `false`.
8. **Catalonia / Basque** — add a Barcelona or Bilbao property; confirm Mossos/Ertzaintza panel, Annex I check-in, regional due queue, CSV/fitxa export, and manual status buttons. Verify Mossos portal URL loads (HTTP 200).

Optional: Billing portal opens from Settings → Manage billing.

---

## Rollback (instant)

If anything looks wrong:

1. Vercel → Production env → revert Stripe vars to test values:
   - `STRIPE_SECRET_KEY` → `sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_test_...`
   - `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` → test Price IDs
   - `STRIPE_WEBHOOK_SECRET` → test webhook secret
2. Redeploy Production.
3. Existing live subscriptions may need manual review in Stripe Dashboard — no automatic downgrade in app.

---

## Production env reference (non-Stripe)

These should already be set; verify once:

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_APP_URL` | `https://glint-host-registry.vercel.app` |
| `AUTH_SECRET` | Random 32+ bytes |
| `DATABASE_URL` | Turso libsql URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `SECRETS_ENCRYPTION_KEY` | **Required** — random base64 for Spain SES credential encryption (`openssl rand -base64 32`) |
| `CRON_SECRET` | **Required** — random secret for iCal + SES cron routes (Vercel sends as `Authorization: Bearer …`) |
| `SES_LIVE` | `false` — dry-run only; flip deliberately when ready for live MIR SOAP |

See [.env.example](./.env.example) for full variable documentation.

### Turso migration (regional guest reporting)

After deploying this slice, run on Production Turso:

```bash
npx prisma migrate deploy
```

Migration: `20260915010000_regional_guest_reporting` — adds `RegionalGuestReport` table for Mossos/Ertzaintza manual submission tracking. Build does not auto-migrate Turso.

---

## Benjamin’s 10-second approval

- [ ] Money Maker applied staged `sk_live_` / `pk_live_` / `whsec_` to Production (not in git)
- [ ] `STRIPE_PRICE_STARTER` = `price_1UEgDXFmO19WLWW8U4lFbo6Y`, `STRIPE_PRICE_PRO` = `price_1UEgDYFmO19WLWW8exs9fWvU`
- [ ] Production redeployed; smoke tests #3–#5 passed
- [ ] `SES_LIVE` still `false`; Preview still on test keys

**Approve go-live:** all four checked → live billing is on, Spain stays dry-run, no extra spend beyond a real-card checkout test.
