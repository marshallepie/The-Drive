# Development Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Docker & Docker Compose (recommended)
- Git

## Initial Setup

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

   Copy the example environment files:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   cp contracts/.env.example contracts/.env
   ```

   Edit each `.env` file with your configuration.

4. **Start the database**

   Using Docker (recommended):
   ```bash
   docker-compose up -d postgres redis
   ```

   Or install PostgreSQL locally and create the database:
   ```bash
   createdb drive_db
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

## Running the Development Environment

### Option 1: Run all services at once
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:3000
- Backend API at http://localhost:4000

### Option 2: Run services individually

**Frontend:**
```bash
cd apps/web
npm run dev
```

**Backend:**
```bash
cd apps/api
npm run dev
```

**Smart Contracts (local node):**
```bash
cd contracts
npm run node
```

## Project Structure

```
The-Drive/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   └── lib/      # Utilities
│   │   └── package.json
│   └── api/              # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── db/
│       │   └── utils/
│       ├── migrations/   # Database migrations
│       └── package.json
├── packages/
│   └── shared/           # Shared types and utilities
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
├── contracts/            # Smart contracts
│   ├── contracts/        # Solidity files
│   ├── scripts/          # Deployment scripts
│   ├── test/             # Contract tests
│   └── hardhat.config.ts
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── docker-compose.yml
```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit code in the appropriate workspace
   - Follow TypeScript and ESLint rules
   - Add tests for new functionality

3. **Test your changes**
   ```bash
   npm run test
   ```

4. **Lint your code**
   ```bash
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Working with the Database

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

**Connect to database:**
```bash
docker-compose exec postgres psql -U drive_user -d drive_db
```

### Working with Smart Contracts

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

**Deploy to testnet:**
```bash
npm run deploy:sepolia
```

### Adding New Dependencies

**Root-level dependency:**
```bash
npm install <package> -w root
```

**Frontend dependency:**
```bash
npm install <package> -w @drive/web
```

**Backend dependency:**
```bash
npm install <package> -w @drive/api
```

**Shared package dependency:**
```bash
npm install <package> -w @drive/shared
```

## Common Tasks

### Adding a New API Endpoint

1. Define types in `packages/shared/src/types/`
2. Create route handler in `apps/api/src/routes/`
3. Add business logic in controllers/services
4. Add tests
5. Update API documentation in `docs/API.md`

### Adding a New Frontend Page

1. Create page in `apps/web/src/app/`
2. Create components in `apps/web/src/components/`
3. Add API client functions in `apps/web/src/lib/api/`
4. Use shared types from `@drive/shared`

### Updating Database Schema

1. Create migration file in `apps/api/migrations/`
2. Write SQL for changes
3. Test migration up and down
4. Update TypeScript types if needed
5. Update documentation

## Testing

### Backend Tests
```bash
cd apps/api
npm run test
```

### Frontend Tests
```bash
cd apps/web
npm run test
```

### Smart Contract Tests
```bash
cd contracts
npm run test
```

## Debugging

### Backend Debugging
Add breakpoints and run with Node.js debugger:
```bash
cd apps/api
node --inspect -r ts-node/register src/index.ts
```

### Frontend Debugging
Use browser DevTools and React DevTools extension.

### Database Debugging
View query logs in the console or check `apps/api/logs/combined.log`

## Environment Variables Reference

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_CHAIN_ID` - Ethereum chain ID

### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - API port
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `WEB3_PROVIDER_URL` - Ethereum node URL

### Contracts (.env)
- `DEPLOYER_PRIVATE_KEY` - Deployer wallet private key
- `SEPOLIA_RPC_URL` - Sepolia testnet RPC URL
- `ETHERSCAN_API_KEY` - Etherscan API key

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps
# View logs
docker-compose logs postgres
```

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

## Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages (Conventional Commits)
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Use async/await over promises

## Git Workflow

1. Keep commits atomic and focused
2. Write clear commit messages
3. Rebase feature branches before merging
4. Squash commits when appropriate
5. Never commit sensitive data or secrets
