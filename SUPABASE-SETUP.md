# Supabase Setup Guide

This guide will help you set up Supabase as your database provider for the Drive platform.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: drive-platform (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon in sidebar)
2. Navigate to **Database** section
3. Scroll down to **Connection string**
4. Select **URI** tab
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the database password you created in Step 1

**Important**: Add `?sslmode=require` to the end of your connection string for security:
```
postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

## Step 3: Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New query**
3. Open the file `/apps/api/migrations/supabase-setup.sql` from this project
4. Copy the **entire contents** of that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** button (or press Cmd/Ctrl + Enter)
7. Wait for completion - you should see "Success" message

This will create:
- All database tables (users, vehicles, transactions, etc.)
- All indexes for performance
- All enums for type safety
- All triggers for automatic timestamp updates
- All foreign key relationships

## Step 4: Configure Environment Variables

### Backend (.env)

Create or update `apps/api/.env`:

```bash
# Copy from example
cp apps/api/.env.example apps/api/.env
```

Then edit `apps/api/.env` and update these values:

```env
# Server Configuration
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000

# Database Configuration - USE YOUR SUPABASE CONNECTION STRING
DATABASE_URL=postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-also-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Stripe Configuration (get from Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Web3 Configuration (get from Infura/Alchemy)
WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/your_infura_project_id
ESCROW_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY_FOR_BACKEND=your_backend_wallet_private_key

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

Create or update `apps/web/.env.local`:

```bash
# Copy from example
cp apps/web/.env.example apps/web/.env.local
```

Then edit `apps/web/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Web3 Configuration
NEXT_PUBLIC_ENABLE_WEB3=true
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Chain Configuration (Ethereum Mainnet = 1, Sepolia Testnet = 11155111)
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Smart Contracts (.env)

Create `contracts/.env`:

```bash
# Copy from example
cp contracts/.env.example contracts/.env
```

Then edit `contracts/.env`:

```env
# Deployment Configuration
DEPLOYER_PRIVATE_KEY=your_deployer_wallet_private_key

# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_infura_project_id

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Step 5: Verify Database Connection

Test your connection by running a simple query in the Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all your tables listed:
- audit_logs
- conversations
- finance_applications
- loan_payments
- loans
- messages
- transactions
- users
- vehicles

## Step 6: Enable Row Level Security (Optional but Recommended)

Supabase has Row Level Security (RLS) enabled by default. For development, you can disable it temporarily:

1. In SQL Editor, run:
```sql
-- Disable RLS for all tables (development only!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE finance_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

**Note**: In production, you should enable RLS and create proper policies!

## Troubleshooting

### Can't connect to database
- Verify your connection string is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Check that `?sslmode=require` is at the end
- Verify your IP isn't blocked (Supabase allows all IPs by default)

### Schema creation errors
- Make sure you're running the script in a fresh database
- If you get "already exists" errors, that's okay - it means tables exist
- If you need to reset, you can drop all tables and re-run

### Connection timeout
- Check your internet connection
- Verify the Supabase project is running (not paused)
- Try running a simple query first: `SELECT NOW();`

## Next Steps

After Supabase is set up:

1. Build the shared package: `cd packages/shared && npm run build`
2. Start the backend: `cd apps/api && npm run dev`
3. Start the frontend: `cd apps/web && npm run dev`
4. Visit http://localhost:3000

## Supabase Features You Can Use

Beyond just PostgreSQL, Supabase offers:
- **Authentication**: Built-in auth (can replace JWT if desired)
- **Storage**: File uploads for vehicle images
- **Realtime**: WebSocket subscriptions for live updates
- **Auto-generated REST API**: Alternative to building Express routes
- **Dashboard**: Visual database browser and editor

For now, we're just using it as a PostgreSQL database, but you can explore these features later!

## Database Backup

Supabase automatically backs up your database. You can also:

1. Go to **Settings** > **Database**
2. Scroll to **Backups** section
3. Download manual backups anytime

## Monitoring

View database activity:
1. Go to **Reports** in Supabase dashboard
2. See query performance, API usage, and more
