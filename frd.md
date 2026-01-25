# Drive Project – Functional Requirements Document (FRD)

> **Document Purpose**
> This document defines the functional requirements for the Drive Project website. It is intended to be used as a single source of truth for the development team throughout design, implementation, testing, and iteration.

---

## 1. Project Overview

Drive is a full-scale automotive marketplace comparable to AutoTrader, enhanced with optional Web3 capabilities for payments, finance, escrow, and future asset tokenisation.

The platform must support multiple user roles, high transaction volumes, secure payments, and extensible architecture for future financial products.

---

## 2. Current Implementation Status

> **Last Updated:** January 2026

### Phase 1 – Foundation (✅ COMPLETED)

**Authentication & User Management**
- ✅ Email/password authentication (JWT-based)
- ✅ User registration and login
- ✅ Role-based database schema (PUBLIC, DEALER, BANKER, ADMIN)
- ✅ Password hashing with bcrypt
- ✅ Access token and refresh token system
- ❌ Wallet-based authentication (Web3) - Phase 2
- ❌ KYC verification integration - Phase 2

**Vehicle Listings**
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ All mandatory fields (make, model, year, mileage, price, location, images, description)
- ✅ Multi-image upload system (up to 10 images per listing)
- ✅ Dealer and private listings support
- ✅ Status management (DRAFT, LIVE, SOLD)
- ✅ Vehicle image storage and display

**Search & Discovery**
- ✅ Advanced filtering system (make, model, price range, year range, condition, fuel type, transmission, location)
- ✅ Pagination (12 vehicles per page)
- ✅ Sorting (price, year, mileage, created date)
- ✅ Debounced real-time filtering
- ❌ Keyword full-text search - Phase 2

**Frontend**
- ✅ Mobile-first responsive design
- ✅ Landing page with hero imagery
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
- ✅ Users table with role-based fields
- ✅ Vehicles table with full specifications
- ✅ Transactions table (structure ready)
- ✅ Finance applications table (structure ready)
- ✅ Messages/conversations tables (structure ready)
- ✅ Audit logs table (structure ready)

**Seeded Data**
- ✅ 17 vehicle listings across USA, UK, and Asia
- ✅ 3 dealerships (USA, UK, Asia)
- ✅ Real vehicle images from Unsplash

### Phase 2 – Transactions & Communication (🔄 PLANNED)

**Not Yet Implemented:**
- ❌ Internal messaging system (buyer-seller communication)
- ❌ Transaction processing (fiat payments via Stripe)
- ❌ Escrow functionality (fiat mode)
- ❌ Email notifications
- ❌ In-app notification center
- ❌ Dealer analytics dashboard
- ❌ Admin management panel
- ❌ User moderation tools
- ❌ Platform analytics

### Phase 3 – Finance Module (🔄 PLANNED)

**Not Yet Implemented:**
- ❌ Finance application submission flow
- ❌ Banker dashboard for loan review
- ❌ Credit decision workflow
- ❌ Loan terms presentation
- ❌ Repayment tracking
- ❌ Finance-related notifications

### Phase 4 – Web3 Integration (🔄 PLANNED)

**Not Yet Implemented:**
- ❌ Wallet connection (MetaMask, WalletConnect)
- ❌ Smart contract escrow
- ❌ Stablecoin payment processing
- ❌ On-chain transaction tracking
- ❌ Web3 authentication option
- ❌ Blockchain transaction history

### Phase 5 – Tokenised Assets (⏸️ FUTURE)

**Status:** Out of scope. Requires legal, custody, and regulatory readiness.
See Section 5 for detailed specification.

---

## 3. User Roles & Permissions

### 2.1 Public User (Buyer / Seller)

* Register and authenticate an account
* Browse and search vehicle listings
* Buy vehicles from dealers or private sellers
* Create private vehicle listings
* Apply for vehicle finance
* Choose fiat or Web3 payment method (where available)
* Communicate with dealers and sellers
* View transaction history

### 2.2 Dealer

* Register and undergo verification
* Create and manage dealer profile
* List, edit, and remove vehicle listings
* Upload vehicle images and documentation
* View enquiries and messages
* Manage pricing and promotions
* Access dealer analytics

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

## 5. Web3 Functional Requirements (Phase 1)

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

### Platform Analytics

* Total listings
* Transactions volume
* Revenue metrics

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

---

## 11. Acceptance Criteria

* All user roles can complete core workflows
* Payments function correctly in fiat mode
* Web3 payments execute correctly where enabled
* System handles concurrent users reliably

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

**Document Version:** 2.0
**Last Updated:** January 2026
