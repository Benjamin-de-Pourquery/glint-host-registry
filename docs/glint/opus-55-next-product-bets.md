# Glint: next product bets (Opus 5.5 memo, excluding Host Registry)

- **Prepared for:** Benjamin De Pourquery (Glint / Money Maker)
- **Date:** 23 September 2026
- **Status:** Draft for discussion. Docs only, no code.
- **Scope:** New products outside Glint Host Registry, and not Pixelizer features repackaged as a product.
- **Method:** Web research run on 23 September 2026. Primary sources where possible (EUR-Lex, European Commission, ENISA, Légifrance, French ministries, Assemblée nationale). Secondary sources (law firm notes, trade press, vendor pages) fill gaps where primary texts were not available and document market facts. Vendor pages are used as evidence that a competitor exists and what it charges, not as proof of quality. Nothing in this memo is legal advice.

---

## 1. Executive thesis

**Bottom line.** Start **Glint Label Registry** now, validate **Glint Product Registry** in parallel, and use **Glint Obligations Desk** as the 2027 distribution engine. Keep Host Registry first in Q4 2026, because the French national furnished-rental registration teleservice (API Meublés) is planned for Q4 2026 (see `PRODUCT.md`).

**What Glint is actually good at.** Host Registry proves Glint can turn fragmented EU and national rules into operating software: jurisdiction routing across 8 countries (FR, ES, IT, PT, GR, HR, NL, BE), due queues, export kits, public tokenised pages (guest check-in links), HTTP-verified official links, and honest manual submission where no government API exists. That capability is the asset, more than any single regulation.

**The window.** Between June 2026 and February 2027, a dense cluster of EU and French rules becomes applicable:

