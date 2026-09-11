# Glint Host Registry

Professional compliance operations SaaS for EU short-term rental hosts under Regulation (EU) 2024/1028.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Prisma 7** + SQLite (local/demo) — Postgres/Turso-ready
- **Auth.js (NextAuth v5)** — email/password credentials
- **next-intl** — bilingual FR/EN UI
- **Stripe** — subscription billing (test mode)

## Quick start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env — at minimum set AUTH_SECRET (openssl rand -base64 32)

# Run database migrations
npm run db:migrate

# Start dev server
npm run dev
```

Open [http://localhost:4311](http://localhost:4311)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite path (`file:./dev.db`) or Turso/libsql URL |
| `AUTH_SECRET` | Yes | Auth.js session secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL for Stripe redirects |
| `STRIPE_SECRET_KEY` | For billing | Stripe secret key (test: `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For billing | Stripe publishable key |
| `STRIPE_PRICE_STARTER` | For billing | Price ID for Starter plan (€19/mo) |
| `STRIPE_PRICE_PRO` | For billing | Price ID for Pro plan (€49/mo) |
| `STRIPE_WEBHOOK_SECRET` | For billing | Webhook signing secret |

## Stripe setup (test mode)

1. Create a [Stripe account](https://dashboard.stripe.com/register) (test mode).
2. Create two **Products** with recurring monthly prices in EUR:
   - **Starter** — €19/month (up to 3 properties)
   - **Pro** — €49/month (up to 50 properties)
3. Copy each **Price ID** (`price_...`) to `STRIPE_PRICE_STARTER` and `STRIPE_PRICE_PRO`.
4. Copy API keys from Developers → API keys.
5. For local webhook testing:
   ```bash
   stripe listen --forward-to localhost:4311/api/stripe/webhook
   ```
   Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
6. Enable **Customer Portal** in Stripe Dashboard → Settings → Billing → Customer portal.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 4311 |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Deploy on Vercel

1. Push to GitHub and import in Vercel.
2. Set all env vars from `.env.example`.
3. For production database, use [Turso](https://turso.tech) or Vercel Postgres:
   - Turso: `DATABASE_URL="libsql://your-db.turso.io"` + `TURSO_AUTH_TOKEN`
   - Run migrations: `npx prisma migrate deploy`
4. Configure Stripe webhook endpoint: `https://your-domain.com/api/stripe/webhook`
5. Set `NEXT_PUBLIC_APP_URL` to your production URL.

## Project structure

```
src/
  app/
    [locale]/           # i18n routes (en, fr)
      page.tsx          # Marketing landing
      login/ signup/    # Auth pages
      app/              # Protected dashboard
      legal/            # Privacy, Terms, Mentions
      export/[id]/      # Printable compliance summary
    api/                # API routes
  components/           # UI components
  lib/                  # Auth, Prisma, Stripe, compliance logic
  i18n/                 # next-intl config
messages/               # en.json, fr.json
prisma/                 # Schema + migrations
```

See [PRODUCT.md](./PRODUCT.md) for product documentation.
