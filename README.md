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
