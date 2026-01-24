# Deployment Guide

## Overview

This guide covers deploying the Drive platform to production environments.

## Prerequisites

- Domain name configured
- SSL certificates
- Production database provisioned
- Payment processor accounts (Stripe)
- Ethereum node access or Infura/Alchemy account
- CI/CD pipeline configured (optional)

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Smart contracts audited
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup strategy in place
- [ ] Monitoring and logging configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] CORS policies set

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment

```bash
cd apps/web
npm run build
```

### 2. Deploy to Vercel

**Via CLI:**
```bash
npm install -g vercel
vercel --prod
```

**Via GitHub Integration:**
1. Connect repository to Vercel
2. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `cd apps/web && npm run build`
   - Output Directory: `apps/web/.next`
3. Add environment variables in Vercel dashboard

### 3. Environment Variables

Set in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
```

### 4. Custom Domain

1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL certificates auto-provisioned

## Backend Deployment (Railway/Heroku)

### Railway Deployment

1. **Create Railway Project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Configure Build**

   Create `railway.json`:
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "cd apps/api && npm install && npm run build"
     },
     "deploy": {
       "startCommand": "cd apps/api && npm start",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=4000
   railway variables set DATABASE_URL=<your_db_url>
   railway variables set JWT_SECRET=<secure_secret>
   # ... add all other variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create drive-api
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Configure Environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=<secure_secret>
   # ... add all variables
   ```

4. **Create Procfile**
   ```
   web: cd apps/api && npm start
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

## Database Deployment

### Option 1: Supabase

1. Create project at supabase.com
2. Note connection string
3. Run migrations:
   ```bash
   DATABASE_URL=<supabase_url> npm run migrate up
   ```

### Option 2: AWS RDS

1. Create PostgreSQL instance
2. Configure security groups
3. Enable automated backups
4. Set up read replicas for scaling

### Option 3: Render

1. Create PostgreSQL database
2. Note connection details
3. Configure backup schedule

### Database Configuration

**Connection Pooling:**
```javascript
{
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

**SSL Mode (Production):**
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## Smart Contract Deployment

### 1. Audit Contracts

Before mainnet deployment:
- Security audit by reputable firm
- Test on testnet extensively
- Implement upgradability if needed

### 2. Deploy to Mainnet

```bash
cd contracts
npm run deploy:mainnet
```

### 3. Verify on Etherscan

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 4. Update Configuration

Update contract addresses in:
- Backend `.env`: `ESCROW_CONTRACT_ADDRESS`
- Frontend `.env`: `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS`

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build -w @drive/web
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build -w @drive/api
      - uses: railwayapp/railway-deploy@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
```

## Monitoring and Logging

### Application Monitoring

**Recommended Tools:**
- Sentry for error tracking
- DataDog for APM
- LogRocket for session replay

**Setup:**
```bash
npm install @sentry/node @sentry/nextjs
```

### Infrastructure Monitoring

- Vercel Analytics (frontend)
- Railway/Heroku metrics (backend)
- Database metrics dashboard

### Log Aggregation

Configure Winston to send logs to:
- Papertrail
- Logtail
- CloudWatch

## Security Hardening

### API Security

1. **Enable Helmet**
   ```javascript
   app.use(helmet())
   ```

2. **Rate Limiting**
   ```javascript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   })
   app.use(limiter)
   ```

3. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }))
   ```

### Environment Security

- Use secret management service (AWS Secrets Manager, Vault)
- Rotate secrets regularly
- Never commit secrets to Git
- Use different secrets per environment

### Database Security

- Enable SSL connections
- Use strong passwords
- Implement IP whitelisting
- Regular backups
- Encryption at rest

## Backup Strategy

### Database Backups

**Automated Backups:**
- Daily full backups
- Point-in-time recovery enabled
- Retention: 30 days
- Test restore procedures monthly

**Manual Backup:**
```bash
pg_dump -h host -U user -d drive_db > backup.sql
```

### File Backups

- User uploads to S3/CloudStorage
- Versioning enabled
- Lifecycle policies configured

## Disaster Recovery

1. **Document recovery procedures**
2. **Maintain backup contact list**
3. **Test disaster recovery quarterly**
4. **RTO (Recovery Time Objective): 4 hours**
5. **RPO (Recovery Point Objective): 1 hour**

## Performance Optimization

### Frontend

- Enable image optimization
- Implement code splitting
- Use CDN for static assets
- Configure caching headers
- Lazy load components

### Backend

- Database query optimization
- Implement Redis caching
- Use connection pooling
- Enable gzip compression
- CDN for API responses

### Database

- Optimize slow queries
- Add indexes for common queries
- Implement read replicas
- Partition large tables
- Regular VACUUM and ANALYZE

## Scaling Strategy

### Horizontal Scaling

- Multiple API instances behind load balancer
- Database read replicas
- Separate services for heavy operations

### Vertical Scaling

- Increase server resources as needed
- Monitor and adjust based on metrics

### Caching Strategy

- Redis for session storage
- API response caching
- Database query caching

## Post-Deployment

1. **Smoke Tests**
   - Verify all endpoints
   - Test critical user flows
   - Check monitoring dashboards

2. **Performance Testing**
   - Load testing with k6 or Artillery
   - Monitor response times
   - Check error rates

3. **Security Scan**
   - Run OWASP ZAP
   - Check SSL configuration
   - Verify CORS policies

4. **Documentation**
   - Update deployment docs
   - Document any issues
   - Update runbooks

## Rollback Procedure

If deployment fails:

1. **Frontend**: Revert to previous Vercel deployment
2. **Backend**: Rollback to previous Railway/Heroku release
3. **Database**: Restore from backup if needed
4. **Smart Contracts**: Cannot rollback - ensure thorough testing

## Support and Maintenance

- Monitor error rates and performance
- Review logs daily
- Update dependencies monthly
- Security patches applied immediately
- Backup verification weekly
