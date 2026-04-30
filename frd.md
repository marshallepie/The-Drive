# Drive Project – Functional Requirements Document (FRD)

> **Document Purpose**
> This document defines the functional requirements for the Drive Project website. It is intended to be used as a single source of truth for the development team throughout design, implementation, testing, and iteration.

---

## 1. Project Overview

Drive is a full-scale automotive marketplace comparable to AutoTrader, enhanced with optional Web3 capabilities for payments, finance, escrow, and future asset tokenisation.

From Phase 2, Drive expands beyond a domestic marketplace into an **international dealer-to-dealer (B2B) trading platform**, enabling verified dealers worldwide to buy and sell vehicles across borders before listings are made available to the public or sent to auction. The platform handles cross-border pricing automatically, including origin price, VAT export relief, shipping and logistics, import duties, and destination taxes — presenting buyers with two clear prices: the vehicle price at origin and the fully landed (delivered) price at their location.

The platform must support multiple user roles, high transaction volumes, secure payments, and extensible architecture for future financial products.

---

## 2. Current Implementation Status

> **Last Updated:** April 2026

### Phase 1 – Foundation (✅ COMPLETED)

**Authentication & User Management**
- ✅ Email/password authentication (JWT-based)
- ✅ User registration and login
- ✅ Role-based database schema (PUBLIC, DEALER, BANKER, ADMIN)
- ✅ Password hashing with bcrypt
- ✅ Access token and refresh token system
- ✅ Role-based API authorization middleware
- ❌ User profile editing (route stub ready) — Phase 2
- ❌ Wallet-based authentication (Web3) — Phase 3
- ❌ KYC verification integration — Phase 3

**Vehicle Listings**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ All mandatory fields (make, model, year, mileage, price, location, images, description)
- ✅ Multi-image upload system (up to 10 images per listing, 5 MB each, JPEG/PNG/WebP)
- ✅ Dealer and private listings support
- ✅ Full status management (DRAFT, LIVE, RESERVED, SOLD, ARCHIVED)
- ✅ Vehicle image storage and display
- ✅ Currency field per listing (multi-currency DB support in place)

**Search & Discovery**
- ✅ Advanced filtering system (make, model, price range, year range, condition, fuel type, transmission, location)
- ✅ Pagination (12 vehicles per page)
- ✅ Sorting (price, year, mileage, created date)
- ✅ Debounced real-time filtering (800 ms)
- ✅ Max mileage filter
- ✅ URL query param pre-population (home page search passes filters to browse page)
- ❌ Keyword full-text search — Phase 2

**Frontend**
- ✅ Mobile-first responsive design
- ✅ Landing page with hero imagery
- ✅ Hero search overlay (make, max price, condition, fuel type, location) with semi-transparent glass styling
- ✅ Browse vehicles page with filters
- ✅ Vehicle detail pages
- ✅ Create/edit vehicle listing forms
- ✅ User authentication UI (login/register)
- ✅ Navbar with role-based navigation
- ✅ Open Graph and social media meta tags

**Backend API**
- ✅ RESTful API architecture
- ✅ Express.js server
- ✅ PostgreSQL database (Supabase)
- ✅ Session pooler connection
- ✅ CORS configuration
- ✅ Error handling middleware
- ✅ Request validation with Joi
- ✅ Rate limiting with express-rate-limit
- ✅ Security headers with Helmet