| Date | What becomes applicable | Who is hit |
| --- | --- | --- |
| 19 Jun 2026 | EU online withdrawal function, Directive 2023/2673 Art. 11a ([EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32023L2673)) | All EU online sellers |
| 19 Jul 2026 | ESPR Digital Product Passport registry live; ban on destroying unsold apparel and footwear for large companies ([Spilma summary](https://www.spilma.com/en/actualites/espr-digital-product-passport)) | Product brands |
| 2 Aug 2026 | AI Act Art. 50 transparency, including deployer labelling of deepfakes ([Bird & Bird](https://www.twobirds.com/en/insights/2026/taking-the-eu-ai-act-to-practice-the-final-transparency-code-of-practice)) | Brands, agencies, media |
| 12 Aug 2026 | PPWR packaging technical documentation, EU Declaration of Conformity, PFAS limits for food-contact packaging ([FDF guidance](https://www.fdf.org.uk/fdf/business-guidance-hubs/packaging/ppwr-business-guidance-page/)) | Brand owners and fillers, no general SME exemption |
| 1 Sep 2026 | French e-invoicing reception for all VAT-registered firms ([impots.gouv.fr](https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees)); ultra-fast-fashion malus ([Ministère de l'Économie](https://presse.economie.gouv.fr/publication-au-journal-officiel-de-larrete-definissant-le-malus-ciblant-la-mode-ultra-ephemere-pour-une-entree-en-vigueur-le-1er-septembre-2026/)) | All French firms; textile producers |
| 11 Sep 2026 | CRA vulnerability and incident reporting via ENISA's Single Reporting Platform ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)) | Manufacturers of products with digital elements |
| 27 Sep 2026 | EmpCo: generic green claims and uncertified sustainability labels banned ([EUR-Lex](https://eur-lex.europa.eu/eli/dir/2024/825/oj)); harmonised legal guarantee notice mandatory ([Your Europe](https://europa.eu/youreurope/business/dealing-with-customers/consumer-contracts-guarantees/eu-legal-guarantee-notice-and-garan-label/index_en.htm)) | All B2C traders, label owners |
| 1 Oct 2026 | Ecobalyse: third parties may publish a textile product's environmental cost without the brand's consent ([Décret 2025-957](https://aida.ineris.fr/reglementation/decret-ndeg-2025-957-060925-relatif-modalites-calcul-communication-cout)) | Textile brands selling in France |
| 24 Dec 2026 | Each member state must provide an EUDI Wallet ([Authologic](https://authologic.com/blog/how-eidas-20-affects-private-relying-parties-and-sca-analysis)); EU age verification recommended by 31 Dec 2026 ([Recommendation (EU) 2026/1035](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202601035)) | Relying parties |
| 1 Jan 2027 | French ban on advertising ultra-fast fashion, influencers included ([Ministère de la Transition écologique](https://www.ecologie.gouv.fr/politiques-publiques/reduire-limpact-environnemental-lindustrie-textile-loi-du-8-juillet-2026)) | Brands, agencies, creators |
| 12 Jan 2027 | Data Act: cloud switching charges abolished ([DLA Piper](https://www.dlapiper.com/en/insights/publications/law-in-tech/2026/cloud-exit-under-the-eu-data-act)) | All cloud and SaaS customers |
| 18 Feb 2027 | Battery passport for EV, LMT and industrial batteries above 2 kWh ([Arianee summary](https://www.arianee.com/en/solutions/batteries/e-bikes-scooters)) | E-bike, scooter and battery brands, importers |
| 1 Sep 2027 | French e-invoicing issuance for SMEs and micro-enterprises ([impots.gouv.fr leaflet](https://www.impots.gouv.fr/sites/default/files/media/1_metier/2_professionnel/EV/2_gestion/290_facturation_electronique/facturation-electronique---depliant-microentreprises.pdf)) | All French SMEs |
| 11 Dec 2027 | CRA main cybersecurity obligations ([ENISA](https://www.enisa.europa.eu/news/the-cra-single-reporting-platform-is-launched)) | Manufacturers |

**The trap.** Nearly every 2026 deadline checked in this research attracted a swarm of small, AI-built, single-regulation tools within weeks. Research on 23 September 2026 found:

| Regulation | Tools found | Entry price |
| --- | --- | --- |
| EmpCo green claims (Shopify) | [EU Green Claims & EmpCo Check](https://apps.shopify.com/eu-green-claims-greenwashing), [GreenClaims EmpCo Compliance](https://apps.shopify.com/greenclaims-empco-compliance), [EU Green Claims Fix & Proof](https://apps.shopify.com/eu-green-claims-fix-proof), [ClaimFix](https://apps.shopify.com/claimfix-empco-green-claims), [Green Claims Guard](https://apps.shopify.com/green-claims-guard). At least four launched between late June and early September 2026. | Free tiers, then $19 to $59 per month |
| Withdrawal button | [Three or more Shopify apps](https://apps.shopify.com/widerruf-button-eu-withdrawal), [WooCommerce plugin with 300+ installs](https://wordpress.org/plugins/widerrufsbutton/), [open-source WordPress module](https://github.com/webdados/eu-withdrawal-compliance) | Free to about $20 per month |
| Ecobalyse textile score | [FilVert](https://apps.shopify.com/filvert), [Score AGEC Pro](https://apps.shopify.com/score-agec-pro), Vestis Labs integration | $19 to $50 per month |
| PPWR packaging DoC | [Tanso](https://www.tanso.de/en/sustainable-supply-chain/ppwr-software), [VERSO](https://verso.de/en/ppwr-software-solution/), [Simvia](https://www.simvia.com/ppwr-compliance-software), [PPWR Connect](https://ppwrconnect.com/features), [PAQR](https://paqr.com/ppwr-solution/) | Mid-market focus for several; pricing not compared |
| CRA for software makers | [CRAdar](https://cradar.dev/), [CRA Guard](https://getcraguard.com/), [CRACheck](https://solidwaretools.com/cracheck/cra-small-company-compliance-cost-affordable.html), [CRACI](https://craci.com/pricing), [Kunnus](https://kunnus.tech/en/kleinunternehmen) | $59 per year to $49 per month per product; €149 one-off |
| Battery passport | [Traceable](https://traceable.digital/industries/batteries/lmt-batteries/), [Batteriepasswerk](https://www.batteriepasswerk.com/en), [DPP Hero](https://dpphero.com/en), Circuland, Smart Battery Pass, Arianee | €49 to €149 per month, or per passport |

Being first on a deadline is no longer a moat when a competent clone ships in two weeks. Competing there is a price race that depends on app-store ranking, which conflicts with Glint's zero-spend distribution rule.

**The thesis: registries for the EU rulebook.** Glint's next wave should target products where:

1. **Several parties must interact** (scheme owner, verifier and trader; brand and supplier; accountant and client). Clones build single-player tools.
2. **A public verification layer creates a data asset** (like Host Registry registration numbers), which gets more valuable with every customer.
3. **One buyer's data is reused across several regulations**, so switching to five single-purpose apps is worse.
4. **Distribution runs through channels the clones do not reach**: federations, accounting firms, agencies, and PrestaShop or WooCommerce rather than Shopify only.

Naming stays in English and in one family: Glint Host Registry, **Glint Label Registry**, **Glint Product Registry**. Product copy is FR for French buyers and EN for EU buyers.

---

## 2. Ranked shortlist

| Rank | Product (working name) | Buyer | Trigger | Wedge in one line |
| --- | --- | --- | --- | --- |
| 1 | **Glint Label Registry** | Owners of private sustainability labels, small verifiers | EmpCo, 27 Sep 2026 | Operating system for EmpCo-compliant certification schemes, plus a public certificate registry |
| 2 | **Glint Product Registry** | SME consumer brands on PrestaShop, WooCommerce and Shopify | PPWR, GPSR, EmpCo, guarantee notice, Ecobalyse | One SKU and supplier graph reused across every product regulation |
| 3 | **Glint Obligations Desk** | French accounting firms, resold to their SME clients | 2026 to 2027 regulatory pile-up | Per-client obligations register sold through accountants |
| 4 | **Glint Access Desk** | French web agencies and accessibility auditors | EAA enforcement, RGAA 5 at end of 2026 | Portfolio accessibility operations built for the RGAA 5 migration |
| 5 | **Glint Verify** | SMEs that need age or identity checks | EUDI Wallets on 24 Dec 2026, EU age verification app | Wallet-based verification plus relying-party registration, priced for SMEs |

Scores are judgment calls (1 low, 5 high):

| Bet | Deadline pressure | Gap (few clones) | Reuse of Host Registry engine | Zero-spend distribution | Revenue per customer | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Label Registry | 5 | 5 | 4 | 4 | 4 | 22 |
| Product Registry | 5 | 3 | 5 | 3 | 4 | 20 |
| Obligations Desk | 3 | 4 | 4 | 5 | 3 | 19 |
| Access Desk | 4 | 3 | 3 | 4 | 3 | 17 |
| Verify | 3 | 3 | 3 | 3 | 3 | 15 |

---

## 3. Bet details

### Bet 1: Glint Label Registry

**Problem.** From 27 September 2026, a private sustainability label (environmental or social) may only be shown to EU consumers if it is set up by a public authority or based on a certification scheme. The scheme must have public requirements, open and non-discriminatory access on fair terms, procedures to suspend or withdraw certification, and monitoring by a competent third party that is legally separate from both the scheme owner and the trader ([Directive (EU) 2024/825](https://eur-lex.europa.eu/eli/dir/2024/825/oj), [Commission EmpCo FAQ](https://commission.europa.eu/document/download/3c257883-bb2a-4dd9-a6dc-501d587bb34f_en?filename=faq-empowerting-consumers-gtd.pdf)). The Commission's FAQ says there is no transition period: labels that fail the test must be removed. Many small labels run on spreadsheets, PDFs and self-declarations. They now need an auditable scheme with a real third party, or they disappear. Traders must check a scheme's public terms before displaying its label, so a public, verifiable registry also has value on the demand side.

**Who pays.**
- Scheme owners: associations, trade federations, cooperatives, regional "made in" labels, B2B platforms that award badges, brands running their own eco or social badges.
- Small verification bodies and independent auditors (per-seat).
- Later: marketplaces and retailers that want to check labels at scale (API).

**Why now: signals.**
- EmpCo applies from 27 September 2026; transposition was due on 27 March 2026 ([EUR-Lex](https://eur-lex.europa.eu/eli/dir/2024/825/oj)).
- On 28 May 2026 the Commission opened infringement procedures against 20 member states for late transposition. Germany has transposed through its unfair competition law (UWG) ([Mondaq](https://www.mondaq.com/consumer-trading-unfair-trading/1800382/eu-commission-pushes-for-transposition-of-the-empco-directive-on-environmental-claims)). France's DDADUE bill (articles 20 and 21) passed the Senate on 18 February 2026 and is still waiting at the Assemblée nationale ([Assemblée nationale, bill 2518](https://www.assemblee-nationale.fr/dyn/17/textes/l17b2518_projet-loi), [status note](https://www.donneespersonnelles.fr/allegations-environnementales)). French courts must already read national law in light of the directive.
- The Commission counted about 230 sustainability labels in the EU, with nearly half offering weak or non-existent verification, and found that 53% of green claims were vague, misleading or unfounded ([European Commission, green claims](https://environment.ec.europa.eu/topics/circular-economy-topics/green-claims_en)).

**Why now: gap.**
- What exists is service-led. UCSL sells scheme design and third-party conformity assessment ([UCSL](https://ucsl.eu/label-verification)). FLOCERT sells a readiness assessment that it says is not accredited verification ([FLOCERT](https://www.flocert.net/empco-readiness-assessment/)). Large schemes already run their own programmes, for example Rainforest Alliance, or ClimeCo with BSI as verifier ([Rainforest Alliance](https://www.rainforest-alliance.org/business/certification/empowering-consumers-directive-empco-requirements/), [ClimeCo](https://www.climeco.com/wp-content/uploads/2026/07/ClimeCo-EMPowering-COnsumers-for-the-Green-Transition-Directive.pdf)).
- The closest software found is sector-specific: the Qfor toolkit for training-quality audits ([Qfor](https://qfor.org/fr/qfor-toolkit/)). No self-serve SaaS for small and mid-size scheme owners turned up.
- All the 2026 green-claims apps target traders' product copy, not the scheme owners behind the labels.

**MVP scope (6 to 8 weeks, solo plus AI).**
1. Scheme workspace: versioned requirement sets, fee schedule, governance and complaints procedure, auto-published as a public scheme page in FR and EN. This covers the "publicly available terms" condition.
2. Applicant portal: self-assessment per criterion, evidence upload, status tracking.
3. Verifier module: invite verifier organisations, enforce legal separation (the verifier organisation must differ from the scheme owner organisation), capture competence and conflict-of-interest declarations, assign files, record findings against checklists, and produce a recommendation.
4. Decisions: grant, grant with conditions, suspend or withdraw, each with reasons. Certificate numbering, validity and surveillance schedule, and a due queue for renewals, reusing the Host Registry due-queue pattern.
5. Public registry: certificate lookup, QR code per certificate, JSON endpoint, status history.
6. Public complaints and appeals intake with deadline tracking.
7. Free lead magnet: an "EmpCo label readiness check" against the Article 2(r) conditions that produces a gap list and routes to the product.

Out of scope for the MVP: acting as a certifier, accreditation, and payments between scheme owners and verifiers.

**Unfair advantage vs alternatives.**
- Glint is a neutral software provider, not a certifier, so it can partner with verification bodies instead of competing with them.
- Host Registry already ships the hard parts: multi-tenant registry, public tokenised pages, due queues, playbooks, bilingual UI and verified official links.
- Data asset: a public registry of EmpCo-compliant schemes and certificates becomes the lookup layer for traders and, later, for Digital Product Passport links. Shopify clones cannot build it without the scheme owners.

**Distribution at zero spend.** The buyer list is finite and public (label directories, federation websites). Direct outreach; FR and EN SEO pages such as "label conforme EmpCo" and "certification scheme requirements"; partnerships with 2 or 3 independent verifiers who bring their clients.

**Revenue model (hypotheses).** Scheme plan at €149 per month (1 scheme, up to 50 active certificates). Pro at €449 per month (several schemes, 500 certificates, API). Verifier seat at €39 per month. Overage at €1 per active certificate per month. Public registry free. 12-month target: 25 paying schemes, roughly €7k to €8k MRR.

**Kill criteria.**
- Fewer than 10 qualified scheme-owner conversations after 4 weeks of outreach.
- Fewer than 3 paid pilots or priced letters of intent by week 8.
- More than half of interviewed owners plan to drop their label rather than restructure it. In that case, pivot to a trader-side label check only.
- Legal review shows scheme tooling has to be operated by an accredited body.

FR tagline: « Votre label, conforme EmpCo et vérifiable par tous. »

---

### Bet 2: Glint Product Registry

**Problem.** An SME brand selling physical goods now faces several obligations within seven months, and all of them start from the same product and supplier data:
- **PPWR since 12 August 2026.** Annex VII technical documentation and an Annex VIII EU Declaration of Conformity per packaging, kept 5 or 10 years; PFAS limits for food-contact packaging; heavy-metal limits. The brand owner or filler is normally the "manufacturer". There is no general SME exemption: only micro-enterprises (under 10 staff and under €2M turnover) can hand the role to an EU packaging supplier ([FDF guidance](https://www.fdf.org.uk/fdf/business-guidance-hubs/packaging/ppwr-business-guidance-page/), [Gramta](https://gramta.com/articles/who-is-the-manufacturer-ppwr), [PPWR Obligations](https://ppwrobligations.com/guide/does-ppwr-apply-to-small-businesses/)).
- **GPSR.** A consumer complaint channel, investigation of complaints, an internal register, and accident notification through the Safety Business Gateway ([Commission guidelines, OJ C/2025/6238](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ%3AC_202506238)).
- **EmpCo from 27 September 2026.** Generic green claims and uncertified labels banned; the harmonised legal guarantee notice must be shown in colour on web shops ([Your Europe](https://europa.eu/youreurope/business/dealing-with-customers/consumer-contracts-guarantees/eu-legal-guarantee-notice-and-garan-label/index_en.htm), [Implementing Regulation (EU) 2025/1960](https://eur-lex.europa.eu/eli/reg_impl/2025/1960/oj/eng)).
- **Textiles in France.** The Ecobalyse environmental cost is voluntary, but from 1 October 2026 third parties may publish it without consent, using default data that penalises the brand ([Décret 2025-957](https://aida.ineris.fr/reglementation/decret-ndeg-2025-957-060925-relatif-modalites-calcul-communication-cout), [Ministry FAQ](https://www.ecologie.gouv.fr/sites/default/files/documents/FAQ_PRO_Affichage-environnemental_VF1.pdf)). The ultra-fast-fashion law of 8 July 2026 adds a malus and an advertising ban ([Loi n° 2026-602](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054399113)).
- **LMT batteries (e-bikes, scooters).** Battery passport from 18 February 2027, with no capacity threshold ([Arianee](https://www.arianee.com/en/solutions/batteries/e-bikes-scooters), [Traceable](https://traceable.digital/industries/batteries/lmt-batteries/)).

Today each obligation has its own tool, and each tool asks suppliers for the same data again.

**Who pays.** French and EU consumer brands with 10 to 250 staff (cosmetics, home, kids, fashion, small electronics, food) selling online and in retail. Channel buyers: trade federations that want a white-label compliance hub for their members.

**Why now: signals.**
- The PPWR, EmpCo and Ecobalyse deadlines fall within 7 weeks of each other.
- Enforcement is rising. DGCCRF fines and settlements topped €200M in 2025, against €81M in 2023, and 26% of controls led to corrective or punitive follow-up ([Ministère de l'Économie](https://presse.economie.gouv.fr/proteger-les-consommateurs-et-defendre-la-competitivite-des-entreprises-francaises-la-dgccrf-publie-son-rapport-dactivite-2025/)). Products bought online were dangerous one time in three ([FashionNetwork](https://ch.fashionnetwork.com/news/Dgccrf-un-tiers-des-produits-controles-en-2025-etaient-non-conformes-ou-dangereux,1839617.html)).

**Why now: gap.**
- The 2026 tool swarm is single-regulation and mostly Shopify-first (see the table in section 1).
- In France, Shopify runs 22.2% of e-commerce sites, WooCommerce 47.4% and PrestaShop 19.3%. PrestaShop merchants generate the highest estimated revenue (€7.96B, against €5.76B for Shopify), and 14.9% of them sell B2B ([Friends of Presta CMS barometer 2026](https://friendsofpresta.org/fr/barometre-cms), [Blog du Modérateur](https://www.blogdumoderateur.com/woocommerce-shopify-prestashop-cms-e-commerce-francais/)). The structured SMEs with large catalogues are the least served by Shopify-only apps.
- The PPWR platforms cover packaging in depth but not GPSR operations, claims or textile data. Tanso, for example, describes itself as optimised for mid-sized manufacturers ([Tanso](https://www.tanso.de/en/sustainable-supply-chain/ppwr-software), [PPWR Connect](https://ppwrconnect.com/features)).

**MVP scope (8 weeks).**
1. Catalogue ingest: CSV first, then a PrestaShop module. Data model: SKU, then components (packaging, materials), then suppliers.
2. Applicability engine v1: per-SKU flags for PPWR (packaging type, food contact), GPSR (all consumer products), EmpCo (claims detected in product copy) and the guarantee notice (shop level). Textile and LMT-battery modules are flag-only in v1.
3. Supplier evidence portal, free for suppliers: request packs per component (DoC, PFAS and heavy-metal test reports, material composition), reminders and expiry tracking. PPWR Article 16 already obliges suppliers to provide this information ([Virke PPWR Q&A](https://www.virke.no/globalassets/uploaded-files/packaging-and-packaging-waste-regulation-ppwr-kh0126006enn.pdf)).
4. PPWR DoC generator (Annex VIII) and technical-file index (Annex VII) with retention timers.
5. GPSR operations: embeddable complaint and accident form, internal register, triage, and a pre-filled Safety Business Gateway notification pack for manual submission (no fake API).
6. Claims and labels register: detect generic claims in product copy, and link each claim to evidence or a rewrite. Displayed labels are checked against Glint Label Registry.
7. Dashboard: a due queue showing what blocks each SKU, plus an inspection-ready export.

**Unfair advantage vs alternatives.**
- Supplier data is collected once and reused across regulations. Clones cannot match this without rebuilding as a platform.
- PrestaShop and WooCommerce first, FR and EN, with French legal references.
- Same architecture as Host Registry (router, due queue, export kit, honest manual submission), plus a direct synergy with Label Registry.
- Avoids head-on competition with enterprise suites through price and scope (SME self-serve).

**Distribution at zero spend.** Organic listings on the PrestaShop Addons marketplace and WordPress.org; FR SEO pages on each deadline; 2 federations as design partners; supplier invitations as a viral loop (each supplier sees Glint when a customer asks for a DoC).

**Revenue model (hypotheses).** Starter at €79 per month (up to 200 SKUs, 1 channel). Growth at €249 per month (up to 2,000 SKUs, supplier portal, GPSR register). Federation white-label from €990 per month. 12-month target: 40 brands, about €6k MRR, plus 1 federation.

**Kill criteria.**
- In 15 brand interviews, fewer than 5 use two or more separate tools or spreadsheets for these rules.
- Fewer than 3 design partners on PrestaShop or WooCommerce by week 6.
- Supplier response rate under 30% in the pilot, which would mean the evidence portal cannot collect data.
- A PPWR platform launches SME self-serve under €50 per month covering GPSR and claims during the build window. In that case, narrow to GPSR operations and claims.

FR tagline: « Toutes vos obligations produit, une seule fiche par référence. »

---

### Bet 3: Glint Obligations Desk (for accounting firms)

**Problem.** French SMEs ask their accountant first when a new rule appears. In 2026 and 2027 the list includes e-invoicing, REP (extended producer responsibility) identifiers, PPWR, EmpCo claims and the guarantee notice, GPSR, the withdrawal function, EAA scope, CRA scope, AI Act Article 50, and pay transparency and NIS2 on the horizon. Accounting firms have no per-client view of which obligations apply, by when, and with what proof. Legal-watch feeds say what changed, not which of a firm's 300 clients is affected.

**Who pays.** Accounting firms. France had 21,611 chartered accountants and 19,490 accounting firms in 2026; more than 60% of firms have fewer than 10 staff, and 77% of companies use an accountant ([les-experts-comptables.fr](https://les-experts-comptables.fr/ressources/nombre-experts-comptables-france), [Compta-Online](https://www.compta-online.com/les-chiffres-de-expertise-comptable-en-france-ao861)). The firm pays per client file and resells it as a compliance engagement ("mission conformité").

**Why now: signals.**
- The profession is repositioning toward advisory. The Ordre (CNOEC) lists REP obligations, VSME sustainability reporting and CSRD support among the engagements it wants firms to deliver ([CNOEC, durabilité](https://www.experts-comptables.fr/la-durabilite-au-coeur-de-la-mission-des-experts-comptables)).
- E-invoicing reception has applied to all firms since 1 September 2026, and SME issuance starts on 1 September 2027. This tightens the digital link between firms and clients ([impots.gouv.fr](https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees)).
- Enforcement is rising (see the DGCCRF figures in Bet 2).

**Why now: gap.**
- Legal-watch SaaS such as JuriPulse and Evenco classify new texts and send alerts. They do not maintain a per-client obligations register ([JuriPulse](https://www.juripulse.fr/a-propos), [Evenco](https://evenco.io/)).
- Accounting suites cover tax and payroll calendars, not product, consumer or cyber obligations.

**MVP scope (6 weeks).**
1. Import the client list from a CSV export of the firm's production software (SIREN, NAF activity code, headcount, turnover), enriched with free public company data (INSEE Sirene open data).
2. Short client questionnaire by magic link: sells online? physical products? packaging? labels? connected products? furnished short-term rentals?
3. Rules engine v1 with 12 high-confidence obligations, each with sources, dates and verified official links.
4. Firm dashboard: a portfolio heatmap (which clients hit which deadline) and a per-client register with status.
5. Client-facing brief in FR, engagement-letter templates, reminders.
6. Referral hooks into Glint products: Host Registry for furnished-rental clients, Product Registry, Label Registry.

**Unfair advantage vs alternatives.**
- One firm brings dozens to hundreds of SMEs: distribution without ads.
- Reuses rules content already built for Host Registry and the other bets, and Glint's HTTP-verified official-link discipline.
- It becomes the funnel for the whole Glint portfolio, including the existing Host Registry, since furnished-rental owners are common in accounting portfolios.

**Distribution at zero spend.** Regional Ordre events and webinars, accounting-profession media and forums, 3 pilot firms turned into case studies, and a referral fee for firms.

**Revenue model (hypotheses).** €149 per month for up to 100 client files, €490 per month for up to 500, plus revenue share when clients subscribe to a Glint product. 12-month target: 15 firms, about €3k MRR. The main value is funnel volume.

**Kill criteria.**
- Fewer than 3 firms paying after 8 weeks.
- Client questionnaire completion under 25%.
- Firms refuse to pay without integration into closed production software.
- The profession's rules on legal advice by accountants make the client brief unusable. Validate this early: Glint provides information, not legal advice.

---

### Bet 4: Glint Access Desk (agencies and the RGAA 5 transition)

**Problem.** French web agencies and in-house teams must run accessibility audits, publish accessibility statements and keep multi-year plans for many sites at once. The European Accessibility Act has applied since 28 June 2025. RGAA 5 is planned for the end of 2026: it integrates WCAG 2.2, adds mobile apps and office documents, names Arcom as the control authority and introduces a government service for filing statements. Statements published before RGAA 5 must be updated within 18 months ([DesignGouv](https://design.numerique.gouv.fr/articles/2026-03-02-rgaa5/), [accessibilite.numerique.gouv.fr](https://accessibilite.numerique.gouv.fr/obligations/declaration-accessibilite/)). Every agency portfolio will need re-audits in 2027 and 2028.

**Who pays.** Web agencies with 10 to 200 client sites, freelance accessibility auditors, and mid-size online merchants with in-house teams.

**Why now: signals.**
- Disability associations put Auchan, Carrefour, E.Leclerc and Picard on formal notice in July 2025 and sued them in November 2025 ([Droit Pluriel](https://droitpluriel.fr/mise-en-demeure-des-entreprises-auchan-carrefour-e-leclerc-et-picard-surgeles-de-se-conformer-a-leur-obligation-daccessibilite-numerique-pour-leurs-services-de-courses-en-ligne/), [Ecommerce Mag](https://www.ecommercemag.fr/retail-1220/distribution-4-geants-assignes-en-justice-pour-manquement-a-laccessibilite-54010)).
- On 5 May 2026 the Lille court dismissed the case against Auchan E-commerce. It applied the €250M turnover threshold from the 2005 disability law rather than the EAA's €2M micro-enterprise threshold. The associations have appealed ([Doctrine](https://www.doctrine.fr/d/TJ/Lille/2026/TJPBB02362391D40C490511), [Faire Face](https://www.faire-face.fr/2026/05/07/une-decision-juridique-qui-remet-laccessibilite-numerique-en-question/), [Auditsu analysis](https://auditsu.com/resources/eaa-first-court-ruling-auchan)). With scope contested, agencies need a scope and evidence trail, not just scans.
- Accessibility overlays are discredited. In April 2025 the FTC ordered accessiBe to pay $1M for claiming its widget made sites WCAG compliant ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)).

**Why now: gap.**
- Ara, the free tool from the government's digital agency (DINUM), is good for a single expert audit and statement. It is manual and is not a portfolio or monitoring tool ([Ara](https://ara.numerique.gouv.fr/)).
- Global WCAG monitoring suites are built for large organisations and start from WCAG rather than RGAA. Their pricing for small agencies is still to be checked (see section 7).

**MVP scope (6 to 8 weeks).**
1. Portfolio of sites and apps per client, with page sampling per RGAA rules.
2. Automated scans (axe-core via Playwright) mapped to RGAA criteria where automation is valid, with clear "manual check required" labels.
3. Manual audit checklist with evidence (RGAA 4.1.2 now, RGAA 5 once published), with import and export compatible with Ara where feasible ([Ara is open source](https://github.com/DISIC/Ara)).
4. Statement generator in the official format; multi-year plan builder.
5. Due queue: 3-year validity, the 18-month RGAA 5 window, and redesign triggers.
6. White-label client report and client portal.
7. Scope assistant: EAA sectors, micro-enterprise exemption, and a flag for the pending appeal on the turnover threshold.

**Unfair advantage vs alternatives.** RGAA-native and FR-first, the due-queue engine from Host Registry, an explicit "no overlay" position, and timing on the RGAA 5 migration wave.

**Distribution at zero spend.** Agency communities, accessibility meetups, SEO on "RGAA 5 migration", and a free public "statement expiry checker".

**Revenue model (hypotheses).** Agency at €99 per month (10 sites) or €299 per month (50 sites); auditor seat at €29 per month. 12-month target: 30 agencies, about €5k MRR.

**Kill criteria.**
- RGAA 5 slips beyond mid-2027 and the appeal confirms the €250M threshold, which shrinks private-sector demand.
- Fewer than 5 agencies agree to pay €99 per month after a demo.
- DINUM adds portfolio management and monitoring to Ara.

---

### Bet 5: Glint Verify (EUDI Wallet and EU age verification for SMEs)

**Problem.** Every member state must offer an EUDI Wallet by 24 December 2026 ([Authologic](https://authologic.com/blog/how-eidas-20-affects-private-relying-parties-and-sca-analysis)). The Commission announced in May 2026 that the EU age-verification app was technically ready, and recommends national availability by 31 December 2026 ([Commission statement](https://ec.europa.eu/commission/presscorner/api/files/document/print/en/statement_26_817/STATEMENT_26_817_EN.pdf), [Recommendation (EU) 2026/1035](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202601035)). Relying parties must register nationally and receive registration certificates that declare which data they will request ([Implementing Regulation (EU) 2026/1730](https://eur-lex.europa.eu/eli/reg_impl/2026/1730/oj/eng)). SMEs that need age or identity checks (online wine and spirits sellers, CBD and vape shops, event ticketing, rentals, marketplaces onboarding sellers) mostly rely on checkboxes today, or pay per-check fees to KYC (identity verification) vendors.

**Who pays.** Online sellers of age-restricted goods, small marketplaces, rental and hospitality operators, coworking and event operators. The first internal customer is Host Registry, whose guest registers need identity and nationality data.

**Why now: signals.**
- The dates above.
- The Commission presents the app as a way to keep minors away from pornography, gambling and sites selling alcohol ([Commission FAQ](https://digital-strategy.ec.europa.eu/en/faqs/eu-age-verification-solution)).
- From December 2027, private relying parties in regulated sectors (excluding micro and small enterprises) must accept wallets when a user asks ([FintechPassport](https://fintechpassport.eu/eidas-2-digital-identity-wallet-acceptance/)).

**Why now: gap.** Wallet-based checks are free for citizens and privacy-preserving, but SMEs lack the verifier integration, the registration paperwork and a plug-in for their shop. KYC incumbents price for regulated enterprises.

**MVP scope (6 weeks, gated on sandbox access).**
1. Hosted verifier supporting the EU age-verification credential first, then wallet identity (PID) attributes.
2. Checkout-gating plug-ins for PrestaShop and WooCommerce.
3. Relying-party registration assistant per country: guides, document pack, manual submission.
4. Minimal-data consent log and audit trail; dashboard with verification and fallback rates.
5. Host Registry pilot: guests pre-fill police-register fields from a wallet where available.

**Unfair advantage vs alternatives.** SMB pricing and plug-ins, FR-first, Host Registry as the first user, and a privacy-by-design position.

**Distribution at zero spend.** Plug-in marketplaces, online wine and spirits merchant communities, Host Registry users.

**Revenue model (hypotheses).** €29 per month including 500 verifications, then €0.04 per verification, to be checked against wallet transaction costs.

**Kill criteria.**
- By 31 March 2027, fewer than 3 member states have public wallet or age-verification apps with open relying-party onboarding.
- Checkout conversion drops by more than 5% in pilot A/B tests.
- Major shop platforms ship native EU age verification.

---

## 4. Wild but serious bets

### W1: Glint Switch (Data Act exit and EU sovereignty planner)

- **Signal.** From 12 January 2027, IaaS, PaaS and SaaS providers can no longer charge switching fees, including egress fees tied to a switch. Customers get a maximum 2-month notice period and a 30-day transition ([DLA Piper](https://www.dlapiper.com/en/insights/publications/law-in-tech/2026/cloud-exit-under-the-eu-data-act), [Lexology](https://www.lexology.com/library/detail.aspx?g=60401543-7ee0-4d2f-b0d0-429e3f75aa09), [FW Delta](https://fwdelta.com/research/eu-cloud-switching-exit-readiness-report-2026)). A 2026 survey of 1,818 IT decision makers found that 39.7% of German firms were implementing European software (up from 20.4%) and that 18.5% of French firms had already switched providers over CLOUD Act concerns. The main barriers were migration cost (34.7% in France) and lack of an overview of alternatives (42% in the Nordics) ([Myra State of Digital Sovereignty 2026](https://www.myrasecurity.com/assets/79302/1788854036-myra-state-of-digital-sovereignty-2026-en.pdf), [Tuta summary](https://tuta.com/blog/digital-sovereignty-study)).
- **Gap.** Directories of EU alternatives are free lists. SaaS-management platforms optimise spend, not exit. Nobody turns Data Act switching rights into a workflow for SMEs.
- **Product.** SaaS inventory (OAuth app list from Google Workspace or Microsoft 365, plus an expense CSV); exposure scoring (provider jurisdiction, data location); mapped EU alternatives; Data Act switching-request letters and a tracker for provider deadlines; export checklists per tool; a DPA register.
- **Why wild.** Demand is partly driven by sentiment and could fade. Switching rights are new and untested in practice.
- **Kill.** Fewer than 30 signups from a free "exit readiness" scan in 6 weeks, or providers ignore test switching requests without consequence, which would show the workflow has no teeth.

### W2: Glint Agent Checkout EU (agentic commerce adapter with EU consumer law built in)

- **Signal.** Google's Universal Commerce Protocol (UCP) checkout is limited to the US, Canada and Australia ([Google Merchant Center](https://support.google.com/merchants/answer/16837055?hl=en)). OpenAI's Instant Checkout runs on the Agentic Commerce Protocol and launched in the US ([OpenAI](https://openai.com/index/buy-it-in-chatgpt/)). Worldline launched one of the first European UCP payment handlers on 14 September 2026 ([Worldline](https://worldline.com/en/home/top-navigation/media-relations/press-release/pr-2026_09_14_01)). A community PrestaShop UCP module exists but targets stablecoin settlement ([GitHub](https://github.com/financedistrict-platform/prestashop-agentic-commerce)).
- **Gap.** When agentic checkout opens in the EU, PrestaShop and WooCommerce merchants will need endpoints that also carry EU obligations: pre-contractual information, the withdrawal function, the guarantee notice and price transparency. Shopify will handle its own merchants, which leaves the roughly 78% of French shops not on Shopify.
- **Product.** PrestaShop and WooCommerce modules that expose UCP and ACP endpoints with an EU consumer-law layer, catalogue-feed validation, and order and withdrawal sync.
- **Why wild.** EU launch timing is unknown, and platform owners may restrict access.
- **Kill.** No EU availability announced for UCP or ACP checkout by mid-2027, or EU eligibility limited to Shopify merchants.

### W3: Glint Rules API (verified obligations data for builders)

- **Signal.** Transposition status is messy and changes weekly. The Commission's national-measures database showed zero notified measures for several member states after the 31 July 2026 right-to-repair deadline, and France had published no transposition text by 8 August 2026 ([EUR-Lex national measures](https://eur-lex.europa.eu/legal-content/FR/NIM/?uri=oj%3AL_202401799), [Parlorama](https://www.parlorama.eu/droit-a-la-reparation-europe/)). Twenty member states received EmpCo infringement letters. France's DDADUE and NIS2 bills are still pending ([Next](https://next.ink/brief-article/alleluia-la-transposition-de-nis2-est-enfin-a-lordre-du-jour-de-lassemblee-nationale/)).
- **Gap.** Every tool in the swarm re-researches the same rules. There is no affordable, machine-readable, source-verified dataset of EU and French obligations with applicability rules, dates, transposition status and HTTP-verified official links.
- **Product.** An API and dashboard fed by Glint's own curation pipeline (the one behind Host Registry playbooks and the bets above), with changelogs and webhooks.
- **Why wild.** Data businesses need sustained curation and carry liability when wrong. Buyers may prefer to scrape.
- **Kill.** Fewer than 5 paying API customers within 3 months of a public beta, or curation cost per obligation stays above what 5 customers pay.

---

## 5. Anti-recommendations (what not to build)

1. **Another single-regulation Shopify checker** for green claims, the withdrawal button, Ecobalyse labels, battery passports or CRA SBOMs. See the table in section 1: 3 to 6 competitors per deadline, $19 to $59 per month, launched within weeks. Build these only as modules inside a registry product.
2. **A French e-invoicing platform or add-on.** On 17 September 2026 the tax authority's lists held 163 approved-platform entries (149 fully registered, 14 awaiting interoperability tests), and several offer free tiers, including Pennylane for micro-enterprises ([logicielcomptable.net](https://logicielcomptable.net/liste-des-plateformes-agreees-pour-la-facturation-electronique/)). Certification and interoperability costs are high.
3. **An AI search visibility (GEO or AEO) tracker.** Profound raised a $180M Series D at a $1.8B valuation on 15 September 2026; Peec AI raised $21M; Bluefish raised $43M ([TechCrunch on Profound](https://techcrunch.com/2026/09/15/aeo-startup-profound-hits-unicorn-valuation-raises-180m-series-d-7-months-after-last-round/), [TechCrunch on Peec AI](https://techcrunch.com/2025/11/17/as-consumers-ditch-google-for-chatgpt-peec-ai-raises-21m-to-help-brands-adapt/), [Tech Funding News](https://techfundingnews.com/profound-hits-1-8b-valuation-with-180m-raise-led-by-sequoia-capital-to-help-brands-rank-in-ai-search/)).
4. **An accessibility overlay widget.** Legal and reputational risk after the FTC order against accessiBe ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)).
5. **Generic AI Act governance or NIS2 compliance.** High-risk AI obligations moved to 2 December 2027 and 2 August 2028 ([European Parliament legislative train](https://www.europarl.europa.eu/legislative-train/package-digital-package/file-digital-omnibus-on-ai)). The French NIS2 transposition only reaches the Assemblée on 7 October 2026 ([Next](https://next.ink/brief-article/alleluia-la-transposition-de-nis2-est-enfin-a-lordre-du-jour-de-lassemblee-nationale/)). Well-funded governance, risk and compliance (GRC) platforms already serve both.
6. **A pay transparency suite, for now.** The French bill was presented on 10 September 2026; adoption before the 2027 presidential election is uncertain, and the current gender-equality index stays in place for 2027 ([Vie publique](https://www.vie-publique.fr/loi/304502-transposition-directive-transparence-des-salaires-projet-de-loi), [BFM](https://www.bfmtv.com/economie/emploi/coup-d-envoi-pour-le-projet-de-loi-sur-la-transparence-des-salaires-mais-son-examen-avant-la-presidentielle-n-est-pas-garanti_AD-202609100535.html), [Littler](https://littler.fr/transparence-salariale/)).
7. **Crowded operational verticals found during research.**
   - Posted-worker declarations: [premote](https://www.premote.de/en/eu-entsenderichtlinie), [WorkFlex](https://www.workflex.com/en-uk/solutions/posted-worker-notification) (500+ employers), [Workadministration](https://workadministration.com/), [AuxilAi](https://www.auxilai.com/).
   - Collective self-consumption (energy sharing) management: [Enogrid EnoPower](https://enogrid.com/enopower/), [OYO](https://oyo-communities.fr/notre-logiciel/), [EDF Communitiz](https://www.edf.fr/entreprises/transition-energetique/energie-verte-et-renouvelable/communitiz).
   - REP eco-contribution calculators: [AlgoREP](https://algorep.ai/fr), [CompliancR](https://www.compliancr.io/blog-post/compliancr-v7-ia-eco-contributions-conformite-rep).
8. **Influencer and ad compliance monitoring.** Reech SocialVox powers the French advertising self-regulator's (ARPP) observatory, with 400,000 pieces of content analysed in 2025. Cape and Autolex cover pre-flight checks ([Reech SocialVox](https://www.socialvox.com/fr/cas-client/arpp), [Cape](https://cape.io/fr/solutions/check-go), [Autolex](https://www.autolex.ai/social-media-compliance)).
9. **A cookie consent manager.** Cookie rules in the broader Digital Omnibus are still being negotiated ([Agence Europe](https://agenceurope.eu/en/bulletin/article/13910/11/digital-omnibus-irish-presidency-consults-eu-countries-on-pseudonymisation-data-processing-for-ai-and-cookies)), and French consent-management platforms are entrenched.
10. **Scope drift.** A B2G version of Host Registry for town halls, or Pixelizer features presented as a new product. Both dilute focus in Q4 2026.
11. **Template kits, PDF packs, Notion templates.** Outside Glint's standards, and AI makes them free.

---

## 6. Suggested sequence (October 2026 to September 2027)

Principles:
- Host Registry keeps first claim on capacity in Q4 2026, because the French national registration teleservice is planned for Q4 2026 (per `PRODUCT.md`).
- One build and one validation at a time, never two builds.
- Extract a shared **Glint Core** (auth, organisations, billing, i18n, due-queue engine, public registry pages, evidence vault, verified-link checker) while building Label Registry, not as a separate project.

| Window | Host Registry | Pixelizer | New bets | Decision gate |
| --- | --- | --- | --- | --- |
| Oct to Nov 2026 | Priority: national teleservice readiness and transition UX | Maintenance and organic SEO only | Label Registry: 20 discovery calls, public readiness check, 3 verifier partners; build starts in week 3 | 3 priced letters of intent by end of November |
| Dec 2026 to Feb 2027 | Transition-window support | Maintenance | Label Registry beta with 3 to 5 schemes. Product Registry interviews (15 brands, 2 federations). Verify sandbox spike once wallets launch. | First paid Label Registry schemes; Product Registry passes or fails its interview criteria |
| Mar to May 2027 | Steady state; new countries only if revenue asks | Maintenance | Product Registry MVP (8 weeks, PrestaShop first) | 3 design partners live; supplier response rate at or above 30% |
| Jun to Sep 2027 | Steady state | Maintenance | Obligations Desk pilot with 3 firms, positioned as the engagement that follows the e-invoicing crunch. Access Desk build only if RGAA 5 is published. | Obligations Desk: 3 paying firms. Access Desk: RGAA 5 published and 5 agency commitments. |
| Continuous | | | Wild bets: time-boxed spikes only (1 week maximum each), triggered by their own signals (EU agentic checkout launch, Data Act switching behaviour) | |

Portfolio target at month 12 (hypothesis): Label Registry at about €7k MRR, Product Registry at €3k to €6k MRR, and Obligations Desk pilots feeding both.

---

## 7. Assumptions to validate before coding

**Cross-cutting**

| Assumption | How to test at zero spend | Pass threshold |
| --- | --- | --- |
| Glint can sell B2B without paid ads | Personal outreach to 50 named targets per bet (email, LinkedIn, federation contacts) | 20% or more reply rate and at least 10 calls |
| Buyers pay for workflow, not documents | State the price in the first call; ask for a letter of intent with that price | At least 3 priced letters of intent per bet before any build |
| "Information, not legal advice" positioning keeps liability manageable | Review terms and in-app wording with a lawyer in the network or a free chamber of commerce (CCI) legal clinic | No blocking objection |
| Solo plus AI can run Host Registry and one build in parallel | Log weekly hours for 4 weeks in Q4 2026 | Host Registry support under 40% of time |
| A shared Glint Core speeds up new products | Measure time to first deploy of Label Registry | Auth, organisations, billing and a public registry page live in under 2 weeks |

**Per bet**

| Bet | Key assumptions to test first |
| --- | --- |
| Label Registry | Owners restructure rather than drop their labels. Independent verifiers accept working inside a third-party platform. A public certificate registry is acceptable to scheme owners (company data, not personal data). |
| Product Registry | Suppliers answer through a portal (response rate of 30% or more). PrestaShop and WooCommerce merchants will install a compliance module. Brands accept one tool across regulations. A generated PPWR DoC is acceptable when the brand reviews and signs it. |
| Obligations Desk | Firms can export client lists with activity code and headcount. SMEs complete a 5-minute questionnaire (25% or more). Profession rules allow the client brief. Firms will resell it as an engagement. |
| Access Desk | RGAA 5 is published on schedule. Agencies pay €99 or more per month for portfolio operations. Automated mapping to RGAA criteria is accurate enough to be trusted, with manual checks clearly separated. |
| Verify | A non-regulated SME verifier can get sandbox access and registration certificates. Per-verification costs leave margin at €0.04. Wallet checks do not hurt checkout conversion. |
| Wild bets | Switch: SMEs act on Data Act rights, not just sentiment. Agent Checkout: EU access opens to non-Shopify merchants. Rules API: at least 5 builders pay for verified rules instead of scraping. |

---

## Appendix: watchlist (not bets yet)

- **Platform Work Directive** (transposition due 2 December 2026). France has not transposed it yet; the only text so far is a private member's bill filed on 23 July 2026 ([Assemblée nationale](https://www.assemblee-nationale.fr/dyn/17/textes/l17b3081_proposition-loi)). Revisit when a government text exists.
- **EU e-declaration for posted workers.** Provisional agreement on 23 June 2026, voluntary for member states ([KPMG](https://kpmg.com/xx/en/our-insights/gms-flash-alert/2026/flash-alert-2026-158.html)). Would reduce the value of multi-country posting tools if widely adopted.
- **ESPR textile delegated act.** Planned for Q3 to Q4 2027 with at least 18 months of transition ([DPP Grid](https://dppgrid.com/resources/espr-textile-dpp-timeline)). A natural later module for Product Registry.
- **CRA main obligations on 11 December 2027** ([Commission guidance, 27 July 2026](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-new-guidance-support-timely-cyber-resilience-act-implementation)). Possible connected-products module for Product Registry, not a standalone product, given the crowded CRA tooling.
