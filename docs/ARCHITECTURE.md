# Drive Platform Architecture

## Overview

Drive is an automotive marketplace platform built as a monorepo with Web3 capabilities. The architecture supports both traditional fiat payments and blockchain-based payments through a dual-mode system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  - Server-side rendering                                     │
│  - Web3 wallet integration (RainbowKit/Wagmi)               │
│  - Responsive UI (Tailwind CSS)                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ REST API / JSON
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   Backend API (Express)                      │
│  - RESTful API endpoints                                     │
│  - JWT authentication                                        │
│  - Role-based access control                                │
│  - Business logic layer                                      │
└─────┬────────────┬────────────┬────────────┬───────────────┘
      │            │            │            │
      │            │            │            │
┌─────▼────┐ ┌────▼─────┐ ┌────▼────┐ ┌────▼─────────────┐
│PostgreSQL│ │  Stripe  │ │Web3     │ │External Services │
│ Database │ │  (Fiat)  │ │Provider │ │ (KYC, Email)     │
└──────────┘ └──────────┘ └────┬────┘ └──────────────────┘
                                │
                          ┌─────▼──────┐
                          │   Smart    │
                          │  Contracts │
                          │  (Escrow)  │
                          └────────────┘
```

## Module Architecture

### Core Modules

1. **Authentication Module**
   - Email/password authentication
   - Optional Web3 wallet authentication
   - JWT token management
   - Role-based permissions

2. **Vehicle Listings Module**
   - CRUD operations for listings
   - Status management (draft, live, sold)
   - Advanced search and filtering
   - Image management

3. **Transaction Module**
   - Dual payment mode support (Fiat/Web3)
   - Escrow management
   - Stripe integration for fiat
   - Smart contract integration for Web3

4. **Finance Module**
   - Application submission
   - Credit workflow
   - Loan management
   - Repayment tracking

5. **Messaging Module**
   - Buyer-seller communication
   - Conversation management
   - Real-time notifications

6. **User Management**
   - Profile management
   - KYC integration
   - Role management

## Data Flow

### Fiat Payment Flow
1. Buyer initiates transaction
2. Backend creates Stripe payment intent
3. Frontend handles Stripe checkout
4. Webhook confirms payment
5. Funds held in escrow
6. Conditions verified (inspection, documents)
7. Funds released to seller

### Web3 Payment Flow
1. Buyer initiates transaction
2. Frontend connects wallet
3. User approves token spending
4. Smart contract creates escrow
5. Funds locked in contract
6. Backend tracks on-chain status
7. Conditions verified
8. Smart contract releases funds

## Security Considerations

- All financial transactions logged in audit_logs table
- Role-based access control enforced at API level
- Input validation using Joi
- SQL injection prevention via parameterized queries
- XSS protection via helmet middleware
- Rate limiting on all endpoints
- Secure password hashing with bcrypt
- JWT tokens with expiration
- Smart contract auditing recommended before mainnet deployment

## Scalability Considerations

- Database indexing on frequently queried fields
- Connection pooling for database
- Horizontal scaling possible for API servers
- CDN for static assets and images
- Redis for caching (optional, container included)
- Message queue for async operations (future enhancement)

## Technology Stack

### Frontend
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- RainbowKit + Wagmi (Web3)
- React Query (state management)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- JWT authentication
- Ethers.js (Web3)

### Smart Contracts
- Solidity ^0.8.20
- Hardhat development framework
- OpenZeppelin contracts
- ERC20 token support (stablecoins)

### Infrastructure
- Docker for local development
- PostgreSQL 16
- Redis 7 (optional caching)

## Deployment Architecture

```
┌────────────┐
│   Vercel   │ ← Frontend deployment
└────────────┘

┌────────────┐
│   Heroku/  │ ← Backend API deployment
│   Railway  │
└────────────┘

┌────────────┐
│  Supabase/ │ ← Database hosting
│    AWS RDS │
└────────────┘

┌────────────┐
│  Ethereum  │ ← Smart contract deployment
│  Network   │
└────────────┘
```

## Future Enhancements

- Tokenized vehicle ownership (NFTs)
- Fractional ownership support
- GraphQL API layer
- Real-time messaging with WebSockets
- Mobile applications (React Native)
- Advanced analytics dashboard
- AI-powered vehicle recommendations
