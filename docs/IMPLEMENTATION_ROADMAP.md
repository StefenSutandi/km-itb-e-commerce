# Implementation Roadmap

This roadmap outlines the phased approach to converting the KM ITB E-commerce MVP into a production-ready application based on PRD V3.

## Phase 1: Database + Auth Foundation
**Objective:** Establish the core data layer, user management, and secure route protection.
- **Files likely affected:** `prisma/schema.prisma` (new), `app/api/auth/[...nextauth]/route.ts` (new), `middleware.ts` (new), `components/navbar.tsx`.
- **Database models needed:** `User`, `Account`, `Session`, `VerificationToken`.
- **API routes needed:** NextAuth standard routes.
- **UI routes affected:** `app/login`, `app/register` (new), `app/page.tsx`, `app/admin/layout.tsx`.
- **Acceptance criteria:**
  - PostgreSQL database connected via Prisma.
  - Users can register and login using Credentials and Google OAuth.
  - Admin routes are protected and redirect unauthorized users.
  - Navbar reflects user login state.
- **Manual test checklist:** Test Google login, credentials login, invalid password, admin access without role, admin access with role.
- **Risks / edge cases:** OAuth credential misconfiguration; handling duplicate emails across providers.

## Phase 2: Product + Cart Persistence
**Objective:** Replace mock product data with real DB queries, build admin product management, and establish cart persistence.
- **Files likely affected:** `app/products/*`, `app/admin/products/*`, `app/cart/page.tsx`, `lib/repositories/product.repository.ts` (new).
- **Database models needed:** `Product`, `ProductVariant`, `Category`, `Cart`, `CartItem`.
- **API routes needed:** `/api/products` (CRUD), `/api/upload` (image).
- **UI routes affected:** Product Catalog, Product Detail, Admin Products, Cart.
- **Acceptance criteria:**
  - Admin can create, edit, and delete products.
  - Images can be uploaded to Cloudinary/S3.
  - Products display correctly on catalog and detail pages.
  - Cart state persists for logged-in users (or via local storage for guests).
- **Manual test checklist:** Upload 3MB image (should fail if limit is 2MB), create product with variants, search product, add to cart, refresh page (cart persists).
- **Risks / edge cases:** Image upload failures, cart merging when a guest logs in.

## Phase 3: Checkout + Midtrans Sandbox
**Objective:** Implement the end-to-end checkout flow and payment gateway integration.
- **Files likely affected:** `app/checkout/page.tsx`, `app/api/orders/route.ts`, `app/api/payments/midtrans/webhook/route.ts`.
- **Database models needed:** `Order`, `OrderItem`, `PaymentDetails`.
- **API routes needed:** `/api/orders`, `/api/payments/midtrans/webhook`.
- **UI routes affected:** Checkout, Order Success page.
- **Acceptance criteria:**
  - Checkout form creates an `Order` in the DB.
  - 2% buyer fee is automatically calculated.
  - Midtrans Snap popup appears.
  - Payment webhook updates Order status in the DB (Waiting -> Success/Failed).
- **Manual test checklist:** Complete checkout, pay with Midtrans Sandbox (credit card/QRIS), verify DB status updates on success and failure.
- **Risks / edge cases:** Webhook failures/timeouts, duplicate webhook events, price mismatch between DB and Midtrans.

## Phase 4: Order Tracking + Admin Operations
**Objective:** Enable users to track orders and admins to process them.
- **Files likely affected:** `app/account/orders/*`, `app/admin/orders/*`.
- **Database models needed:** No new models, update `Order` enum statuses.
- **API routes needed:** `/api/admin/orders/[id]`.
- **UI routes affected:** User Order Detail, Admin Order Detail.
- **Acceptance criteria:**
  - Admins can manually update order statuses and input shipping receipt numbers.
  - Users see visual timeline updates based on DB status.
  - Pickup orders generate and display a unique QR code.
- **Manual test checklist:** Change status to 'Shipped', add receipt number, verify user sees updated timeline, verify QR code renders for 'Pickup' method.
- **Risks / edge cases:** Invalid status transitions (e.g., Shipped -> Waiting Payment).

## Phase 5: Subsidy Workflow
**Objective:** Implement the installment/discount request feature.
- **Files likely affected:** `app/subsidy/*` (new), `app/admin/subsidy/*` (new), `/api/subsidy/route.ts` (new).
- **Database models needed:** `SubsidyRequest`.
- **API routes needed:** `/api/subsidy` (CRUD/Approve/Reject).
- **UI routes affected:** User Subsidy Form, Admin Subsidy Dashboard.
- **Acceptance criteria:**
  - Users can submit requests with up to 2MB document uploads.
  - Admins can approve/reject and set installment due dates.
  - Order totals reflect approved subsidies.
- **Manual test checklist:** Upload 3MB file (should fail), submit valid request, admin approve with specific due date, verify checkout applies discount.
- **Risks / edge cases:** File storage limits, complex discount interactions with cart totals and Midtrans integration.

## Phase 6: Reporting + PDF/Excel + QR Pickup
**Objective:** Build out the admin analytics, export capabilities, and the pickup validation scanner.
- **Files likely affected:** `app/admin/reports/page.tsx`, `app/admin/scan/page.tsx` (new).
- **Database models needed:** None.
- **API routes needed:** `/api/admin/reports`, `/api/admin/scan`.
- **UI routes affected:** Admin Reports, Admin QR Scanner.
- **Acceptance criteria:**
  - Real DB aggregation populates charts with date range filters.
  - Export to Excel and PDF works.
  - Admin can scan user QR code via device camera to validate pickup.
- **Manual test checklist:** Generate report for last 7 days, click Export Excel, print receipt PDF, scan valid QR code, scan invalid QR code.
- **Risks / edge cases:** Large dataset aggregations timing out, browser camera permission handling.

## Phase 7: Email Notification
**Objective:** Implement transactional emails across the platform.
- **Files likely affected:** `lib/emails/*` (new), event triggers in existing API routes.
- **Database models needed:** None.
- **API routes needed:** Integrate into existing webhook/order/subsidy routes.
- **UI routes affected:** None directly.
- **Acceptance criteria:**
  - Emails sent on: Order Placed, Payment Success, Shipping Update, Subsidy Approved/Rejected.
- **Manual test checklist:** Trigger all 4 events and verify email receipt in test inbox (e.g., Mailtrap or Resend test domain).
- **Risks / edge cases:** Spam filters, async email sending failing and crashing the main API thread.

## Phase 8: Deployment + Production Hardening
**Objective:** Prepare for production launch.
- **Files likely affected:** `Dockerfile`, `.github/workflows/deploy.yml`, `next.config.mjs`.
- **Database models needed:** None.
- **API routes needed:** None.
- **UI routes affected:** All (testing responsive design).
- **Acceptance criteria:**
  - Application runs in a Docker container (or deployed seamlessly to Vercel).
  - CI/CD pipeline runs builds and linters on PR.
  - HTTPS/Reverse Proxy configured.
  - All credentials moved to secure Environment Variables.
  - Legal pages (T&C, Privacy Policy) are finalized.
- **Manual test checklist:** End-to-end purchase flow on production staging, test responsive layout on mobile, verify no leaked secrets.
- **Risks / edge cases:** Build step memory limits, database connection pooling exhaustion in serverless environments.
