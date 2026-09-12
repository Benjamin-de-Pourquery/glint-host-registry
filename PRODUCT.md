# Glint Host Registry — Product Overview

## What it is

**Glint Host Registry** is a B2B SaaS compliance operations tool for short-term rental (STR) hosts in the European Union. It helps hosts and small property managers track registration numbers, local requirements, and renewal deadlines required under **Regulation (EU) 2024/1028**.

## Target audience

- Independent hosts with 1–50 properties across EU cities
- Airbnb, Booking.com, and Vrbo hosts
- Small property management companies

## Core features

### 1. Marketing landing
Professional SaaS landing page with hero, problem/solution narrative tied to EU 2024/1028 and May 2026 applicability, feature grid, pricing (Starter €19 / Pro €49), FAQ, and legal footer links. Fully bilingual FR/EN.

### 2. Authentication
Email/password sign-up and sign-in via Auth.js. Protected app routes with session middleware.

### 3. Dashboard
Portfolio overview with compliance status cards:
- **Ready** — active registration, checklist complete
- **Action needed** — pending items or expiring within 30 days
- **Expired** — past renewal date
- **Not started** — no registration begun

Includes upcoming deadline list and recent in-app alerts.

### 4. Properties CRUD
Add, edit, and archive properties with:
- Name, address, city, country (EU list)
- Property type (apartment, house, studio, room, other)
- Platform listing URLs (Airbnb, Booking, Vrbo)
- Notes
- **Archive / restore** — soft-delete via `archived` flag; archived properties are hidden from the active list and do not count toward plan limits

### 5. Guided compliance (Démarches / Compliance tab)
Data-driven step-by-step guides keyed by country and city walk hosts through local STR registration:

- **Tabbed property detail** — Overview (status badge + next-action teaser), Compliance/Démarches (guided steps), Guest register, Listings, Notes
- **Compliance tab** — hero next-action card, per-field copy chips, compact documents checklist, collapsible local pitfalls, expandable step timeline
- Step progress (mark done / skip) persisted per property
- Full FR guides: Paris, Lyon, Marseille, Bordeaux, Nice + France generic fallback
- Country stubs: Spain, Italy, Netherlands

Guides link to real public government pages where verified; unverified links are labeled for manual confirmation. Glint does not submit forms on behalf of hosts.

**URL maintenance:** run `npm run verify-playbook-urls` before releases (see `src/lib/playbooks/README.md`). Government pages move frequently; `urlVerified: true` must only be set after a live HTTP 200 check.

### 6. Guest register (Registre des voyageurs / fiche de police)
Pro feature helping French hosts collect and retain the legally required individual police form for **foreign** guests in meublés de tourisme:

- **Legal basis:** Service-Public [F33458](https://www.service-public.fr/particuliers/vosdroits/F33458), CESEDA R.814-1, arrêté du 1er octobre 2015 — obligation when renting to guests of non-French nationality; guest signs on arrival; host retains **6 months**; transmit to police/gendarmerie **only on request**
- **Public check-in link** per property (tokenized URL + QR) — bilingual FR/EN form with signature pad
- **Host dashboard** — list records in retention window, view detail, export CSV, print official-style fiche
- **Playbook integration** — guest-register playbook step auto-completes when check-in link is enabled
- **iCal calendar import** — hosts paste Airbnb/Booking/Vrbo (or any HTTPS) export calendar URLs per property; Glint syncs upcoming stays into expected stays for missing-fiche tracking. **Limits:** iCal feeds typically expose dates and a guest label only — not full police-form PII (name, nationality, passport, etc.). Sync creates stay shells; guests still complete the fiche via the public check-in link. Cancelled or removed calendar events are marked without deleting stays that already have guest records.
- French nationals may optionally log for operational convenience; UI labels the legal fiche as targeting foreign guests
- Disclaimer: Glint organizes compliance records; not legal advice; host remains responsible

### 7. Registration & compliance
Per-property compliance tracking:
- Registration number and issuing authority/municipality
- Status (not started, pending, active, expired)
- Issue and expiry/renewal dates
- Editable local requirements checklist (seeded with EU/FR defaults; complements guided compliance steps)
- Notes field

### 8. Alerts
Automatic in-app notifications when registrations approach expiry at 30, 14, and 7 days, plus expired alerts. Notification center with mark-as-read.

### 9. Export / listing readiness
Per-property printable HTML compliance summary with registration number, authority, status, dates, and checklist completion. Copy registration number to clipboard.

### 10. Billing
Stripe Checkout subscriptions:
- **Starter** — up to 3 properties, €19/month
- **Pro** — up to 50 properties, €49/month
- 14-day free trial
- Stripe Customer Portal for billing management
- Property slot gating by plan

### 11. Legal pages
Privacy Policy, Terms of Service, and Legal Notice (Mentions légales) in both FR and EN.

### 12. Settings
Account name, language toggle (FR/EN), billing management, and demo data seed button (loads sample properties in French cities).

## Plans

| Plan | Properties | Price |
|------|-----------|-------|
| Starter | Up to 3 | €19/month |
| Pro | Up to 50 | €49/month |

## Demo flow

1. Sign up at `/en/signup`
2. Go to Settings → "Load demo data" (grants starter access + 3 sample properties)
3. Explore dashboard, property compliance playbooks (Next action), archive/restore, export, and notifications

## Regulatory context

Regulation (EU) 2024/1028 has applied since **20 May 2026**. STR hosts must obtain registration numbers from local authorities; online platforms must verify these numbers before publishing EU listings.

In France, hosts currently register through **municipal procedures** (city téléservices, Cerfa). The national **API Meublés** teleservice (DGE / Démarche Numérique) is **not open yet** — opening is planned for **Q4 2026**. Until then, hosts must keep their municipal number and comply locally. When the national portal opens, existing municipal numbers will need **renewal within a transition window**; after that window, old numbers may become invalid.

Host Registry tracks this **dual-regime period**: municipal registration today, national transition readiness (status, dossier checklist, official DGE links). Glint does **not** register properties on behalf of hosts or submit to mairies/DGE.

## Languages

- Full bilingual UI: English and French
- Default locale detection via URL prefix (`/en`, `/fr`)
- In-app language switcher

## Out of scope

- No real municipality API integrations
- No email sending without SMTP configuration
- No platform API connections (manual data entry)
