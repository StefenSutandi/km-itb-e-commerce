# Type Architecture

## Overview
This document explains the typing architecture used in the KM ITB E-Commerce project as it transitions from a mock-based prototype to a database-backed production system.

## 1. Prisma Types (Backend/DB Layer)
- **Source:** `@prisma/client` (auto-generated in `node_modules/.prisma/client`)
- **Usage:** Used exclusively in API routes (`app/api/*`) and database repositories (`lib/repositories/db.repository.ts`).
- **Purpose:** Represents the exact schema structure stored in PostgreSQL. These types map 1:1 with the database tables.

## 2. UI Types (Frontend Layer)
- **Source:** `lib/ui-types.ts`
- **Prefix:** All UI types are prefixed with `UI` (e.g., `UIProduct`, `UIOrder`, `UIPaymentStatus`).
- **Usage:** Used across all Next.js React components (`app/*`, `components/*`) and the mock data layer (`lib/mock-data.ts`).
- **Purpose:** Represents the view-models that the frontend components expect. These were originally the prototyping interfaces. They have been namespaced to `UI*` to avoid collisions with Prisma's global types.

## 3. Transition Strategy (Phase 2 & Beyond)
Currently, the application relies on `MockRepository` and `lib/mock-data.ts` to supply `UI`-typed data to the frontend.

In Phase 2 (Product & Order Implementation), we will:
1. Implement real database fetching using Prisma.
2. Build mapping functions (e.g., `mapPrismaProductToUIProduct(product: PrismaProduct): UIProduct`) to cleanly convert raw database records into the shapes expected by the UI.
3. Gradually phase out `MockRepository` while keeping the UI components untouched, as they will continue consuming the `UI*` view-models.

This architectural separation ensures that backend database changes do not unpredictably break the frontend UI components, and allows for a safe, gradual migration.