**Deployment**
- ✅ Frontend deployed on Netlify (https://the-drive-web3.netlify.app)
- ✅ Backend API deployed on Render (https://the-drive-api.onrender.com)
- ✅ Database hosted on Supabase
- ✅ Environment variable management
- ✅ Automated deployments from GitHub

**Database Schema**
- ✅ Users table (roles, wallet_address, kyc_status, dealership fields)
- ✅ Vehicles table (full spec + currency + all status/condition/fuel/transmission enums including CVT)
- ✅ Transactions table (fiat + Web3 fields, stripe_payment_intent_id, web3_transaction_hash)
- ✅ Finance applications table (status workflow, credit score, employment, loan terms)
- ✅ Loans table (principal, interest_rate, monthly_payment, remaining_balance, status)
- ✅ Loan payments table (per-payment tracking with principal/interest split)
- ✅ Conversations + Messages tables (participant_ids array, message status: SENT/DELIVERED/READ)
- ✅ Audit logs table (JSONB change tracking, entity-type indexed)

**Web3 Foundation (partial — full integration Phase 4)**
- ✅ wagmi + viem + RainbowKit configured (Sepolia testnet + Mainnet)
- ✅ VehicleEscrow.sol smart contract written (full escrow lifecycle, ERC20, platform fee, dispute resolution)
- ✅ wallet_address field in users schema (VARCHAR 42, unique)
- ❌ Wallet connection UI — Phase 4
- ❌ Contract deployment + integration — Phase 4

**Seeded Data**
- ✅ 17 vehicle listings across USA, UK, and Asia
- ✅ 3 dealerships (USA, UK, Asia)
- ✅ Real vehicle images from Unsplash

### Phase 2 – Transactions, Core Platform & International Dealer Trading (🔄 IN PROGRESS)

**Scope:** Two parallel streams. Stream A delivers core platform features (transactions, messaging, admin, notifications, dealer subscription). Stream B delivers the international dealer trading layer. Both streams must complete before Phase 2 is considered done. Route stubs and DB schemas for all items below are already in place — only service logic and UI remain.

#### Stream A — Core Platform Features

- ❌ Internal messaging system — DB schema and route stubs ready, service and UI to build
- ❌ Transaction processing — fiat payments via Stripe (route stubs ready)
- ❌ Fiat escrow functionality — conditional release on buyer + seller confirmation (route stubs ready)
- ❌ Email notifications (account events, messages, transactions)
- ❌ In-app notification centre
- ❌ User profile editing (route stub ready at `PUT /api/v1/users/profile`)
- ❌ Keyword full-text search on vehicle description and make/model
- ✅ Dealer subscription billing (£600/year on registration, £100 rebate per confirmed sale)
- ❌ Dealer analytics dashboard (listings, enquiries, conversion, subscription rebate progress)
- ❌ Admin management panel (user management, listing moderation, platform config)
- ❌ User moderation tools
- ❌ Platform analytics (transaction volume, revenue, subscription revenue, rebate liability)

#### Stream B — International Dealer Trading Platform

**Launch markets:** UK and Asian dealer networks. Additional regions added by admin without code changes.

- ❌ International dealer onboarding & verification (business registration, trading address, bank details)
- ❌ Dealer-only pre-public/pre-auction listing tier with separate wholesale pricing
- ❌ Cross-border pricing engine (dual price display: origin price + DDP delivered price — applies to both dealer and public buyers at their respective price tier; see §4.8)
- ❌ Public international buying — any registered user worldwide buys from any public listing at retail price with full delivered cost calculation
- ❌ VAT export relief calculation and HMRC reclaim workflow (reclaim retained by Drive; see §4.9)
- ❌ Shipping & logistics cost estimator (freight, insurance, port handling — admin-configurable rate tables)
- ❌ Import duty and destination tax calculator (by vehicle HS code and destination country tariff schedule)
- ❌ Multi-currency display and conversion (live exchange rate feed with daily cache fallback)
- ❌ International escrow flow via Drive (offer → acceptance → payment → delivery confirmation → release — both dealer and public buyers)

### Phase 3 – Finance Module, KYC & Identity (🔄 PLANNED)

**Note:** DB schema (finance_applications, loans, loan_payments tables) and all route stubs are already in place — only service logic, UI, and third-party integrations remain.

- ❌ Finance application submission flow (UI + service; route stubs ready)
- ❌ Banker dashboard for loan review
- ❌ Credit decision workflow (manual or automated)
- ❌ Loan terms presentation
- ❌ Repayment tracking (loan_payments table ready)
- ❌ Finance-related notifications
- ❌ Wallet-based authentication (Web3) — moved from Phase 1 pending; requires Phase 4 Web3 work to be underway
- ❌ KYC verification integration (personal identity, third-party provider) — required for international dealer compliance
- ❌ Business entity KYC (for international dealer onboarding)

### Phase 4 – Web3 Integration (🔄 PLANNED)

**Note:** VehicleEscrow.sol smart contract is fully written. wagmi/viem/RainbowKit configuration is in place. Contract deployment, UI integration, and signing flows are all that remain.

- ✅ VehicleEscrow.sol smart contract (written — full escrow lifecycle, ERC20, platform fee, dispute)
- ✅ wagmi + viem + RainbowKit provider configuration
- ❌ Wallet connection UI (MetaMask, WalletConnect via RainbowKit)
- ❌ Contract deployment scripts and address configuration
- ❌ Smart contract escrow integration (backend + frontend)
- ❌ Stablecoin payment processing
- ❌ On-chain transaction tracking
- ❌ Web3 authentication option (wallet-based login, links to existing account)
- ❌ Blockchain transaction history

### Phase 5 – Tokenised Assets (⏸️ FUTURE)

**Status:** Out of scope. Requires legal, custody, and regulatory readiness.
See Section 6 for detailed specification.

---

## 3. User Roles & Permissions

### 2.1 Public User (Buyer / Seller)

* Register and authenticate an account from any country
* Browse and search vehicle listings — domestic and international
* **Buy vehicles from dealers or private sellers anywhere in the world at published retail prices**
* View dual pricing on any listing: the vehicle's origin retail price and the fully landed delivered price to the buyer's registered location (calculated by the pricing engine — see 4.8)
* Create private vehicle listings
* Apply for vehicle finance
* Choose fiat or Web3 payment method (where available)
* Communicate with dealers and sellers
* Complete international purchases through Drive escrow (same flow as dealers but using retail pricing)
* View transaction history

> **Retail vs Dealer pricing:** Public users always see and pay the seller's published retail price as the base for their delivered cost calculation. Dealer-tier wholesale prices are never exposed to public users.

> **Subscription:** Public users and private buyers register and use the platform free of charge. No subscription or membership fee applies.

### 2.2 Dealer

* Register and undergo verification (domestic or international)
* **Pay the £600 annual subscription fee on registration** — this fee is refundable at £100 per vehicle sold through Drive (see 4.10)
* Create and manage dealer profile with verified country of operation
* List, edit, and remove vehicle listings
* Upload vehicle images and documentation
* **Mark listings as available to the international dealer marketplace** (pre-public / pre-auction tier)
* View and respond to cross-border purchase enquiries and offers
* View dual pricing on any listing (origin price + delivered price to their location)
* Initiate and complete cross-border purchases through Drive escrow
* Track their current subscription balance and sales rebate progress from their dashboard
* Manage pricing and promotions
* Access dealer analytics including cross-border trade metrics and subscription rebate history

### 2.3 Banker (Finance Provider)

* Operate in fiat, Web3, or hybrid mode
* Review and approve finance applications
* Issue loans or financing offers
* Manage repayment schedules
* Integrate with smart contracts (Web3 mode)

### 2.4 Administrator

* Manage users and dealers
* Approve or suspend accounts
* Moderate listings
* Configure platform fees
* View platform-wide analytics
* Manage dealer subscription accounts: view status, manually adjust rebate credits (with mandatory audit note), and process renewals or cancellations
* View and manage VAT export relief records: track pending, filed, and settled reclaims per transaction
* Configure and update cross-border rate tables (freight, port fees, import duties, destination taxes) without engineering involvement
* View international trade metrics and subscription revenue reporting

---

## 4. Core Functional Modules

### 4.1 Authentication & User Management

* Email/password authentication
* Optional wallet-based authentication (Web3)
* Role-based access control
* Profile management
* Identity verification hooks (KYC-ready)

---

### 4.2 Vehicle Listings

#### Functional Requirements

* Create vehicle listings with mandatory fields:

  * Make, model, year
  * Mileage
  * Price
  * Location
  * Images
  * Description
* Support dealer and private listings
* Listing status management (draft, live, sold)

---

### 4.3 Search & Discovery

* Keyword search
* Filters (price, mileage, year, fuel type, location)
* Sorting (price, newest, mileage)
* Pagination and performance optimisation

---

### 4.4 Messaging & Enquiries

* Secure internal messaging system
* Buyer-to-dealer and buyer-to-seller communication
* Notification system (email + in-app)

---

### 4.5 Transactions & Escrow

#### Fiat Mode

* Stripe or equivalent payment processing
* Escrow-style holding until conditions met

#### Web3 Mode

* Wallet connection
* Smart-contract-based escrow
* Conditional release of funds

---

### 4.6 Finance & Banking Module

* Finance application submission
* Credit decision workflow (manual or automated)
* Loan terms presentation
* Acceptance and execution
* Repayment tracking

---

### 4.7 International Dealer Marketplace

#### Purpose

A dealer-only trading layer where verified dealers can list, browse, and transact on vehicles internationally before those vehicles are published to the public marketplace or sent to auction. Phase 2 launches with UK and Asian dealer networks; subsequent phases expand to all regions.

#### Listing Tiers

| Tier | Visibility | Price shown | Who can access |
|---|---|---|---|
| **International Dealer** | Verified dealers worldwide | Dealer (wholesale) price | Phase 2 launch market |
| **Domestic Dealer** | Dealers in the same country | Dealer (wholesale) price | Existing |
| **Public** | All registered users globally | Retail price | All users |

A seller assigns a listing to one or more tiers and sets a separate price for each tier. An international dealer listing remains hidden from public search until the seller explicitly promotes it or a configurable exclusivity window expires.

When a listing reaches the **Public** tier, the cross-border pricing engine applies to all users regardless of their location — a public user in Japan browsing a UK listing sees the UK retail price and the full delivered price to Japan, exactly as a dealer would, but based on the retail price rather than the dealer price.

#### Functional Requirements

* Dealers must complete international verification before accessing the dealer marketplace (business registration, proof of trading address, bank account details for the relevant jurisdiction)
* A listing on the international dealer tier must include:
  * Vehicle origin country and location
  * Export readiness status (title clear, no finance outstanding, export documents available)
  * Condition report and full image set
  * Origin price (local currency, inclusive of local VAT/sales tax where applicable)
  * Delivered price(s) automatically calculated by the pricing engine (see 4.8)
* Dealers may submit offers against a listing; the seller accepts, counters, or declines
* Once an offer is accepted, the transaction is locked into Drive escrow (see 4.5)
* A listing is automatically promoted to the next tier (domestic or public) if no dealer transaction is initiated within the seller-configured exclusivity window
* All dealer marketplace activity is audit-logged

---

### 4.8 Cross-Border Pricing Engine

#### Purpose

Automatically calculate and display two prices for every vehicle on the international marketplace — for both **dealer buyers** (using the dealer/wholesale price) and **public buyers** (using the seller's retail price). The formula is identical; only the base price differs.

1. **Origin Price** — the price of the vehicle at its location, in the seller's local currency. For dealer buyers this is the wholesale price; for public buyers this is the published retail price. Dealer prices are never shown to public users.
2. **Delivered Price (DDP — Delivered Duty Paid)** — the fully landed cost of the vehicle at the buyer's registered location, in the buyer's local currency, inclusive of all costs below

#### Delivered Price Components

```
Delivered Price =
  Origin Ex-Tax Price            (origin price minus recoverable origin VAT)
+ Freight & Shipping             (sea / air / road freight by origin–destination pair)
+ Marine / Transit Insurance     (percentage of vehicle value, configurable)
+ Origin Port / Handling Fees    (export clearance, loading, documentation)
+ Destination Port / Handling Fees (import clearance, customs processing)
+ Import Duty                    (by vehicle HS code and destination country tariff schedule)
+ Destination VAT / GST / Sales Tax (applied at destination rate on dutiable value)
+ Drive Platform Fee             (configurable percentage, displayed as a line item)
```

#### Pricing Engine Requirements

* Rates for freight, port fees, import duties, and destination taxes are maintained in an admin-configurable rate table, updateable without a code deployment
* Rates are versioned; a transaction locks in the rates at the time of offer acceptance
* The engine supports at minimum: UK ↔ Japan, UK ↔ South Korea, UK ↔ Singapore, UK ↔ Hong Kong, UK ↔ China, UK ↔ UAE as Phase 2 route pairs — additional routes added by admin without engineering work
* All prices are displayed in both the seller's currency and the buyer's currency using a live exchange rate feed (provider configurable; falls back to a cached daily rate)
* Both the origin price and the delivered price are displayed on every listing detail page, for both dealer and public buyers, whenever the buyer's registered location differs from the vehicle's origin country
* A price breakdown modal is available to all users so they can inspect each cost component of the delivered price
* Dealer-tier prices are suppressed entirely from the public-facing view; a public user only ever sees the retail origin price and their retail delivered price

---

### 4.9 VAT Export Relief & Revenue Recovery

#### Overview

When a vehicle is purchased by an international dealer and exported from the origin country, the origin country's VAT (e.g. UK 20% VAT) may be reclaimed from the relevant tax authority (e.g. HMRC) under zero-rated export rules. **This reclaim is initiated and retained by Drive as platform revenue.** The buyer is not entitled to a VAT refund; the delivered price they pay is calculated on the ex-VAT origin price from the outset.

#### Mechanism

1. **Buyer pays** the Delivered Price (DDP) into Drive escrow via fiat or Web3 mode. The DDP is calculated from the ex-VAT origin price; the buyer never directly pays origin VAT.
2. **Seller is paid** the origin ex-VAT price by Drive upon release of escrow, in line with zero-rated export treatment.
3. **Drive files** the export VAT relief claim with the relevant tax authority (e.g. HMRC in the UK, or equivalent) using the export documentation generated during the transaction.
4. **VAT reclaim proceeds** are credited to Drive's operating account upon settlement by the tax authority. These proceeds are Drive's revenue and are not passed back to the buyer or seller.
5. All export documentation (commercial invoice, bill of lading, customs export declaration) required to substantiate the reclaim is generated by the platform and stored against the transaction record.

#### Administrative Requirements

* Admin panel displays pending, filed, and settled VAT reclaim records per transaction
* Each reclaim record links to the associated transaction and export documents
* Reclaim amounts, filing dates, and settlement dates are tracked for finance reporting
* The system flags transactions where export documentation is incomplete, blocking the reclaim filing until resolved
* Platform must support UK VAT reclaim as a Phase 2 requirement; additional jurisdictions (e.g. EU VAT refund schemes) added in later phases

---

### 4.10 Dealer Subscription & Sales Rebate

#### Overview

Every dealer account is subject to an annual subscription fee of **£600**, charged at registration and on each renewal anniversary. The subscription is partially or fully refundable through a **£100 sales rebate** credited for each vehicle the dealer sells through the Drive platform during that subscription year. A dealer who sells six or more vehicles in a year effectively pays nothing for their subscription.

Public users and private buyers are exempt from all subscription fees and register at no cost.

#### Business Rules

| Scenario | Subscription paid | Sales in year | Rebate earned | Net dealer cost |
|---|---|---|---|---|
| No sales | £600 | 0 | £0 | £600 |
| 3 sales | £600 | 3 | £300 | £300 |
| 6 sales | £600 | 6 | £600 | £0 |
| 10 sales | £600 | 10 | £600 (capped) | £0 |

* The rebate accrues in real time: each confirmed sale (escrow released, transaction complete) adds £100 to the dealer's rebate balance
* The rebate cap per subscription year is £600 — sales beyond six do not generate additional rebate credit
* At the end of the subscription year, the net outstanding subscription balance (£600 minus total rebate earned) is calculated:
  * If the dealer renews, the outstanding balance is carried forward and offset against the new year's £600 charge
  * If the dealer does not renew, the outstanding balance is retained by Drive and any unused rebate credit lapses
* Rebate credits apply only to vehicles sold through Drive's escrow system; off-platform sales do not qualify
* The subscription fee is charged in GBP; for non-UK dealers the equivalent amount in their billing currency is collected at the prevailing exchange rate at time of charge

#### Dealer Dashboard — Subscription Widget

The dealer dashboard must display:

* Subscription status (active / lapsed / pending renewal)
* Subscription year start and end date
* Amount paid for the current year
* Number of qualifying sales this year
* Rebate earned to date (e.g. £300 / £600)
* Net remaining subscription cost (e.g. £300 remaining)
* Progress indicator showing sales needed to reach full rebate (e.g. "3 more sales to cover your subscription")

#### Administrative Requirements

* Admin can view subscription status and rebate balance for any dealer
* Admin can manually adjust rebate credits in exceptional circumstances (e.g. disputed transaction reversal), with a mandatory audit note
* Subscription revenue and rebate liabilities are reported separately in platform finance analytics
* Automated renewal reminder notifications sent to dealers at 30 days and 7 days before expiry
* A dealer whose subscription lapses loses access to listing creation and the international dealer marketplace until renewal; existing live listings are frozen (not deleted)

---

## 5. Web3 Functional Requirements (Phase 4)

* Wallet connection (non-custodial)
* Stablecoin payments
* Smart contract deployment for escrow
* Transaction status tracking
* On-chain/off-chain data synchronisation

---

## 6. Tokenised Assets (Future Phase)

**Status:** Out of scope for Phase 1. This module is isolated and optional.

### 6.1 Purpose

The Tokenised Assets module enables selected classic vehicles to be represented digitally and traded without requiring physical transfer of the vehicle.

### 6.2 Scope Boundaries

* This module is not required for initial platform launch
* Activation requires legal, custody, and insurance partners
* No assumptions are made about regulatory approval in Phase 1

### 6.3 Seller Capabilities

* Submit vehicle for tokenisation review
* Upload ownership documents and provenance
* Agree to custody and vaulting terms
* View token issuance status

### 6.4 Buyer Capabilities

* Browse tokenised classic vehicles
* Purchase fractional ownership tokens
* Purchase 100% ownership (where available)
* Trade tokens on secondary marketplace
* Redeem vehicle when full ownership is acquired

### 6.5 Token Models

* **Single-Asset NFT:** One token representing 100% ownership
* **Fractional Tokens:** Multiple tokens representing proportional economic rights

### 6.6 Custody & Vaulting

* Vehicles are held by approved third-party custodians
* Drive coordinates custody via the Drive Vault service
* Drive does not directly own customer vehicles

### 6.7 Valuation & Data

Tokens reference off-chain vehicle data:

* Appraisals
* Insurance values
* Custody confirmations
* Market pricing determined by trading activity

---

## 7. Notifications

* Email notifications for:

  * Account events
  * Messages
  * Transactions
* In-app notification centre

---

## 8. Reporting & Analytics

### Dealer Analytics

* Listing views
* Enquiries
* Conversion metrics
* Cross-border listing performance (views and enquiries by buyer country)
* Subscription status, rebate earned to date, and net subscription cost for the current year
* Sales history showing which transactions contributed to rebate

### Platform Analytics

* Total listings (domestic and international)
* Transaction volume (domestic and cross-border, broken down by route)
* Revenue metrics including:
  * Gross subscription revenue collected
  * Total rebate liability outstanding (earned but not yet offset)
  * Net subscription revenue (gross minus rebates)
  * Drive platform fees earned per transaction
  * VAT export relief pipeline: total pending reclaims, total filed, total settled, and cumulative VAT revenue recovered

---

## 9. Non-Functional Requirements

* Mobile-first responsive design
* High availability and scalability
* Secure data storage
* GDPR-compliant data handling
* Audit logging for financial actions

---

## 10. Assumptions & Constraints

* Web application only (no native apps in Phase 1)
* Compliance handled via third-party providers
* Banking partners provided externally
* Scope changes require formal approval
* **International trade assumptions (Phase 2):**
  * Freight, duty, and port rate tables are seeded manually by admin for Phase 2 launch routes; automated rate-feed integration is a later phase
  * Drive operates as the export facilitator for VAT reclaim purposes; Drive's legal and tax structure must be confirmed as eligible for zero-rated export treatment before Phase 2 launch
  * VAT reclaim timelines from HMRC (typically 30–90 days) create a float period; Drive's treasury must account for this
  * Phase 2 dealer verification relies on manual document review; automated KYC for business entities is a Phase 3 enhancement
  * Exchange rates used in delivered price calculations are indicative; final rates are locked at the time of offer acceptance and may differ from the displayed estimate

---

## 11. Acceptance Criteria

* All user roles can complete core workflows
* Payments function correctly in fiat mode
* Web3 payments execute correctly where enabled
* System handles concurrent users reliably
* **Phase 2 international trading acceptance criteria:**
  * A verified dealer in Asia can browse UK listings on the international dealer marketplace and see both the UK origin price and the fully itemised delivered price in their local currency
  * A verified dealer in the UK can browse Asian listings and see the equivalent dual pricing to their location
  * The delivered price calculation correctly applies: ex-VAT origin price, freight, insurance, port fees, import duty, and destination tax for all Phase 2 route pairs
  * A complete cross-border transaction (offer → acceptance → escrow payment → delivery confirmation → escrow release) can be executed end-to-end for both dealer and public buyers
  * A public user registered in any country can browse a listing from any other country, see the retail origin price and their fully calculated delivered price, and complete the purchase through Drive escrow
  * Dealer wholesale prices are confirmed not visible at any point in the public user journey
  * The VAT export relief record is generated and linked to the transaction upon export confirmation; the reclaim amount is credited to Drive's account, not the buyer's
  * All cross-border transactions are captured in the audit log with full cost-component breakdown
  * A dealer is charged £600 on registration; their dashboard shows a £0 rebate balance and 6 sales required to cover the subscription
  * After each confirmed sale through escrow, the dealer's rebate balance increases by £100 and the "sales needed" counter decrements accordingly
  * After 6 confirmed sales, the rebate is capped at £600 and the dealer's net subscription cost shows £0
  * A public user can register and complete a purchase without being prompted for any subscription or membership fee

---

## 12. Versioning

* This document will evolve
* Changes must be reviewed and approved
* Git versioning recommended

---

## 13. Drive Vault (Definition)

The Drive Vault is a custody and verification service that coordinates the secure storage, insurance, documentation, and verification of tokenised vehicles.

### Drive Vault Responsibilities

* Coordinate insured vehicle storage with approved custodians
* Maintain custody and chain-of-ownership records
* Verify vehicle existence and condition
* Reference insurance and appraisal updates
* Provide proof-of-custody to the token system

### Explicit Non-Responsibilities

* Drive Vault does not legally own vehicles
* Drive Vault does not issue financial advice
* Drive Vault does not guarantee asset value

---

## 14. Tokenised Vehicle UX Flows (High-Level)

### Seller Flow – Tokenisation

1. Seller selects "Tokenise Vehicle" from dashboard
2. Submits documentation and appraisal
3. Vehicle approved for custody
4. Vehicle transferred to approved vault
5. Tokens issued and listed on Drive

### Buyer Flow – Fractional Purchase

1. Buyer browses tokenised classics
2. Views asset details and vault status
3. Purchases fractional tokens
4. Tokens appear in buyer portfolio
5. Buyer may trade tokens or accumulate ownership

### Buyer Flow – Full Redemption

1. Buyer acquires 100% of tokens
2. Redemption option unlocked
3. Custodian initiates release process
4. Tokens are burned or closed

---

## 15. Communication Guidance (Non-Commitment Framing)

When discussing tokenised vehicles externally, the platform should be described as:

**"A future premium module that enables compliant tokenisation and trading of classic vehicles, subject to legal, custody, and regulatory readiness."**

### No Guarantees Should Be Made Regarding:

* Timelines
* Regulatory approval
* Asset appreciation

---

**Prepared by:**
Marshall EPIE Technologies

**Document Version:** 4.0
**Last Updated:** April 2026

### Change Log

| Version | Date | Summary |
|---|---|---|
| 1.0 | — | Initial draft |
| 2.0 | January 2026 | Implementation status added; tokenisation spec detailed |
| 3.0 | April 2026 | International dealer trading platform added (Phase 2); cross-border pricing engine (§4.8); VAT export relief retained by Drive (§4.9); dealer marketplace tier (§4.7); dealer subscription & sales rebate model (§4.10); public international retail buying; admin role updated; analytics expanded; Phase 2 acceptance criteria updated |
| 4.0 | April 2026 | Full codebase audit against FRD: Phase 1 status corrected (RESERVED/ARCHIVED statuses, CVT, role auth middleware, hero search overlay, URL filter passthrough, Web3 foundation noted); wallet auth + KYC moved from Phase 2 → Phase 3; Phase 2 restructured into Stream A (core platform) and Stream B (international trading) with route-stub and DB-ready notes; Phase 3 expanded with KYC and business entity verification; Phase 4 updated to reflect VehicleEscrow.sol and wagmi/RainbowKit already written; Section 5 heading corrected from "Phase 1" to "Phase 4" (was contradictory); Last Updated date corrected |
