# Database & Authentication Setup Guide

This document outlines the Phase 1 implementation for connecting the KM ITB Merchandise E-commerce platform to a PostgreSQL database and enabling Google OAuth authentication via Auth.js (NextAuth).

## Dependencies Added
- `prisma` and `@prisma/client` for ORM and database management.
- `next-auth@beta` (Auth.js v5) for authentication.
- `@auth/prisma-adapter` to connect NextAuth with Prisma.
- `tsx` for running the database seed script.

## Environment Variables Needed
To run the application locally, you must copy `.env.example` to `.env` and fill in the following values:

```env
# A standard PostgreSQL connection string. 
# You need a running Postgres instance locally or via Docker.
DATABASE_URL="postgresql://postgres:password@localhost:5432/km_itb_ecommerce?schema=public"

# A secure random string for signing JWT tokens. 
# Generate one using: `openssl rand -base64 32`
NEXTAUTH_SECRET="your-secure-random-string"

# Google OAuth Credentials
# Obtain these from the Google Cloud Console (APIs & Services -> Credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Setup Commands

Once your PostgreSQL server is running and the `.env` file is ready, run the following commands in the terminal:

1. **Generate Prisma Client:**
   ```bash
   pnpm prisma generate
   ```

2. **Push the schema to the database:**
   *(Note: For production, use `prisma migrate deploy`, but for initial local dev, `db push` is fine)*
   ```bash
   npx prisma db push
   ```

3. **Seed the database with initial products and users:**
   ```bash
   pnpm run seed
   ```
   *The seed script populates 8 mock merchandise items and placeholder users without passwords (since authentication relies on Google).*

## Authentication Flow & Route Protection

- **OAuth Strategy:** We use the JWT session strategy instead of database sessions. This allows the Next.js `middleware.ts` to execute quickly at the edge without needing a direct database connection.
- **Session Enrichment:** Upon login, the NextAuth callbacks query the `User` table to inject `role`, `profileCompleted`, and `userType` into the JWT token.
- **Profile Completion:** When a new user logs in via Google for the first time, they only provide a basic name and email. Our middleware detects if `profileCompleted` is false and redirects them to `/complete-profile` to fill in their WhatsApp number and shipping address.
- **Route Protection:**
  - `/account/*`: Requires authentication.
  - `/admin/*`: Requires authentication AND the `ADMIN` or `SUPERADMIN` role.
  - `/login`, `/register`: Redirects to the homepage or profile completion if the user is already authenticated.

## Promoting a User to Admin
Since there is no "create admin" UI for security reasons, you must promote a user directly via the database after they have logged in via Google for the first time.

Connect to your database via `psql` or Prisma Studio (`npx prisma studio`) and run:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

## Known Limitations (Phase 1)
- **Product & Cart Data:** While the database schema for products and carts is ready, the frontend catalog (`/products`) and cart (`/cart`) are still using local mock data. This will be wired up in Phase 2.
- **Mock Email Login:** The login page visually shows an email/password form for design consistency, but it is intentionally disabled ("Belum tersedia") as per the PRD requirement to prioritize Google OAuth.
- **OAuth Callbacks:** Make sure to configure the "Authorized redirect URIs" in your Google Cloud Console to `http://localhost:3000/api/auth/callback/google` for local development.
