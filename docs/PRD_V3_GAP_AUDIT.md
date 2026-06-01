# PRD V3 Gap Audit Report

This report audits the current state of the KM ITB Merchandise E-commerce repository against the requirements outlined in PRD V3.

## Requirement Traceability Matrix

| Module | Requirement ID | Requirement Summary | Current Status | Evidence | Gap Explanation | Recommended Task | Priority |
|---|---|---|---|---|---|---|---|
| **1. Landing Page** | REQ-001 | Product slider, feature explanation, header/footer, auth-aware CTA | Partial | `app/page.tsx`, `components/navbar.tsx` | UI exists but is entirely static. Navbar does not dynamically reflect user authentication state. | Integrate authentication state into Navbar. Fetch dynamic product data for slider. | P1 |
| **2. Auth (Register/Login)** | REQ-002 | Registration, Login, user/admin redirect | Missing | No `app/login` or `app/register` | No authentication framework or UI is implemented. | Setup NextAuth/Auth.js with Credentials provider and create auth UI flows. | P0 |
| **3. Google OAuth** | REQ-003 | Google OAuth integration | Missing | N/A | No OAuth configuration. | Add Google Provider to NextAuth and configure GCP credentials. | P0 |
| **4. Legal Pages** | REQ-004 | T&C, Privacy Policy, Kemenwir disclaimer | Missing | N/A | Static pages do not exist. | Create `app/terms`, `app/privacy` pages with provided copy. | P2 |
| **5. Product Catalog** | REQ-005 | Search, category filter, product cards, status, variants | Mock | `app/products/page.tsx`, `components/product-grid.tsx` | UI is built but runs on hardcoded mock data. Search and filters are not wired. | Connect to database. Implement server-side search and filtering via URL params. | P1 |
| **6. Product Detail** | REQ-006 | Image zoom, description, size chart, variants, stock, ETA, lottery, Add to Cart/Buy Now | Mock | `app/products/[slug]/page.tsx` | Hardcoded data. Missing lottery info block. Buy Now flow not functional. | Fetch from DB. Implement image gallery component. Connect to global cart state. | P1 |
| **7. Admin Product Management** | REQ-007 | CRUD, image upload, draft/publish, confirmation popups | Mock | `app/admin/products/*` | UI exists but no backend API or image storage. | Implement API routes, connect to DB, integrate Cloudinary/S3 for uploads. | P0 |
| **8. Cart** | REQ-008 | CRUD items, auto total, checkout CTA | Mock | `app/cart/page.tsx`, `components/cart-summary.tsx` | Uses local/static state. Does not persist across sessions. | Implement global cart context/store (Zustand or DB synced). | P1 |
| **9. Checkout** | REQ-009 | Checkout form, delivery method selection | Mock | `app/checkout/page.tsx` | Form is static and submits to a mock endpoint. | Wire form to real Order creation API. Add dynamic delivery fees. | P1 |
| **10. Midtrans Payment** | REQ-010 | Midtrans integration, 2% fee, waiting/success status | Partial | `app/api/payments/midtrans/create-transaction/route.ts` | Route exists but uses mock DB. | Connect Midtrans webhook to real DB Order status updates. | P0 |
| **11. Order Tracking** | REQ-011 | Visual timeline, unique QR for pickup | Partial | `app/account/orders/[id]/page.tsx` | Timeline is static. QR generation is missing. | Map real DB statuses to timeline. Add `qrcode.react` package. | P1 |
| **12. Admin Order Mgmt** | REQ-012 | Manual status updates, shipping receipt input | Mock | `app/admin/orders/[id]/page.tsx` | Form does not persist to database. | Build API endpoint for order updates and wire UI. | P1 |
| **13. Subsidy Workflow** | REQ-013 | Request form, 2MB doc upload, admin review, due dates | Missing | N/A | Entire workflow is absent. | Add DB schema for subsidies. Build user request form and admin review dashboard. | P2 |
| **14. Reporting & Export** | REQ-014 | Sales recap, revenue stats, PDF/Excel export, QR scan | Mock | `app/admin/reports/page.tsx` | Dashboard has static charts. No export or scan features. | Wire Recharts to DB. Add `xlsx` and `react-to-print`. Implement HTML5 QR scanner. | P2 |
| **15. Email Notifications** | REQ-015 | Emails for payment, order, subsidy, shipping | Missing | N/A | No email provider integrated. | Integrate Resend + React Email. Trigger on relevant API actions. | P1 |
| **16. Database & Arch** | REQ-016 | PostgreSQL, Auth protection, DB schema | Missing | `lib/mock-data.ts` | Uses mock arrays. No ORM setup. | Set up Prisma/Drizzle ORM. Provision PostgreSQL. Implement Route Handlers middleware for auth. | P0 |
| **17. Deployment** | REQ-017 | Server, Proxy, Docker, CI/CD, Monitoring | Missing | N/A | Local dev environment only. | Create `Dockerfile`, setup GitHub Actions CI/CD, prepare Vercel/VPS deployment configs. | P0 |

## Overall Assessment
The repository currently represents a strong UI/UX prototype (MVP) with well-structured Next.js App Router conventions and Shadcn components. However, it lacks all underlying backend infrastructure: Database (ORM), Authentication, File Storage, Email integrations, and actual API integrations. The gap to a production-ready application involves replacing the `lib/repositories/mock.repository.ts` and `lib/mock-data.ts` layers with real persistence mechanisms and implementing the missing Subsidy and Auth modules.
