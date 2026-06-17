# Drive - Automotive Marketplace Platform

A modern automotive marketplace platform with integrated Web3 capabilities, supporting both traditional fiat and cryptocurrency payments for vehicle transactions.

## Features

- **Dual Payment System**: Accept both traditional payments (Stripe) and cryptocurrency (stablecoins)
- **Smart Contract Escrow**: Blockchain-based escrow with conditional fund release
- **Vehicle Financing**: Integrated finance application and loan management system
- **Role-Based Access**: Four distinct user roles (Public, Dealer, Banker, Administrator)
- **Secure Messaging**: Direct communication between buyers and sellers
- **Advanced Search**: Comprehensive filtering and search capabilities
- **Mobile-First**: Responsive design optimized for all devices
- **Audit Trail**: Complete logging of all financial transactions

## Technology Stack

### Frontend
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [RainbowKit](https://www.rainbowkit.com/) + [Wagmi](https://wagmi.sh/) - Web3 wallet integration
- [React Query](https://tanstack.com/query) - Data fetching and state management

### Backend
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) - Server framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [JWT](https://jwt.io/) - Authentication
- [Ethers.js](https://docs.ethers.org/) - Web3 integration

### Smart Contracts
- [Solidity ^0.8.20](https://soliditylang.org/) - Smart contract language
- [Hardhat](https://hardhat.org/) - Development environment
- [OpenZeppelin](https://www.openzeppelin.com/contracts) - Secure contract libraries

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (recommended)
- PostgreSQL 14+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd The-Drive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example files
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   cp contracts/.env.example contracts/.env
   ```

   Edit each `.env` file with your configuration.

   For the temporary invited-access gate on the web app, also set:
   ```bash
   DRIVE_PREVIEW_USERNAME=[REDACTED]
   DRIVE_PREVIEW_PASSWORD=[REDACTED]
   ```

4. **Start the database**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d postgres redis

   # Or run the setup script
   chmod +x scripts/setup-db.sh
   ./scripts/setup-db.sh
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   npm run migrate up
   cd ../..
   ```

6. **Build shared packages**
   ```bash
   cd packages/shared
   npm run build
   cd ../..
   ```

7. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## Project Structure

```
The-Drive/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/        # App router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/        # Utilities and API clients
│   │   └── package.json
│   └── api/                 # Express backend API
│       ├── src/
│       │   ├── routes/     # API route handlers
│       │   ├── middleware/ # Express middleware
│       │   ├── db/         # Database configuration
│       │   └── utils/      # Utility functions
│       ├── migrations/      # Database migrations
│       └── package.json
├── packages/
│   └── shared/              # Shared TypeScript types and utilities
│       ├── src/
│       │   ├── types/      # Type definitions
│       │   ├── constants/  # Shared constants
│       │   └── utils/      # Utility functions
│       └── package.json
├── contracts/               # Smart contracts (Solidity)
│   ├── contracts/          # Solidity source files
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   ├── API.md              # API documentation
│   ├── DEVELOPMENT.md      # Development guide
│   └── DEPLOYMENT.md       # Deployment guide
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Docker services
└── package.json            # Root package.json (monorepo)
```

## Development

### Running Individual Services

**Frontend only:**
```bash
cd apps/web
npm run dev
```

**Backend only:**
```bash
cd apps/api
npm run dev
```

**Smart contracts (local node):**
```bash
cd contracts
npm run node
```

### Available Scripts

From the root directory:

- `npm run dev` - Start all development servers
- `npm run build` - Build all projects
- `npm run test` - Run all tests
- `npm run lint` - Lint all projects
- `npm run clean` - Clean all build artifacts and node_modules

### Database Operations

**Create a new migration:**
```bash
cd apps/api
npx node-pg-migrate create migration-name
```

**Run migrations:**
```bash
npm run migrate up
```

**Rollback migration:**
```bash
npm run migrate down
```

### Smart Contract Development

**Compile contracts:**
```bash
cd contracts
npm run compile
```

**Run tests:**
```bash
npm run test
```

**Deploy to local network:**
```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Architecture Overview](./docs/ARCHITECTURE.md) - System design and architecture
- [API Reference](./docs/API.md) - Complete API documentation
- [Development Guide](./docs/DEVELOPMENT.md) - Detailed development workflow
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Smart Contracts](./contracts/README.md) - Contract documentation
- [Database Migrations](./apps/api/migrations/README.md) - Database schema guide

## Key Features Explained

### Dual Payment System

The platform supports two payment modes:

1. **Fiat Mode**: Traditional payment processing via Stripe
   - Credit/debit card payments
   - Bank transfers
   - Stripe escrow management

2. **Web3 Mode**: Cryptocurrency payments via smart contracts
   - Non-custodial wallet connection
   - Stablecoin payments (USDC, USDT, DAI)
   - Smart contract escrow with conditional release
   - On-chain transaction verification

### Role-Based Access Control

Four distinct user roles:

- **Public User**: Browse, buy, sell vehicles, apply for financing
- **Dealer**: Manage multiple listings, access analytics, handle enquiries
- **Banker**: Review/approve finance applications, manage loans
- **Administrator**: Platform management, user moderation, system configuration

### Smart Contract Escrow

The `VehicleEscrow` contract provides secure transaction handling:

- Conditional fund release based on:
  - Vehicle inspection verification
  - Document verification
  - Buyer confirmation
  - Seller confirmation
- Dispute handling mechanism
- Platform fee collection (configurable, default 2.5%)
- Support for multiple stablecoins

### Finance Module

Complete financing workflow:

- Finance application submission
- Credit review process
- Loan approval/rejection
- Automated payment tracking
- Repayment schedule management

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Backend (.env)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://drive_user:drive_password@localhost:5432/drive_db
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/your_project_id
```

### Contracts (.env)

```env
DEPLOYER_PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_api_key
```

See `.env.example` files in each workspace for complete variable lists.

## Testing

**Run all tests:**
```bash
npm run test
```

**Backend tests:**
```bash
cd apps/api
npm run test
```

**Frontend tests:**
```bash
cd apps/web
npm run test
```

**Smart contract tests:**
```bash
cd contracts
npm run test
```

## Deployment

See the [Deployment Guide](./docs/DEPLOYMENT.md) for detailed production deployment instructions.

### Quick Deployment Steps

1. **Frontend**: Deploy to Vercel
2. **Backend**: Deploy to Railway or Heroku
3. **Database**: Use Supabase, AWS RDS, or Render
4. **Smart Contracts**: Deploy to Ethereum mainnet (after audit)

## Security

- All financial transactions are logged in audit trails
- Role-based access control enforced at API and UI levels
- Input validation and sanitization
- Rate limiting on all endpoints
- SQL injection prevention via parameterized queries
- XSS protection via helmet middleware
- Smart contracts use OpenZeppelin security standards

**Important**: Smart contracts must be audited by a reputable security firm before mainnet deployment.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read the [Development Guide](./docs/DEVELOPMENT.md) for coding standards and best practices.

## Roadmap

### Phase 1 (Current)
- [x] Core marketplace functionality
- [x] Dual payment system (Fiat + Web3)
- [x] Smart contract escrow
- [x] Finance module
- [ ] Complete authentication system
- [ ] Complete API endpoints

### Phase 2 (Future)
- [ ] Vehicle ownership tokenization (NFTs)
- [ ] Fractional ownership support
- [ ] Real-time messaging with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile applications (React Native)
- [ ] AI-powered vehicle recommendations

## License

[Specify your license here]

## Support

- Documentation: See `/docs` directory
- Issues: Create a GitHub issue
- Development: See [Development Guide](./docs/DEVELOPMENT.md)
- API: See [API Documentation](./docs/API.md)

## Acknowledgments

- Built with modern web technologies
- Smart contracts based on OpenZeppelin
- Web3 integration via RainbowKit and Wagmi
- Inspired by platforms like AutoTrader with Web3 enhancements

---

Made with ❤️ for the automotive and Web3 communities
