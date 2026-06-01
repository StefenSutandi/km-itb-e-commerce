# Staging Deployment Guide

This document outlines the steps required to deploy the KM ITB Merchandise E-Commerce platform to a staging environment (e.g., Vercel, Railway, Render).

## 1. Required Services

- **Database**: PostgreSQL database (e.g., Supabase, Neon, Railway).
- **Authentication**: Google Cloud Console project for Google OAuth.
- **Payment Gateway**: Midtrans Sandbox account.
- **Email Service**: Resend account.
- **Hosting**: Vercel (recommended) or any Node.js hosting.

## 2. Environment Setup

Configure the following environment variables in your hosting provider's dashboard:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Application URL
NEXT_PUBLIC_APP_URL="https://staging.yourdomain.com"
NODE_ENV="production"
ENABLE_MOCK_FALLBACK="false"

# Authentication (NextAuth)
AUTH_SECRET="your-secure-random-string-min-32-chars"
NEXTAUTH_SECRET="your-secure-random-string-min-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
MIDTRANS_SERVER_KEY="SB-Mid-server-..."
MIDTRANS_IS_PRODUCTION="false"

# Email Notifications (Resend)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."
EMAIL_FROM="orders@yourdomain.com"
```

## 3. Webhook Setup (Midtrans)

1. Log into Midtrans Sandbox Dashboard.
2. Go to **Settings > Configuration**.
3. Set the **Payment Notification URL** to:
   `https://staging.yourdomain.com/api/payments/midtrans/webhook`
4. Ensure both Client Key and Server Key match your environment variables.

## 4. Build and Deployment Commands

For Vercel, the platform automatically detects Next.js. However, ensure the build command includes Prisma generation:

- **Build Command**: `npx prisma generate && next build`
- **Install Command**: `pnpm install` or `npm install`
- **Output Directory**: `.next`

### Database Migration

Before your first deployment or when schemas change, you must push the schema to your staging database. From your local terminal (connected to staging DB) or via a CI/CD pipeline:

```bash
# Push schema
pnpm prisma db push
```

### Seeding Initial Data

To populate the database with categories, admin user, and sample products:

```bash
pnpm prisma db seed
```

*Note: In production, you may want to skip seeding and manually create the Superadmin via direct DB insertion.*

## 5. Deployment Verification Steps

After deployment completes, verify the following:

1. **Health Check**: Visit `https://staging.yourdomain.com/api/health`. Ensure `database` returns `connected`.
2. **Authentication**: Attempt to log in with a Google account.
3. **Database Access**: Navigate to the products page to verify the DB is returning rows.
4. **Checkout Flow**: Complete a checkout flow and verify that Midtrans opens correctly.
5. **Webhook Simulation**: Complete a sandbox payment in Midtrans, and verify the internal order status transitions to `PAYMENT_RECEIVED` via the webhook.
6. **Email Reception**: Verify an order confirmation email arrives in the associated inbox.
