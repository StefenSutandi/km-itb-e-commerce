# Product Database Integration (Phase 2A)

This document outlines the Phase 2A database integration for the public product catalog and detail pages.

## Architecture

To prevent tight coupling between the Next.js UI components and the raw Prisma database models, we introduced a repository and mapping layer.

1. **Repository Layer (`lib/repositories/product.repository.ts`)**
   - Handles Prisma database queries securely on the server.
   - Provides resilient fallback behavior (returning empty arrays or `null`) instead of throwing exceptions if the database is unavailable, particularly useful during build-time static generation.

2. **Mapping Layer (`lib/mappers/product.mapper.ts`)**
   - Transforms `PrismaProduct` into `UIProduct`.
   - Transforms `PrismaVariant` into `UIProductVariant`.
   - Normalizes images (sorting by primary or order).
   - Computes base prices dynamically from variant prices.
   - Determines `isFeatured` based on categories or lottery tags.

## Migrated Pages

- `/products` (Catalog Page) -> Uses `productRepository.getPublishedProducts()`
- `/products/[slug]` (Detail Page) -> Uses `productRepository.getProductBySlug()`
  - Note: Separated into `page.tsx` (Server) and `product-detail-client.tsx` (Client) to handle both server-side DB fetching and client-side cart/variant state.
- `/` (Home Page) -> Uses `productRepository.getFeaturedProducts()`

## How to Seed Products

The database seed (`prisma/seed.ts`) automatically generates 8 realistic products with variants and images when run:
```bash
npx prisma db seed
```
Products cover various categories (`KM_ITB`, `OFFICIAL_ITB`, `EVENT_POPUP`) and include size/variant combinations.

## Production Safety & Fallbacks

The primary source of truth for products is the PostgreSQL database. However, to simplify local development, demo environments, and static build generation when the database is unavailable, a **Mock Fallback** exists.

- **Development (`NODE_ENV !== "production"`)**: Mock fallback is allowed by default. If the database fails or is empty, the site will render mock products.
- **Production (`NODE_ENV === "production"`)**: Mock fallback is **disabled** by default to prevent silently showing fake data to real users if the database connection drops.
- **`ENABLE_MOCK_FALLBACK`**: You can explicitly control this behavior using the `ENABLE_MOCK_FALLBACK="true"` environment variable (defined in `.env`). 
  - *Risk Warning*: Never set this to "true" in a live production environment unless you intentionally want to serve mock demo data to real users.

## Limitations & Remaining Mock Areas

- **Cart & Checkout**: The add-to-cart buttons on the product detail page are still mock implementations (`console.log`) and do not persist to the database yet.
- **Admin Pages**: Admin pages (`/admin/products`, etc.) still use `mockProducts` and do not perform real CRUD against the Prisma database. This will be addressed in a future phase.
- **Order Flow**: Payments and order processing are still tied to the mock repositories.

## Build Resiliency

During `pnpm build`, if the database is empty or unavailable, the repositories will catch the connection error. If `ENABLE_MOCK_FALLBACK` is permitted (or running locally), it gracefully falls back to returning `mockProducts`. This ensures the site never fails to compile or deploy, allowing for smooth CI/CD transitions until a real production database is fully populated.
