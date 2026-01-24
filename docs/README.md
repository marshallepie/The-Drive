# Drive Platform Documentation

Welcome to the Drive platform documentation. This directory contains comprehensive guides for developers, architects, and operators working with the Drive automotive marketplace platform.

## Documentation Index

### Core Documentation

- **[Architecture](./ARCHITECTURE.md)** - System architecture, module design, and technology stack overview
- **[API Documentation](./API.md)** - Complete API reference with endpoints, request/response formats, and authentication
- **[Development Guide](./DEVELOPMENT.md)** - Local development setup, workflow, and best practices
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment procedures, security hardening, and scaling strategies

### Project Files

- **[Functional Requirements](../frd.md)** - Detailed functional requirements document
- **[Project Instructions](../CLAUDE.md)** - AI assistant instructions and project context

### Additional Resources

- **[Smart Contracts README](../contracts/README.md)** - Smart contract documentation and deployment
- **[Database Migrations](../apps/api/migrations/README.md)** - Database schema and migration guide

## Quick Start

New to the project? Follow these steps:

1. Read the [Architecture](./ARCHITECTURE.md) document to understand the system design
2. Follow the [Development Guide](./DEVELOPMENT.md) to set up your local environment
3. Review the [API Documentation](./API.md) to understand available endpoints
4. Check the [Deployment Guide](./DEPLOYMENT.md) when ready to deploy

## Project Overview

Drive is a modern automotive marketplace platform that combines traditional e-commerce with Web3 capabilities. Key features include:

- **Dual Payment System**: Support for both fiat (Stripe) and cryptocurrency payments
- **Smart Contract Escrow**: Blockchain-based escrow for secure transactions
- **Finance Module**: Integrated vehicle financing and loan management
- **Role-Based Access**: Four user roles (Public, Dealer, Banker, Administrator)
- **Secure Messaging**: Direct communication between buyers and sellers
- **Mobile-First Design**: Responsive interface for all devices

## Technology Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- RainbowKit + Wagmi for Web3
- React Query for state management

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL database
- JWT authentication
- Ethers.js for Web3 integration

### Smart Contracts
- Solidity ^0.8.20
- Hardhat development framework
- OpenZeppelin contracts
- Support for stablecoins (USDC, USDT, DAI)

### Infrastructure
- Docker for local development
- Vercel for frontend hosting
- Railway/Heroku for backend
- Supabase/AWS RDS for database

## Contributing

When contributing to the project:

1. Follow the development workflow in the [Development Guide](./DEVELOPMENT.md)
2. Ensure code passes linting and tests
3. Update documentation for any API or architecture changes
4. Follow TypeScript and security best practices
5. Write clear commit messages using Conventional Commits

## Security

Security is paramount for financial transactions:

- All financial operations are logged in audit trails
- Role-based access control enforced at all layers
- Input validation and sanitization
- Rate limiting on all endpoints
- Smart contracts require security audits before mainnet deployment

For security concerns, please follow responsible disclosure practices.

## Support

- Issues: Create a GitHub issue
- Documentation: Check this docs folder first
- Development: See [Development Guide](./DEVELOPMENT.md)
- Deployment: See [Deployment Guide](./DEPLOYMENT.md)

## License

[Specify your license here]

## Roadmap

Future enhancements planned:
- Vehicle ownership tokenization (NFTs)
- Fractional ownership support
- GraphQL API layer
- Real-time messaging with WebSockets
- Mobile applications
- Advanced analytics dashboard
- AI-powered recommendations
