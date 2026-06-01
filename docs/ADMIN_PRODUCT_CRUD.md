# Admin Product CRUD (Phase 2B)

This document outlines the Phase 2B implementation for the Admin Product Management interface, transitioning from mock data to real PostgreSQL operations via Prisma.

## Architecture

1. **Repository Layer (`lib/repositories/admin-product.repository.ts`)**
   - Admin-specific Prisma operations.
   - Unlike the public repository, it fetches `DRAFT` and `ARCHIVED` products.
   - Performs transaction-safe updates replacing variants and images on edit.

2. **Server Actions (`app/admin/products/actions.ts`)**
   - Provide a secure boundary between the interactive Client Components and the Database.
   - Responsible for data validation, logging audit actions (`PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_ARCHIVED`), and triggering cache revalidation (`revalidatePath`).

3. **UI Components (`components/admin/*`)**
   - `ProductForm`: A single reusable interactive form handling both new product creation and existing product edits, including dynamic variants.
   - `AdminProductsTable`: An interactive table listing products with client-side confirmation dialogs before dispatching server actions.

## Soft Delete & Archive Behavior

To maintain historical data integrity for orders, invoices, and analytics, **hard deletion of products is disabled**. 
Instead, we implemented an **Archive (Soft Delete)** mechanism:
- Clicking "Archive" sets the `ProductStatus` to `ARCHIVED`.
- Archived products instantly disappear from the public catalog (`/products`).
- Archived product detail pages return a standard 404 `notFound()`.
- The products remain visible in the Admin Panel for historical reference.
- Any existing `OrderItem` references to the archived product variants will not break.

## Validation & Forms

- `ProductForm` performs basic HTML5 client-side validation.
- `actions.ts` performs server-side structural checks before database insertion.
- **Images**: Currently uses a comma-separated text input for URLs. This is a deliberate placeholder until the File Storage Integration phase.

## Audit Logging

The following actions are logged securely via `logAuditAction` in `actions.ts`:
- `PRODUCT_CREATED`
- `PRODUCT_UPDATED`
- `PRODUCT_ARCHIVED`
- `PRODUCT_PUBLISHED`

*Limitation Note: Depending on the Auth phase, the `adminId` defaults to the session user ID, or `'system-admin'` if run anonymously.*
