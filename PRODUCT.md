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

### 5. Registration & compliance
Per-property compliance tracking:
- Registration number and issuing authority/municipality
- Status (not started, pending, active, expired)
- Issue and expiry/renewal dates
- Editable local requirements checklist (seeded with EU/FR defaults)
- Notes field

### 6. Alerts
Automatic in-app notifications when registrations approach expiry at 30, 14, and 7 days, plus expired alerts. Notification center with mark-as-read.

### 7. Export / listing readiness
Per-property printable HTML compliance summary with registration number, authority, status, dates, and checklist completion. Copy registration number to clipboard.

### 8. Billing
Stripe Checkout subscriptions:
- **Starter** — up to 3 properties, €19/month
- **Pro** — up to 50 properties, €49/month
- 14-day free trial
- Stripe Customer Portal for billing management
- Property slot gating by plan

### 9. Legal pages
Privacy Policy, Terms of Service, and Legal Notice (Mentions légales) in both FR and EN.

### 10. Settings
Account name, language toggle (FR/EN), billing management, and demo data seed button (loads sample properties in French cities).

## Plans

| Plan | Properties | Price |
|------|-----------|-------|
| Starter | Up to 3 | €19/month |
| Pro | Up to 50 | €49/month |

## Demo flow

1. Sign up at `/en/signup`
2. Go to Settings → "Load demo data" (grants starter access + 3 sample properties)
3. Explore dashboard, property compliance, export, and notifications

## Regulatory context

Regulation (EU) 2024/1028 requires STR hosts to obtain registration numbers from local authorities. Online platforms must verify these numbers before publishing EU listings, with full implementation expected by **May 2026**. Host Registry does not register properties on behalf of hosts — it provides the operational tooling to track and maintain compliance.

## Languages

- Full bilingual UI: English and French
- Default locale detection via URL prefix (`/en`, `/fr`)
- In-app language switcher

## Out of scope

- No real municipality API integrations
- No email sending without SMTP configuration
- No platform API connections (manual data entry)
