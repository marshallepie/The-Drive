# Database Migrations

This directory contains database migration files for the Drive platform.

## Setup

1. Create a PostgreSQL database:
```bash
createdb drive_db
```

2. Configure your database connection in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/drive_db
```

## Running Migrations

Apply all migrations:
```bash
npm run migrate up
```

Rollback the last migration:
```bash
npm run migrate down
```

Create a new migration:
```bash
npx node-pg-migrate create migration-name
```

## Migration Files

- `001_initial_schema.sql` - Initial database schema with all core tables

## Schema Overview

### Core Tables
- **users** - User accounts with role-based access
- **vehicles** - Vehicle listings
- **transactions** - Payment and escrow tracking
- **finance_applications** - Finance application submissions
- **loans** - Active loans and repayment tracking
- **loan_payments** - Individual loan payment records
- **conversations** - Messaging conversations
- **messages** - Individual messages
- **audit_logs** - Audit trail for financial operations

### Enums
All enums are defined to match the TypeScript types in the shared package.

### Indexes
Indexes are created on foreign keys and frequently queried fields for optimal performance.
