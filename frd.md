# Drive Project – Functional Requirements Document (FRD)

> **Document Purpose**
> This document defines the functional requirements for the Drive Project website. It is intended to be used as a single source of truth for the development team throughout design, implementation, testing, and iteration.

---

## 1. Project Overview

Drive is a full-scale automotive marketplace comparable to AutoTrader, enhanced with optional Web3 capabilities for payments, finance, escrow, and future asset tokenisation.

The platform must support multiple user roles, high transaction volumes, secure payments, and extensible architecture for future financial products.

---

## 2. User Roles & Permissions

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

## 3. Core Functional Modules

### 3.1 Authentication & User Management

* Email/password authentication
* Optional wallet-based authentication (Web3)
* Role-based access control
* Profile management
* Identity verification hooks (KYC-ready)

---

### 3.2 Vehicle Listings

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

### 3.3 Search & Discovery

* Keyword search
* Filters (price, mileage, year, fuel type, location)
* Sorting (price, newest, mileage)
* Pagination and performance optimisation

---

### 3.4 Messaging & Enquiries

* Secure internal messaging system
* Buyer-to-dealer and buyer-to-seller communication
* Notification system (email + in-app)

---

### 3.5 Transactions & Escrow

#### Fiat Mode

* Stripe or equivalent payment processing
* Escrow-style holding until conditions met

#### Web3 Mode

* Wallet connection
* Smart-contract-based escrow
* Conditional release of funds

---

### 3.6 Finance & Banking Module

* Finance application submission
* Credit decision workflow (manual or automated)
* Loan terms presentation
* Acceptance and execution
* Repayment tracking

---

## 4. Web3 Functional Requirements (Phase 1)

* Wallet connection (non-custodial)
* Stablecoin payments
* Smart contract deployment for escrow
* Transaction status tracking
* On-chain/off-chain data synchronisation

---

## 5. Tokenised Assets (Future Phase)

> **Note:** This module is explicitly out of scope for Phase 1.

* NFT or token issuance linked to real-world vehicles
* Custody verification integration
* Fractional ownership support
* Secondary trading marketplace
* Valuation oracle integration

---

## 6. Notifications

* Email notifications for:

  * Account events
  * Messages
  * Transactions
* In-app notification centre

---

## 7. Reporting & Analytics

### Dealer Analytics

* Listing views
* Enquiries
* Conversion metrics

### Platform Analytics

* Total listings
* Transactions volume
* Revenue metrics

---

## 8. Non-Functional Requirements

* Mobile-first responsive design
* High availability and scalability
* Secure data storage
* GDPR-compliant data handling
* Audit logging for financial actions

---

## 9. Assumptions & Constraints

* Web application only (no native apps in Phase 1)
* Compliance handled via third-party providers
* Banking partners provided externally
* Scope changes require formal approval

---

## 10. Acceptance Criteria

* All user roles can complete core workflows
* Payments function correctly in fiat mode
* Web3 payments execute correctly where enabled
* System handles concurrent users reliably

---

## 11. Versioning

* This document will evolve
* Changes must be reviewed and approved
* Git versioning recommended

---

Prepared by:
**Marshall EPIE Technologies**
