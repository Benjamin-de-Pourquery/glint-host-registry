# Host Registry: out-of-box value bets (Opus 5.5)

**Type:** Product strategy memo (docs only)
**Date:** 2026-09-23
**Baseline:** `main` at `ab6f996`
**Scope:** What Host Registry should build after the three in-flight MVPs:
[Listing Health #44](https://github.com/Benjamin-de-Pourquery/glint-host-registry/pull/44),
[NER Migration Cockpit #46](https://github.com/Benjamin-de-Pourquery/glint-host-registry/pull/46),
[Compliance Evidence Pack #45](https://github.com/Benjamin-de-Pourquery/glint-host-registry/pull/45).
**Framing:** Operational compliance aid. Nothing in this memo is legal or tax advice, and product copy derived from it must keep that framing.

---

## 0. Ground truth: what ships, and which assumptions I discarded

### What ships on `main`

- **8 countries with ops layers.** FR (city playbooks for Paris, Lyon, Marseille, Bordeaux, Nice, Lille, Toulouse, Nantes, Strasbourg plus generic; police guest form; L324-1-1 night cap; taxe de séjour period queue; dual-regime national transition). ES (SES with SOAP dry-run, Mossos and Ertzaintza routing, Annex I check-in). IT (CIN plus Alloggiati with SOAP dry-run). PT (RNAL plus SIBA with working-day deadlines). GR (AMA plus AADE short-stay declaration). HR (categorisation plus eVisitor). NL (national registration, Amsterdam permit, per-stay notification, 30/15 night cap by wijk). BE (Brussels, Flanders, Wallonia dossiers).
- **Shared spine.** Playbooks as TypeScript data (about 5,800 lines, with `sourceReviewedAt` and `urlVerified`), a next-action engine, iCal import (Airbnb, Booking, Vrbo, Google) into `GuestStay`, one guest-reporting router (`getGuestReportingJurisdiction`), `RegionalGuestReport` for manual-submit systems, `ListingChannel` with displayed number and `BLOCKED` status, a platform-block appeal playbook, in-app notifications, two daily crons.
- **Commercial.** Starter €19 (3 units), Pro €49 (50 units), Stripe live.

### Assumptions discarded after reading the code and the market

1. **"There is no listing source of truth."** `ListingChannel` already stores per-channel URL, `registrationNumberDisplayed`, `displayStatus` (`MISSING` / `PRESENT` / `UNKNOWN` / `BLOCKED`) and `blockReason`. Listing Health is a scoring layer on top of it, not a new source of truth.
2. **"Nobody sells cross-listing monitoring."** Conforme now advertises hourly OTA parity checks, a free "paste a listing URL" registry check, owner/admin/viewer roles, email-forwarding intake and a hash-chained audit trail, with FR and IT in its Phase 2. Monitoring plus audit trail is parity, not differentiation.
3. **"Filing automation can be our wedge."** Chekin (200,000+ properties, 50+ PMS and channel integrations, OCR plus biometric checks, automatic police and statistics filing, tourist tax collection), Trippz (nine countries, tourist tax end to end) and GuestAdmin (SES machine-to-machine) already own it. Host Registry's "collect, validate, queue, export" layer should stay a supporting act.
4. **"Alerts reach the host."** All alerts are in-app only. Notification titles are hardcoded English strings in `src/lib/notifications.ts`. There is no transactional email and no file upload in the stack. Several bets below depend on adding both.
5. **"Guest data retention is handled."** `retentionExpiresAt` hides expired guest records from views and exports, but nothing ever deletes them. This is a GDPR liability to fix before selling to agencies.
6. **"Night caps are data-driven."** The 90-night commune list is a hardcoded three-city set (`paris`, `lyon`, `nice`) in `src/lib/france/night-cap.ts`. Every commune that lowered its cap since 2025 needs a code deploy to be reflected.
7. **"Multi-seat is a small add."** The model is single-user: 193 `userId` references across 68 files, no organization, membership or role. Multi-seat is an invasive refactor.

---

## 1. Executive take

Host Registry should stop being "the best checklist for EU registration" and become **the host's compliance ledger: it sees what the authorities see, and acts on it before they do.**

The 2026 shift is not "you need a number". It is that the state now receives a continuous data feed about every listing:

- **EU 2024/1028, Art. 9.** Platforms transmit monthly, per unit, *activity data* (defined in Art. 3 as nights rented, guests per night and each guest's country of residence) with the registration number, address and URL, to a national single digital entry point. Small and micro platforms (under 4,250 listings) report at each quarter end.
- **France, API Meublés.** Per-NER day counts from all intermediaries, final version for communes in H2 2026. L324-2-1 provides that the commune is informed when a primary residence goes past its cap.
- **Spain.** The Supreme Court annulled the national registry (STS 620/2026) but kept the Ventanilla Única Digital and the platforms' monthly activity-data duty (Orden VAU/653/2025 sets the model).
- **DAC7.** Platforms report per-listing days rented and quarterly consideration to tax authorities, and send hosts their overview each January.
- **Greece.** AADE can compare AMA, platform data and Short-Term Stay Declarations.

Enforcement is moving from "an inspector knocks" to "a data mismatch triggers a letter". Every tool in the category sits on the **filing** side of that feed (send the guest report on time). Nobody gives the host the **reconciliation** side: what will the authority see about me, does it match what I declared, and am I about to cross a line?

Host Registry is the only product in the set that already holds, per unit and across 8 countries, the four ingredients of that reconciliation: the stay calendar from every channel, the guest reports per system, the declared number per channel, and the rule parameters (caps, deadlines). The next moves should:

1. turn those ingredients into a **reconciliation ledger** (Authority Mirror);
2. add an **enforcement layer that changes availability**, not just alerts (Cap Guard);
3. open a **multi-actor workspace** for the intermediaries French law now makes co-liable (Intermediary Duty Workspace);
4. make the **rules themselves versioned data**, so the product scales without a deploy per rule change (Rule Radar);
5. move **upstream of the first booking** with a feasibility check that converts into onboarding.

**Positioning (FR):** *Voyez ce que l'administration voit sur vos logements, avant elle.*
**Positioning (EN):** *See what the authorities see about your listings, before they do.*

---

## 2. Top 5 ranked bets

| # | Bet (EN) | Label FR | Primary buyer | Why it wins | Size | Market window |
|---|----------|----------|---------------|-------------|------|---------------|
| 1 | Authority Mirror | Miroir des données plateformes | Multi-channel hosts (FR, ES, IT, GR, PT first) | No competitor reconciles platform-reported data against host declarations | M/L | DAC7 statements, January 2027 |
| 2 | Cap Guard | Garde-fou plafond multi-plateformes | FR primary residences, Amsterdam | Only self-serve tool that enforces caps across channels | S/M | 2027 booking season opens in Q4 2026 |
| 3 | Intermediary Duty Workspace | Espace conciergerie : diligence Le Meur | Conciergeries, co-hosts, agencies | Owner attestations and a duty log, not just seats | L | NER migration, Q4 2026 to Q1 2027 |
| 4 | Rule Radar | Radar réglementaire par logement | All hosts, especially multi-country | Per-unit impact of each rule change | M/L | Peak rule churn 2026 to 2027 |
| 5 | Pre-listing Feasibility Check | Test de faisabilité avant location | Buyers, relocating hosts, operator sales teams | Multi-country rules engine that converts into a configured property | M | After Rule Radar core |

Size legend: **S** reuses existing engines with one new module; **M** adds a new domain module and UI surface; **L** touches the data model broadly or needs new infrastructure. MVPs below are scoped to fit the requested 2 to 4 week window.

---

### Bet 1. Authority Mirror

**Label FR:** Miroir des données plateformes (rapprochement des déclarations)
**One-liner:** Rebuild, per unit and per month, what platforms report to the state, and reconcile it against what the host declared.

**Problem (host pain)**

- A host with one Paris flat on Airbnb and Booking faces three authority-facing counts each year: the per-NER day count platforms send to API Meublés, the taxe de séjour nights they declared (Host Registry already pushes them to declare even €0 or platform-collected months), and the DAC7 days and consideration the tax office receives. Nobody compares them until a commune or tax office does.
- Typical mismatch causes: a cancelled booking still counted by one channel; two listings for the same unit ("room" and "entire place"); an old municipal number still on Booking, so its nights land on a different key; off-platform stays; co-host payouts reported under another person; guest counts in police reports that differ from the platform's guest count.
- For ES, IT, PT, HR and GR hosts, the authority receives nights, guests per night and guest country of residence from platforms, and separately receives the host's guest reports. Those two datasets are built to be crossed.

**Market gap**

- Filing tools (Chekin, Trippz, GuestAdmin, EazyAL) submit each stay. None produces a period-level reconciliation against platform reporting.
- Accounting tools (Tallybreeze class) reconcile payouts to ledgers, not compliance counts. PMS DAC7 modules (Booking Experts class) serve the reporting *platform*, not the host.
- Conforme monitors number parity on listings. It does not rebuild activity data.

**Why Host Registry is uniquely positioned**

- The Art. 3 definition of activity data maps almost one to one onto data Host Registry already stores: `GuestStay` (nights, channel via `source`), `GuestRecord` (guests, `nationality`, `addressCountryAlpha3`), `SesSubmission` and `RegionalGuestReport.system` (what was filed, where, when), `TouristTaxPeriod.nightsInPeriod` (what was declared), the night-cap computation, and `ListingChannel.registrationNumberDisplayed` (which key each platform uses).
- It is cross-country by construction. A PT-only or FR-only tool cannot offer the same ledger.

**MVP (2 to 4 weeks)**

1. **Importers, no platform API.** Airbnb reservations/transactions CSV, Booking.com reservations export (CSV or XLSX), and a generic CSV with a column-mapping screen. Rows land in `PlatformReservation`.
2. **Matching.** `PlatformReservation` to `GuestStay` by property, channel and dates (one-day tolerance). Orphans on either side become findings.
3. **Authority-side ledger** per unit per month: expected reported nights and guests by channel and registration key, compared with declared tourist-tax nights, filed guest reports per system, the night-cap counter, and the displayed number per channel.
4. **DAC7 panel.** Manual entry of the annual overview per listing (days rented, consideration per quarter) compared with imported reservations. No PDF parsing in v1.
5. **Findings with a fix path** into existing flows: `UNDECLARED_NIGHTS`, `GUEST_REPORT_MISSING`, `GUEST_COUNT_MISMATCH`, `CAP_EXCEEDED_CROSS_CHANNEL`, `WRONG_KEY_ON_CHANNEL`, `ORPHAN_PLATFORM_RESERVATION`, `DAC7_DAYS_MISMATCH`. Each finding also becomes a Listing Health factor and an Evidence Pack annex ("reconciliation statement for period X").
6. **Explanations for legitimate differences** (gross vs net of commission, cancellation policies, period boundaries), FR and EN.

Out of MVP: platform APIs, OCR of DAC7 PDFs, any tax computation, automatic corrections.

```text
PlatformReservation { id, propertyId, channel, externalRef, listingRef?, checkIn, checkOut,
                      nights, guests?, status, grossAmountCents?, importId, matchedStayId? }
ReconciliationFinding { id, propertyId, periodStart, periodEnd, code, severity,
                        expected, observed, sourceRefs: Json, resolvedAt? }
// Pure module: reconcile(input) -> findings[]  (same style as computeNightCapStatus)
```

**Why now**

- Art. 9 data sharing has applied since 20 May 2026; the national entry points are receiving data now.
- API Meublés final version for communes lands in H2 2026, with cap-breach information to communes.
- DAC7 overviews for calendar 2026 reach hosts by the end of January 2027: a dated campaign ("check your DAC7 before your tax office does").

**Risks**

| Risk | Mitigation |
|------|------------|
| CSV formats drift | Tolerant parsers, mapping screen, fixtures per channel |
| Read as a tax product | Counts first, amounts optional and hidden by default, no tax computation, copy says "rapprochement opérationnel" |
| False alarms | Every finding lists common benign causes; severities "to check" vs "likely issue" |
| Sensitive data mix | Minimal retained columns, amounts encrypted at rest using the existing `SECRETS_ENCRYPTION_KEY` pattern |

**Effort:** M/L. Three new tables, two parsers, one pure reconciliation module, one property tab. Needs the file-upload enabler. No external API dependency.

**Success signals:** share of multi-channel units with at least one import; findings resolved within 14 days; trial conversion during the January campaign.

---

### Bet 2. Cap Guard

**Label FR:** Garde-fou plafond multi-plateformes
**One-liner:** Turn the night-cap counter into availability. Host Registry publishes a calendar feed that platforms import, and closes dates before the cap is crossed on any channel.

**Problem (host pain)**

- FR primary residences: 120 nights per calendar year, 90 where the commune voted it (Paris since 2025). Exceeding the cap carries a civil fine of up to €15,000 (L324-1-1 V). Amsterdam: 30 nights, 15 in eight wijken since 1 April 2026 (as encoded in the NL engine).
- Platforms enforce limits on their own bookings only (Airbnb documents automatic per-city limits). A host on Airbnb plus Booking can look compliant on each platform and be over the legal cap in total. API Meublés keys day counts by NER across intermediaries, so the commune sees the total. The host is the only party who never sees it in time.
- Host Registry today warns at 70%, 90% and exceeded, in-app only. A warning is not a control: the booking that breaks the cap usually arrives on the channel the host was not watching.

**Market gap**

- Channel managers (Smoobu, Lodgify, Beds24 class) sync availability but have no legal rules engine.
- Filing tools never touch availability.
- Some French conciergeries sell "consolidated count plus calendar adjustment" as a managed service on commission. No self-serve SaaS does it for the host who manages alone.

**Why Host Registry is uniquely positioned**

- It already imports every channel's iCal into one deduplicated `GuestStay` table and already computes caps for FR (120, 90, custom) and Amsterdam (15 or 30 by wijk). The outbound feed is the missing half of a loop the product already owns.
- iCal import is native on Airbnb (refresh every 3 hours), Booking.com (every 2 hours) and Vrbo (about 30 minutes). No partnership or API approval needed.
- The loop can be verified: the platforms' own export feeds, which Host Registry already reads, show closed dates, so the product can confirm the guard propagated.

**MVP (2 to 3 weeks)**

1. **Tokenized outbound feed** per property, `GET /api/ical/guard/{token}.ics`, emitting "Closed by Host Registry" events. Token entropy, expiry and rotation reuse the guest-register token pattern.
2. **Policy engine** (pure, tested):
   - *Hard stop*: remaining nights at or below zero closes every unbooked date to 31 December.
   - *Buffer*: close when remaining nights fall under a buffer (default: typical stay length times number of channels, editable) to absorb the 2 to 3 hour import latency.
   - *Budget mode*: the host allocates remaining nights to chosen windows ("keep 12 nights for July"); every other unbooked date is closed.
   - *Registration gate* (opt-in): close dates after a known expiry (`Registration.expiryDate`, `nlHolidayPermitExpiry`).
3. **Setup wizard** per platform (where to paste the feed) with a propagation check on the next sync.
4. **Forecast widget**: used, booked ahead, remaining, projected cap date at current pace.
5. **Guard history** as events, rendered in the Evidence Pack ("cap guard active since").

Out of MVP: channel-manager APIs, per-channel quotas, pricing.

```text
CapGuardPolicy { id, propertyId, enabled, mode: HARD_STOP|BUFFER|BUDGET, bufferNights,
                 budgetWindows: Json, registrationGate: boolean, feedTokenHash, updatedAt }
// Pure module: computeGuardBlocks(stays, capComputation, policy, today) -> DateRange[]
```

**Why now:** Paris at 90 since 2025; Amsterdam 15-night wijken since April 2026; the €15,000 ceiling applies; API Meublés cap information to communes in H2 2026; 2027 bookings open in Q4 2026.

**Risks**

| Risk | Mitigation |
|------|------------|
| Two bookings inside the import window still cross the cap | Buffer policy, instant alert when a booking lands past the buffer, copy says "réduit fortement le risque", never "garantit" |
| Booking.com native iCal is unavailable when a connectivity provider is used | Detect, then guide the host to import the feed in their channel manager |
| Revenue lost to over-closing | Budget mode and one-click release |
| Night-count semantics | Already implemented and tested in `night-cap.ts` (check-in inclusive, check-out exclusive, calendar-year split) |

**Effort:** S/M. One table, one route, one pure policy module, one wizard. Highest value per engineering day in this memo.

**Success signals:** share of capped units with an active guard; zero cap breaches among guarded units; retention of FR primary-residence cohort.

---

### Bet 3. Intermediary Duty Workspace

**Label FR:** Espace conciergerie : diligence Le Meur
**One-liner:** A multi-owner workspace where an operator can prove, unit by unit, that it informed the owner, collected the sworn statement, verified the number, tracked the cap and pulled irregular listings.

**Problem (operator pain)**

- Since Loi Le Meur (19 November 2024), French intermediaries (conciergeries, co-hosts, agencies) must inform the owner of declaration and change-of-use obligations, collect a sworn statement, verify and display the registration number, track nights and alert on the cap, and remove irregular listings. French law firms report civil fines of up to €12,500 per unit for information or verification failures, up to €50,000 per unit or listing for data or removal failures, and up to €100,000 per unit for assisting an illegal change of use (L324-2-1 Code du tourisme, L651-2-1 CCH). The operator has to be able to show the documents.
- The facts that decide liability sit with the owner (is it really a primary residence, is there a change-of-use authorization, does the copropriété allow it, does the tenant have landlord consent). The operational work sits with the operator. Today this lives in Drive folders and WhatsApp threads.
- Buildings add owner-side duties: Art. 9-2 of the 1965 copropriété law requires informing the syndic when a lot is declared as a meublé de tourisme, and copropriétés can now ban non-primary tourist rentals by a two-thirds majority. In Spain, new tourist flats need prior approval from three fifths of owners and shares since 3 April 2025.

**Market gap**

- PMS owner portals (Hostaway, Guesty, Smoobu class) show revenue statements, not duties.
- Conforme has account roles for one operator, PT and ES first. It does not model the owner as a separate actor with attestations.
- Chekin and Trippz serve the stay, not the owner relationship.
- Nobody productizes the French intermediary duty file.

**Why Host Registry is uniquely positioned**

- The per-property model already carries the facts the duty asks about: `residencyStatus`, registration numbers per regime, FR change-of-use steps in city playbooks, the night-cap engine, per-channel displayed number and `BLOCKED` state. What is missing is *who attested what, and when*, and the owner as a separate actor.
- Pricing headroom: Pro is €49 for 50 units, under €1 per unit. An operator carrying five-figure exposure per unit will pay per unit for a defensible file.

**MVP (3 to 4 weeks, after enablers)**

1. **Tenancy.** `Organization`, `Membership` (roles `admin`, `operator`, `field`, `owner`), properties owned by an organization. Migration wraps each current user in a personal organization; a scoped data-access helper replaces direct `userId` filters.
2. **Owner portal by magic link** (no password): the owner sees their units, receives the obligations notice generated from the unit's playbook (timestamped proof of information), signs the sworn statement (residency status, change-of-use authorization if non-primary, copropriété allows, landlord consent if tenant), uploads proofs. Annual re-attestation.
3. **Duty log** per unit: informed, attested, number verified, displayed per channel, cap alert sent to owner, listing withdrawn. Immutable events, rendered by the Evidence Pack.
4. **Building card**: FR syndic information (Art. 9-2) prefilled with the number, with sent-on date and proof; ES three-fifths approval record (acta date, result). Stored as data driving next actions, not as a template kit.
5. **Field role**: check-in agents and cleaners see only guest-register tasks for assigned units, which makes 24-hour filing deadlines executable by the person on site.
6. **Agency plan** priced per unit.

Out of MVP: qualified e-signature, owner payouts, owner revenue statements.

```text
Organization { id, name, plan }
Membership { id, organizationId, userId?, email, role: ADMIN|OPERATOR|FIELD|OWNER, propertyIds?: Json }
OwnerAttestation { id, propertyId, ownerMembershipId, kind, payload: Json, documentHash,
                   signedAt, ip, expiresAt }
DutyEvent { id, propertyId, actorMembershipId, code, payload: Json, createdAt }
```

**Why now:** Le Meur duties are in force. The national NER migration (téléservice opening Q4 2026) forces every conciergerie to re-collect owner data for every unit anyway; that is the moment to move the collection into Host Registry. It rides directly on the NER cockpit (#46).

**Risks**

| Risk | Mitigation |
|------|------------|
| Invasive refactor (193 `userId` sites) | One pass behind a data-access layer, IDOR tests on every owner-scoped route listed in `SHIP_READINESS.md` |
| Signature weight | Simple electronic signature with timestamp, IP and document hash as operational evidence; never claim qualified eIDAS |
| File storage and GDPR | Blob storage, retention policy and a DPA before selling to agencies |
| B2B sales motion | Five to ten conciergeries in Paris, Nice and the Alps as design partners |

**Effort:** L. The biggest refactor in this memo and the biggest ARPU lever.

**Success signals:** units under management per paying operator; share of units with a current owner attestation; operator churn.

---

### Bet 4. Rule Radar

**Label FR:** Radar réglementaire par logement
**One-liner:** Rules become versioned data with effective dates. Every change produces a per-unit impact diff ("remaining nights 40 to 10 from 1 January") delivered only to the hosts it touches.

**Problem (host pain)**

- Rules move faster than hosts read: Paris 120 to 90 (2025); Amsterdam 15 nights in eight wijken (April 2026); Spain's national registry annulled while the data one-stop shop stays (May to June 2026); Spain's three-fifths co-owner approval (April 2025); France's national NER (Q4 2026); Croatia's listing numbers expected around January 2027; France's DPE thresholds for meublés de tourisme (E, then D from 2034); Barcelona licences reported to expire in November 2028.
- A multi-unit or multi-country host cannot map a headline to "which of my units, what changes, by when, what do I do".

**Market gap**

- Competitors publish blogs and newsletters or silently update a filing connector. None computes a per-unit impact diff from a rule change.

**Why Host Registry is uniquely positioned**

- The knowledge is already structured: about 5,800 lines of country and city playbooks with `sourceReviewedAt` and `urlVerified`, engines parameterized by rule values (cap source, declaration cadence, deadline calculators), and `npm run verify-playbook-urls`, which already HTTP-checks every verified official source.
- The rules are still hardcoded (the 90-night commune list is three cities in code). Rule Radar fixes an internal scaling problem and sells the fix as a feature.

**MVP (3 weeks)**

1. `JurisdictionRule` (key, selector on country, city, zone and residency, value, `effectiveFrom`, `effectiveTo`, `sourceUrl`, `reviewedAt`) and `RuleChange` (FR and EN summary, affected keys, confidence: official, announced or reported).
2. Migrate the first parameters: FR cap limits and commune list, Amsterdam wijk caps, tourist-tax cadences, guest-report deadlines.
3. Impact engine: rerun night-cap, tourist-tax and next-action with before and after values per unit; persist `RuleImpact`.
4. Customer surfaces: "Changes affecting you" feed, per-unit banner, email digest (needs the email enabler).
5. Internal regulatory console: scheduled fetch of all official URLs, content-hash diff, triage queue where Glint staff author a `RuleChange`. An LLM may draft summaries for human review; it never publishes.

```text
JurisdictionRule { id, key, country, city?, zone?, residency?, value: Json,
                   effectiveFrom, effectiveTo?, sourceUrl, reviewedAt }
RuleChange { id, ruleKeys: Json, summaryEn, summaryFr, confidence, publishedAt }
RuleImpact { id, ruleChangeId, propertyId, before: Json, after: Json, severity, seenAt? }
```

**Why now:** 2026 to 2027 is peak churn, and every further country (Ireland, Austria, Germany requests will come) multiplies hardcoded rules.

**Risks**

| Risk | Mitigation |
|------|------------|
| Editorial load | Start with parameters that engines already consume (FR, NL, ES) |
| A wrong rule means wrong guidance | Every change shows source, date and confidence; copy stays "aide opérationnelle" |
| Drift into a legal database | Only store parameters the engines consume |

**Effort:** M/L. Mostly backend tooling and a refactor of constants; low UI risk.

**Success signals:** median time from official change to customer impact notice; share of rule parameters moved out of code; open rate of impact notices.

---

### Bet 5. Pre-listing Feasibility Check

**Label FR:** Test de faisabilité avant location
**One-liner:** Before a host lists or buys, enter an address and intended use; get the regime, cap, building constraints, obligations, timeline and blockers, then convert the result into a configured property.

**Problem (host pain)**

- The costliest compliance mistakes happen before the first booking: buying a secondary residence in a change-of-use city, buying in Barcelona where no new licences are issued, buying into a Spanish building without the three-fifths approval, buying a French lot whose copropriété can ban tourist rental by a two-thirds vote, or a DPE below the applicable threshold.
- Relocating hosts and operator sales teams face the same question daily: can this unit be onboarded, and what will it take?

**Market gap**

- PisoCheck covers Spanish buildings (regional tourist-flat registries plus Catastro), Barcelona has an address lookup, Conforme checks an existing listing URL. Lawyers and blogs cover the rest.
- No multi-country tool derives feasibility from the same rules engine that then runs the unit.

**Why Host Registry is uniquely positioned**

- Playbooks in 8 countries already encode regime, steps, documents, residency branches and official links, and engines already know caps and deadlines. The check is a read-only projection of that engine, and its output is a property draft with the right playbook preselected. That is activation, not just lead generation.
- Operators (Bet 3) use it to qualify new owners.

**MVP (2 to 3 weeks, after Rule Radar core)**

1. Input: address (geocoded to city; Amsterdam wijk via the existing selection), intended use (primary, secondary, whole year), building type (copropriété or propiedad horizontal), expected nights.
2. Output: regime and number type; cap and projected legal nights; building constraints (FR Art. 9-2 information duty and two-thirds ban risk, ES three-fifths prior approval); change-of-use flag; FR energy threshold flag; guest-reporting and tax obligations; blockers ("no new licences in this city"); steps with typical duration; confidence and sources on every line.
3. "Create this property" converts the result into a draft with playbook and fields prefilled.
4. Basic result free with an account; saved detailed report included in paid plans.

**Why now:** since 2024/1028, "may this unit be listed" is a gate the platforms enforce; buyers and relocators ask it before committing, not after.

**Risks**

| Risk | Mitigation |
|------|------------|
| Read as a legal opinion | Strict copy, sources per line, "à vérifier auprès de la commune" |
| Geodata depth | City level first; zones only where already modeled (Amsterdam) |
| Slides into SEO content | Built as an authenticated product surface, not a landing page |

**Effort:** M. Maintainability depends on Rule Radar.

**Success signals:** checks that convert into a property; operator usage in sales; paid plan attach rate among feasibility users.

---

## 3. Three "wild but serious" bets

### W1. Platform Duty Kit (B2B for small and regional platforms)

**Label FR:** Kit conformité plateformes 2024/1028

- **Pain.** 2024/1028 applies to every online short-term rental platform, not only Airbnb and Booking: collect the host's declaration and number, display it, "make reasonable efforts to randomly check on a regular basis" declarations and numbers (Art. 7), and transmit activity data to each member state's entry point (monthly, or at quarter end by machine-to-machine or manual means for small and micro platforms under 4,250 listings). Regional holiday-rental portals, tourism-office marketplaces and niche OTAs have little engineering capacity for this.
- **Gap.** Large platforms built it in-house. Guest-filing vendors serve hosts. No vendor sells "2024/1028 compliance as an API" to the long tail across countries.
- **Why Host Registry.** It already models per-country registration regimes, number types and statuses (NER, CIN, RNAL, AMA, NL registration, BE regions, HR categorisation) and the host side of activity data (nights, guests, residence country). It knows both sides of the file.
- **Product.** Number format and plausibility validation per jurisdiction; registry lookups where official public sources allow; random-check scheduler with audit log; activity-data aggregation and export per entry point (Spain's VUD model under Orden VAU/653/2025 first, France's API Meublés format once harmonized); a white-labeled "complete your registration" flow for the platform's hosts, which is Host Registry itself.
- **Flywheel.** Every host on a partner platform is a Host Registry lead, and Authority Mirror gains platform-side ground truth.
- **Risks.** Entry-point formats differ and change; enterprise sales cycles; strict neutrality (no host data flows to a platform without consent).
- **Effort.** XL. Start with a Spain VUD quarterly export plus a validation API for two or three design-partner platforms.

### W2. Glint Inside (compliance engine for PMS and channel managers)

**Label FR:** Glint intégré (moteur de conformité pour PMS)

- **Pain.** PMS and channel-manager customers ask "is this unit compliant and what is due", and vendors answer with blog posts. Each vendor would otherwise build eight country rulebooks.
- **Gap.** Chekin sells an SDK for check-in and ID. Nobody sells an obligations, registration and cap engine as an embeddable service.
- **Why Host Registry.** Next action, playbooks, Cap Guard, Listing Health and Rule Radar events are per-unit functions over data every PMS already has (address, residency, stays, channels).
- **Product.** REST API plus webhooks (`obligations.resolve`, `nextAction.get`, `capGuard.status`, `ruleChange.affected`), an embeddable widget, revenue share per active unit.
- **Risks.** Partner dependency and less roadmap control; API stability commitments; needs tenancy (Bet 3) and Rule Radar (Bet 4) first.
- **Effort.** L, after Bets 3 and 4.

### W3. Transaction Due-Diligence API

**Label FR:** Due diligence location courte durée (notaires, agents, prêteurs)

- **Pain.** Buyers, notaries, estate agents and mortgage brokers need a dated, sourced answer on short-term rental feasibility for a specific lot (regime, cap, change of use, copropriété rules, energy threshold, licence scarcity) at offer time. Today it is a lawyer memo or nothing.
- **Gap.** PisoCheck covers Spanish buildings and some cities offer lookups; nobody sells a multi-country, dated report into the transaction chain.
- **Why Host Registry.** Bet 5 plus Rule Radar give a versioned, sourced rules engine; a dated report is its natural export.
- **Product.** Per-report pricing and an API for property portals and agent networks; a portal badge ("location courte durée : conditions") backed by the report.
- **Risks.** Liability framing (a sourced rule lookup, not a legal opinion; optional professional reviewer); per-city data depth; partner-led distribution.
- **Effort.** L, only after Bet 5 proves demand.

---

## 4. Anti-recommendations (what not to build, and why)

1. **Do not race Chekin and Trippz on filing breadth, OCR, biometrics or collecting tourist tax from guests.** They have the installed base, the PMS integrations and the de visu flows. Keep "collect, validate, queue, export", and flip live submission only where SOAP already exists (SES, Alloggiati) and paying users ask for it.
2. **Do not build a public-listing crawler.** Platform terms and anti-bot measures make it brittle, and Conforme already sells hourly parity checks plus a free URL check. Use host-side verification, the platforms' own iCal exports, and Authority Mirror.
3. **Do not become a PMS, channel manager or direct-booking site builder.** Stay the compliance layer. iCal in and out is enough for Cap Guard; deeper integration comes through W2.
4. **Do not add a 9th or 10th country the current way.** `Registration` already has 46 columns, 33 of them country-specific (`cin*`, `rnal*`, `ama*`, `hr*`, `nl*`, `be*`). Before Ireland, Austria or Germany, normalize into `RegistrationIdentifier` rows (jurisdiction, type, number, status, displayed on listings, expiry) and move parameters into Rule Radar.
5. **Do not ship a public "verified compliant" badge.** Conforme has one, platforms do not consume it, and hosts or guests may read it as an official certificate.
6. **Do not go B2G now.** Communes already use declaration teleservices and tourist-tax platforms, procurement is slow, and serving both the enforcer and the host creates a trust conflict.
7. **Do not compute or file taxes** (income tax, VAT, DAC7 filing, LMNP). Reconcile counts, show amounts optionally, stop there.
8. **Do not headline an AI "compliance chatbot".** Hallucinated legal content is the fastest way to lose trust. Use models internally (Rule Radar triage drafts, CSV column mapping) with human review.
9. **Do not ship more standalone PDF or template kits.** Letters and checklists belong inside workflows (duty log, building card), not as separate products.
10. **Do not sell to agencies before fixing hygiene.** Guest records past `retentionExpiresAt` are hidden but never deleted; notifications are English-only and in-app only; there is no email verification. B2B buyers will ask about all three.

Also deprioritized, as instructed: pure copy, SEO and landing polish.

---

## 5. Suggested sequencing after the three in-flight MVPs

Assumes Listing Health (#44), NER Migration Cockpit (#46) and Compliance Evidence Pack (#45) merge first.

**Phase 0: enablers (small, parallelizable)**

- Transactional email plus localized FR/EN notifications with per-user preferences.
- File uploads (Blob storage) with a retention policy.
- Guest-data purge job honoring `retentionExpiresAt` per jurisdiction.
- Start the `RegistrationIdentifier` normalization behind the current UI.

**Wave 1 (Q4 2026): Cap Guard, then Authority Mirror v1**

Cap Guard first: it reuses the most existing code and must be live before 2027 bookings fill. Authority Mirror lands for the January 2027 DAC7 overview campaign.

**Wave 2 (Q4 2026 to Q1 2027): Intermediary Duty Workspace plus Agency plan**

Timed with NER migration Phase B, when operators must re-collect owner data anyway. Rule Radar's internal console starts in parallel (mostly backend).

**Wave 3 (Q1 2027): Rule Radar customer feed, then Feasibility Check**

**Wave 4 (2027): one wild bet, chosen by inbound demand**

W2 if PMS partners ask; W1 if a regional platform signs as design partner; W3 if feasibility reports sell.

### How the new bets plug into the in-flight MVPs

| In-flight MVP | Feeds or consumes |
|---------------|-------------------|
| Listing Health (#44) | Consumes Authority Mirror findings and Cap Guard state as factors |
| NER Migration Cockpit (#46) | Supplies the NER key used by Mirror matching; triggers owner re-attestation in the Duty Workspace |
| Evidence Pack (#45) | Renders the reconciliation statement, Cap Guard history and the duty log |

### Decision gates

| Bet | Continue if | Stop or rethink if |
|-----|-------------|--------------------|
| Cap Guard | Most capped units that enable it keep it on after 30 days | Hosts disable it for revenue reasons; move to budget-mode-first |
| Authority Mirror | Imports happen without support and findings get resolved | Imports stall on formats; ship the mapping screen before more rules |
| Duty Workspace | Design partners move owner collection into it for the NER migration | Operators only want seats; keep roles, drop the owner portal |
| Rule Radar | Impact notices get opened and lead to next actions | Editorial load outpaces value; keep it internal only |
| Feasibility | Checks convert into properties | Traffic without conversion; fold it into onboarding |

---

## Sources

Regulation and official sources:

- EU Regulation 2024/1028 (Art. 3 activity data, Art. 7 random checks, Art. 9 data transmission): https://eur-lex.europa.eu/eli/reg/2024/1028/oj
- DAC7, Council Directive (EU) 2021/514: https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32021L0514
- Code du tourisme L324-1-1 (caps and fines): https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000050623378
- API Meublés, how it works (H2 2026 final version, FARITAS): https://apimeubles.finances.gouv.fr/comprendre-le-dispositif
- DGE, API Meublés single data point: https://www.entreprises.gouv.fr/espace-entreprises/s-informer-sur-la-reglementation/lapi-meubles-guichet-unique-de-centralisation
- Spain, Orden VAU/653/2025 (VUD activity data model): https://www.boe.es/buscar/doc.php?id=BOE-A-2025-12679
- Spain, Supreme Court STS 620/2026 press note: https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Oficina-de-Comunicacion/Notas-de-prensa/El-Tribunal-Supremo-anula-el-Registro-Unico-de-arrendamientos-de-corta-duracion-por-considerar-que-el-Estado-carece-de-competencia-para-su-creacion
- Spain, LO 1/2025 co-owner approval (Ministerio de Vivienda): https://www.mivau.gob.es/el-ministerio/sala-de-prensa/noticias/mar-01042025-1647
- France, Art. 9-2 loi 1965 syndic information (INC): https://www.inc-conso.fr/content/meubles-de-tourisme-au-sein-dune-copropriete-nouveautes
- France, DPE thresholds for meublés de tourisme (Notaires de France): https://www.notaires.fr/fr/article/location-les-regles-applicables-aux-meubles-de-tourisme

Market and platform sources:

- Airbnb, per-city night limits: https://www.airbnb.com/help/article/1628
- Airbnb, calendar import every 3 hours: https://www.airbnb.com/help/article/99
- Booking.com, calendar import every 2 hours: https://partner.booking.com/en-gb/help/rates-availability/extranet-calendar/how-synchronise-your-calendars-across-channels
- Airbnb, DAC7 fields reported: https://www.airbnb.com/help/article/3268
- Le Meur intermediary duties and fines (law firm summaries): https://derhy-avocat.com/conciergeries-intermediaires-touristiques-loi-le-meur-2026/ and https://www.demeuzoy-avocat.com/publications/locations-airbnb-et-loi-le-meur-attention-a-la-nouvelle-responsabilite-des-intermediaires-immobiliers_160.html
- Greece, AADE data matching (practitioner note): https://nomika-epilekta.gr/en/article/airbnb-booking-vrbo-aade-data-matching-three-properties
- Chekin: https://chekin.com/en/blog/chekin-by-the-numbers-2026/
- Conforme pricing and features: https://conforme.info/pricing
- Trippz: https://trippz.com/es/anfitriones
- GuestAdmin SES submission: https://help.guestadmin.io/article/ses-hospedajes-data-submission
- PisoCheck: https://pisocheck.com/
