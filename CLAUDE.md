# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Drive is an automotive marketplace platform comparable to AutoTrader, with optional Web3 capabilities for payments, finance, escrow, and future asset tokenization. The platform is currently in the planning phase with a complete FRD (frd.md) defining requirements.

## Architecture Concepts

### User Role System
The platform requires a role-based access control system supporting four distinct roles:
- **Public User (Buyer/Seller)**: Browse, buy, sell, apply for finance, manage payments
- **Dealer**: Manage listings, handle enquiries, access analytics
- **Banker (Finance Provider)**: Review/approve finance applications, manage loans
- **Administrator**: Platform management, user moderation, analytics

### Dual-Mode Payment Architecture
The system must support both traditional and Web3 payment flows:
- **Fiat Mode**: Traditional payment processing (Stripe or equivalent) with escrow
- **Web3 Mode**: Wallet connection, smart contract escrow, stablecoin payments
- Both modes must coexist, user-selectable per transaction

### Core Module Boundaries
- **Authentication**: Email/password + optional wallet-based auth, KYC-ready hooks
- **Vehicle Listings**: Dealer and private listings, status management (draft/live/sold)
- **Search & Discovery**: Filtered search with pagination optimization
- **Messaging**: Internal secure messaging between buyers/sellers/dealers
- **Transactions & Escrow**: Conditional fund release in both fiat and Web3 modes
- **Finance Module**: Application submission, credit workflow, loan terms, repayment tracking

### Web3 Integration Points
Phase 1 Web3 requirements:
- Non-custodial wallet connection
- Stablecoin payment support
- Smart contract escrow deployment
- On-chain/off-chain data synchronization
- Transaction status tracking

Note: Tokenized assets (NFTs, fractional ownership) are explicitly out of scope for Phase 1.

### Data Flow Considerations
- High transaction volume support required
- Audit logging mandatory for all financial actions
- GDPR-compliant data handling
- Mobile-first responsive design
- Notification system (email + in-app) for account events, messages, transactions

### External Dependencies
- Third-party compliance providers
- External banking partners for finance module
- Payment processors (Stripe for fiat, Web3 provider for crypto)
- KYC/verification services

## Development Approach

When implementing features, ensure:
- Role-based permissions are enforced at both API and UI levels
- Payment mode (fiat/Web3) can be toggled without affecting core business logic
- All financial transactions include audit trails
- Escrow conditions are clearly defined and testable
- The system is architected for future tokenization features without requiring rewrites
