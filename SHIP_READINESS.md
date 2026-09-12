# Glint Host Registry — Ship Readiness Audit

**Audit date:** 2026-09-12 (rebased on `main` incl. PRs #18 iCal sync, #19 Google Calendar)  
**Branch:** `cursor/ship-readiness-audit-7a74`  
**Build:** `npm run build` ✅ passes  
**Playbook URLs:** `npm run verify-playbook-urls` ✅ all `urlVerified: true` links return HTTP 200  

---

## Final verdict: **READY WITH CAVEATS**

The app is shippable for a **Stripe test-mode / soft-launch** with the security fixes in this PR. It is **not** ready for production billing go-live until Stripe live keys and webhooks are configured.

### Explicit caveats before go-live

| Caveat | Impact |
|--------|--------|
| **Stripe is test mode** | Swap to live keys, live Price IDs, and production webhook endpoint before charging real customers. |
| **`CRON_SECRET` must be set on Vercel** | `/api/cron/sync-calendars` returns 503 without it; scheduled iCal sync will not run until secret + Vercel Cron job are configured. |
| **Spain (SES) playbooks are stubs** | `international.ts` has high-level Spain links; no deep SES city tunnels like FR Tier A cities. |
| **Demo seed disabled in production** | Settings “Load demo data” hidden; API returns 403 without subscription (intended). |
| **Vercel Hobby cold starts** | First request after idle may be slow; Turso + serverless Prisma add latency. |
| **Middleware is cookie-presence only** | Real session validation happens in `src/app/[locale]/app/layout.tsx` via `auth()`. API routes also call `auth()` per request. |

---

## Fixes applied in this PR

| Severity | Issue | Fix |
|----------|-------|-----|
| **CRITICAL** | Stored XSS via unvalidated `signatureDataUrl` in print HTML (`src/lib/guest-register/fiche-html.ts`) | Validate PNG/JPEG/WebP base64 data URLs (max 500 KB) on submit; escape before HTML attribute injection |
| **HIGH** | Demo seed granted free active subscription (`src/app/api/demo/seed/route.ts`) | Block in `NODE_ENV === "production"`; hide demo UI in production settings |
| **HIGH** | Open redirect via `callbackUrl` on login (`src/components/login-form.tsx`) | `sanitizeCallbackUrl()` — locale-prefixed relative paths only |
| **HIGH** | No security headers (`next.config.ts`) | Global CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **HIGH** | Check-in endpoint abuse / storage DoS (`src/app/api/check-in/[token]/route.ts`) | Property-level rate limit (20 submissions/hour); signature validation rejects oversized/malicious payloads |
| **MEDIUM** | Guest register tokens never expired (`src/app/api/properties/[id]/guest-register/route.ts`) | Set `expiresAt` to +365 days on create/enable/rotate |
| **MEDIUM** | Re-enable restored leaked token | `enable` action now rotates token (same as `rotate`) |
| **LOW** | `stripeCustomerId` exposed in settings API | Removed from GET response; billing portal button shown when subscription active |
| **LOW** | Session cookie flags implicit | Explicit `httpOnly`, `sameSite: "lax"`, `secure` in production (`src/lib/auth.ts`) |
| **LOW** | Check-in token in Referer | `referrer: "no-referrer"` on check-in page metadata |

---

## Security audit

### Auth & session protection

| Area | Status | Notes |
|------|--------|-------|
| `/app/*` pages | ✅ | Middleware redirects without session cookie; `src/app/[locale]/app/layout.tsx` calls `auth()` and redirects if null |
| `/export/[id]` | ✅ | Same middleware + `auth()` + `userId` filter in page |
| Mutating API routes | ✅ | All property/calendar routes call `auth()` + owner scoping |
| Middleware JWT validation | ⚠️ MEDIUM | Cookie presence only — Prisma-backed Auth.js cannot run in Edge middleware without splitting config |

### IDOR (owner checks)

Verified `userId: session.user.id` (or equivalent join) on:

- `src/app/api/properties/[id]/route.ts`
- `src/app/api/properties/[id]/guest-register/route.ts`
- `src/app/api/properties/[id]/guest-register/[recordId]/route.ts`
- `src/app/api/properties/[id]/guest-stays/route.ts`
- `src/app/api/properties/[id]/guest-register/export/route.ts`
- `src/app/api/guest-register/export-csv/route.ts`
- `src/app/api/properties/[id]/playbook/route.ts`
- `src/app/api/properties/[id]/registration/route.ts`
- `src/app/api/properties/[id]/checklist/route.ts`
- `src/app/api/properties/[id]/listings-platforms/route.ts`
- **`src/app/api/properties/[id]/calendar-feeds/route.ts`** — GET/POST/PATCH/DELETE via `getOwnedProperty` or `property: { userId }` join |
- **`src/app/api/properties/[id]/calendar-feeds/sync/route.ts`** — property `userId` + feed scoped to `propertyId` |
- `src/app/[locale]/export/[id]/page.tsx`
- Print pages under `guest-register/*/print`

**Public exception (by design):** `POST/GET /api/check-in/[token]` — scoped by high-entropy token, not user session.

### Public guest check-in token

| Control | Status | File |
|---------|--------|------|
| Entropy (256-bit) | ✅ | `src/lib/guest-register/index.ts` — `randomBytes(32).base64url` |
| Expiry | ✅ (after fix) | `expiresAt` set on create/enable/rotate; checked in API + page |
| Rate limit | ✅ (partial) | 20 submissions/property/hour via `src/lib/security/rate-limit.ts` |
| Invalid token PII leak | ✅ | Returns generic `{ error: "Invalid or disabled link" }` — no property metadata |
| Valid token metadata | ⚠️ LOW | GET returns `propertyName` + `propertyCity` (needed for form UX; mitigated by token entropy) |
| Signature XSS | ✅ (after fix) | `src/lib/security/signature-data-url.ts` |

### SSRF — iCal / calendar fetch

Implemented in `src/lib/calendar/ssrf-safe-fetch.ts` (PR #18). Used on feed create (`validateCalendarFeedUrl`) and every sync fetch (`fetchCalendarFeedText`).

| Control | Status | Notes |
|---------|--------|-------|
| HTTPS only | ✅ | Rejects `http:` URLs |
| Private/reserved IPs | ✅ | Blocks RFC1918, loopback, link-local, metadata hostnames |
| DNS resolution check | ✅ | `lookup(hostname, { all: true })` — all A/AAAA must be public before fetch |
| Timeout | ✅ | 10 s abort |
| Response size cap | ✅ | 2 MB streamed read |
| Redirect validation | ⚠️ MEDIUM | `redirect: "follow"` — hop targets are **not** re-validated after DNS check (classic open-redirect SSRF) |
| DNS rebinding / TOCTOU | ⚠️ LOW | DNS checked once before fetch; residual race window |

### Cron routes

| Control | Status | File |
|---------|--------|------|
| Route exists | ✅ | `POST /api/cron/sync-calendars` |
| `CRON_SECRET` gating | ✅ | Returns 503 if unset; 401 on mismatch |
| Auth header | ✅ | `Authorization: Bearer <secret>` or `x-cron-secret` |
| Vercel Cron schedule | ⚠️ MEDIUM | No `vercel.json` in repo — must configure cron + secret in Vercel dashboard |

### Calendar / iCal product surface (main)

| Component | Path |
|-----------|------|
| SSRF-safe fetch | `src/lib/calendar/ssrf-safe-fetch.ts` |
| iCal parser | `src/lib/calendar/ical-parser.ts` |
| Sync engine | `src/lib/calendar/sync.ts` |
| Source labels (Airbnb, Booking, Vrbo, **Google**) | `src/lib/calendar/source-labels.ts` |
| `CalendarFeed` model | `prisma/schema.prisma` |
| Feed CRUD API | `src/app/api/properties/[id]/calendar-feeds/route.ts` |
| Manual sync API | `src/app/api/properties/[id]/calendar-feeds/sync/route.ts` |
| Scheduled sync | `src/app/api/cron/sync-calendars/route.ts` |
| Register tab UI | `src/components/guest-register-panel.tsx` |

### Secrets exposure

| Location | Status |
|----------|--------|
| Client bundles | ✅ Only `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| README / FAQ / landing | ✅ Placeholder env names only; no real keys |
| `.env.example` | ✅ Includes `CRON_SECRET`, Turso token comment |
| Git history | ✅ No `sk_live` / real secrets found in tracked files |

### XSS & CSRF

| Vector | Status |
|--------|--------|
| Guest text fields in React UI | ✅ Auto-escaped JSX |
| Guest text in `fiche-html.ts` | ✅ `escapeHtml()` on all text fields |
| Signature in print HTML | ✅ Fixed — validate + escape |
| iCal `SUMMARY` → `guestLabel` | ✅ Rendered as React text (`guest-register-panel.tsx`); no HTML injection |
| QR SVG `dangerouslySetInnerHTML` | ✅ LOW — generated from app URL via `qrcode` lib |
| CSRF on cookie APIs | ⚠️ MEDIUM — relies on `SameSite=Lax`; no CSRF tokens |

### Headers & cookies

| Header | Status |
|--------|--------|
| `Content-Security-Policy` | ✅ `next.config.ts` |
| `X-Frame-Options` | ✅ DENY |
| `X-Content-Type-Options` | ✅ nosniff |
| `Referrer-Policy` | ✅ strict-origin-when-cross-origin (global); no-referrer on check-in |
| `Strict-Transport-Security` | ⚠️ LOW — defer to Vercel automatic HTTPS |
| Session cookie flags | ✅ Explicit httpOnly / sameSite / secure |

### File uploads

**Not implemented.** Signatures are base64 data URLs in JSON (now validated).

---

## Functional / product audit

### Critical flows

| Flow | Status | Notes |
|------|--------|-------|
| Signup / login | ✅ | `src/app/api/auth/register/route.ts`, Auth.js credentials |
| Add property | ✅ | Gated by `hasActiveSubscription` + plan limit |
| Archive / restore | ✅ | `PATCH` with `archived` flag |
| Playbook next-action | ✅ | `src/lib/playbooks/index.ts`, `src/components/playbook-panel.tsx` |
| Guest register: enable → public fiche → export | ✅ | Token, check-in form, CSV, print |
| **iCal add / manual sync** | ✅ | Register tab → calendar feed CRUD + sync API |
| **Scheduled iCal sync (cron)** | ✅ (needs deploy config) | `POST /api/cron/sync-calendars` + `CRON_SECRET` on Vercel |
| **Google Calendar source** | ✅ | Auto-detected from `calendar.google.com` URLs (`source-labels.ts`) |
| Stripe checkout (test) | ✅ | 14-day trial; webhook updates subscription |
| Billing gates | ✅ | Property create requires active/trialing subscription |

### Playbook official links (spot-check)

`npm run verify-playbook-urls` results:

- **Paris** — `paris.fr`, `meubles-tourisme.paris.fr`, change-of-use portal: **200**
- **Lyon** — declaration + change-of-use: **200**
- **France generic** — Service-Public, impots.gouv.fr: **200** (API Meublés portal times out from CI — marked `urlVerified: false`)

### Mobile / empty states

| Area | Status |
|------|--------|
| App shell / sidebar | ✅ `src/components/app-shell.tsx`, sheet on mobile |
| Empty states | ✅ `src/components/empty-state.tsx` used on properties |
| Property tabs | ✅ Sticky tab bar on mobile |

### i18n

| Check | Status |
|-------|--------|
| EN/FR key parity | ✅ 556 keys each, 0 missing |
| New security strings | N/A — API errors are English generic messages |

### Build

```
npm run build  →  ✅ success (Next.js 16.3.4, TypeScript clean)
```

---

## Shipping polish

| Check | Status | Notes |
|-------|--------|-------|
| No “test Stripe” on landing | ✅ | README documents test mode for developers only |
| No env var names on landing | ✅ | FAQ/landing are user-facing copy |
| No TODO / Cursor traces | ✅ | Grep clean |
| FAQ accuracy vs features | ✅ | Matches implemented scope |
| `.env.example` complete | ✅ | Turso + `CRON_SECRET` documented |
| API error handling (user-visible) | ✅ | Toasts on settings/billing; check-in form shows submit error |

---

## Open findings (not fixed — recommended)

### MEDIUM

| ID | Finding | File(s) | Recommended fix |
|----|---------|---------|-----------------|
| M1 | Middleware does not validate JWT | `src/middleware.ts` | Split edge-safe `auth.config.ts` per Auth.js v5 docs |
| M2 | No login/register rate limiting | `src/lib/auth.ts`, `src/app/api/auth/register/route.ts` | Vercel Firewall or Upstash rate limit |
| M3 | User enumeration on register | `src/app/api/auth/register/route.ts` | Generic “If account exists, check email” message |
| M4 | Billing success page does not verify `session_id` | `src/app/[locale]/app/billing/success/page.tsx` | Optional Stripe session retrieve for UX |
| M5 | Check-in rate limit is property-scoped only | `src/lib/security/rate-limit.ts` | Add IP-based limit table or edge rate limiting |
| M6 | iCal fetch follows redirects without re-validation | `src/lib/calendar/ssrf-safe-fetch.ts` | Manual redirect loop with per-hop URL + DNS check |
| M7 | No `vercel.json` cron schedule in repo | deploy config | Add cron schedule doc or `vercel.json` for `/api/cron/sync-calendars` |
| M8 | npm audit: 4 high vulns | `package-lock.json` | Run `npm audit` and patch non-breaking updates |

### LOW

| ID | Finding | File(s) | Recommended fix |
|----|---------|---------|-----------------|
| L1 | Password policy: 8 chars only | `src/app/api/auth/register/route.ts` | Add complexity or zxcvbn |
| L2 | No email verification | Auth flow | Optional verify-email before trial |
| L3 | Honeypot easily bypassed | `src/app/api/check-in/[token]/route.ts` | Rate limit + CAPTCHA after abuse |
| L4 | `Strict-Transport-Security` not set in app | `next.config.ts` | Add in production or rely on Vercel |
| L5 | Spain playbook depth | `src/lib/playbooks/international.ts` | Expand SES guidance before ES marketing |
| L6 | Middleware deprecation warning | Next.js 16 | Migrate to `proxy` convention when stable |
| L7 | iCal `SUMMARY` length uncapped in sync | `src/lib/calendar/sync.ts` | Truncate to 200 chars (matches manual stay form) |
| L8 | DNS rebinding window on calendar fetch | `src/lib/calendar/ssrf-safe-fetch.ts` | Pin resolved IP for fetch or use dedicated egress proxy |

---

## Pre-deploy checklist (Vercel)

1. Set all vars from `.env.example` (Turso `DATABASE_URL` + `TURSO_AUTH_TOKEN` in production).
2. Run `npx prisma migrate deploy` against production DB.
3. Set `AUTH_SECRET` (32+ byte random).
4. Set `NEXT_PUBLIC_APP_URL` to production domain.
5. Configure Stripe **test** webhook → `/api/stripe/webhook`; switch to live keys at go-live.
6. Enable Stripe Customer Portal in Dashboard.
7. **Set `CRON_SECRET`** and add Vercel Cron job → `POST /api/cron/sync-calendars` with `Authorization: Bearer <secret>`.
8. Run `npm run verify-playbook-urls` before each release.

---

## Audit methodology

- Full read of `src/middleware.ts`, `src/lib/auth.ts`, all `src/app/api/**` routes
- Calendar stack: `src/lib/calendar/*`, calendar-feeds APIs, cron route
- Grep for secrets, TODO, iCal, cron, SSRF patterns
- `npm run build` and `npm run verify-playbook-urls`
- i18n key diff (EN vs FR)
- Spot-check Paris/Lyon/generic FR playbook URLs via verification script
