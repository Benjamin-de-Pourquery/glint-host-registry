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
| Turso production DB | Migrations applied; `DATABASE_URL` + `TURSO_AUTH_TOKEN` on Vercel Production |
| Spain SES integration | SOAP credentials UI, validation + **dry-run only** (test endpoint) |
| Landing & pricing copy | Starter **€19/mo** (≤3 properties), Pro **€49/mo** (≤50 properties), 14-day trial |
| Stripe live catalog | Product + prices + webhook created in Stripe **live mode** (IDs below) |
| Stripe (current state) | **Test keys** on Preview **and** Production until morning flip |

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

## Morning flip — Production only (6 steps)

Apply in **Vercel → Project → Settings → Environment Variables → Production**. Leave **Preview** unchanged (test keys).

1. Set `STRIPE_SECRET_KEY` to the staged live secret (`sk_live_…`) — Money Maker applies on Benjamin's go-ahead.
2. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to the staged live publishable key (`pk_live_…`).
3. Set price IDs (copy exactly):
   - `STRIPE_PRICE_STARTER` → `price_1UEgDXFmO19WLWW8U4lFbo6Y`
   - `STRIPE_PRICE_PRO` → `price_1UEgDYFmO19WLWW8exs9fWvU`
4. Set `STRIPE_WEBHOOK_SECRET` to the staged signing secret (`whsec_…`) for webhook `we_1UEgDpFmO19WLWW8OM2hpyd0`.
5. Confirm unchanged:
   - **Preview** env still uses `sk_test_` / `pk_test_` and test Price IDs
   - `SES_LIVE` = `false` on Production
6. **Redeploy Production** (Vercel → Deployments → Redeploy latest).

Customer Portal should already be enabled in Stripe Dashboard → Settings → Billing → Customer portal.

---

## Stays OFF at go-live

| Item | Why |
|------|-----|
| `SES_LIVE=false` | Spain guest reporting stays on the **test/dry-run** endpoint — zero government submissions until a deliberate later flip |
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
6. **iCal cron** — confirm `CRON_SECRET` is set on Production; cron runs daily at 04:00 UTC via `vercel.json` (check Vercel → Cron Jobs tab after deploy).

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
| `SECRETS_ENCRYPTION_KEY` | Random base64 (Spain SES credential encryption) |
| `CRON_SECRET` | Random secret (Vercel sends as `Authorization: Bearer …` on cron invocations) |
| `SES_LIVE` | `false` |

See [.env.example](./.env.example) for full variable documentation.

---

## Benjamin’s 10-second approval

- [ ] Money Maker applied staged `sk_live_` / `pk_live_` / `whsec_` to Production (not in git)
- [ ] `STRIPE_PRICE_STARTER` = `price_1UEgDXFmO19WLWW8U4lFbo6Y`, `STRIPE_PRICE_PRO` = `price_1UEgDYFmO19WLWW8exs9fWvU`
- [ ] Production redeployed; smoke tests #3–#5 passed
- [ ] `SES_LIVE` still `false`; Preview still on test keys

**Approve go-live:** all four checked → live billing is on, Spain stays dry-run, no extra spend beyond a real-card checkout test.
