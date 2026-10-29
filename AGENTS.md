# AGENTS.md: Glint Host Registry

Repo: github.com/Benjamin-de-Pourquery/glint-host-registry. Prod: https://glint-host-registry.vercel.app

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Radix UI, next-intl (fr/en), Auth.js v5 (Prisma adapter), Prisma 7 + libSQL adapter on Turso, Stripe, nodemailer, jspdf/xlsx exports, Vercel Analytics.

## Commands
- Install: `npm install` (postinstall runs `prisma generate`)
- Dev: `npm run dev` (port 4311)
- Lint: `npm run lint`
- Tests: `npm test` (tsx --test, explicit file list in package.json: add new test files there)
- SES only: `npm run test:ses`
- Build: `npm run build` (runs `prisma generate` then `next build`)
- DB (local): `npm run db:migrate`, `npm run db:push`, `npm run db:studio`
- Playbook links: `npm run verify-playbook-urls`

## Database and deploy
- Vercel builds on merge to main. The build does NOT run migrations against production Turso.
- Post-merge gate (mandatory): run `npx prisma migrate deploy` on production Turso (`DATABASE_URL` + `TURSO_AUTH_TOKEN` on Vercel Production). See [GO_LIVE.md](./GO_LIVE.md) and [README.md](./README.md#deploy-on-vercel). Wait for READY, smoke `/fr` (200) and `/fr/app` (redirect to login), check Vercel runtime errors. Green build is not proof of DB sync.

## Code map
Country/region logic in `src/lib/<country>/` (france, spain, italy, portugal, greece, croatia, netherlands, belgium, austria, germany, ireland), each with `__tests__`. Guides/SEO in `src/lib/seo`. Auth and signup ref in `src/lib/auth`.

## Copy rules (all user-facing text)
- Bilingual FR/EN: every new string ships in both locales (next-intl messages).
- No em dashes or en dashes anywhere in copy. Use commas, colons or parentheses.
- "Glint" is the brand only, never a product feature or a pronoun for the user.
- Only claim features that are live in production. No "coming soon" promises unless approved.
- No legal advice: describe obligations and link official sources; say "check with the authority" rather than "you are compliant".
- Each new city/country slice updates: landing, footer links, guides index, FAQ, sitemap, in both locales.

## Approval gates (Benjamin decides, via the 18:00 digest)
- Merge to main, production deploy, any prod database migration.
- Anything external: posts, emails, LinkedIn/TikTok, outreach.
- Pricing, Stripe products, legal/regulatory claims.
- Agents work on a branch, one task per agent, open a PR, never push to main.
- Never commit secrets; env lives in Vercel and local `.env` from `.env.example` (Cloud Agent boxes: `/workspace/*.env` only).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
