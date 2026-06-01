# Admin Order Management (Phase 4A)

## Overview
Phase 4A transitions the administrative order pages (`/admin/orders`) to a database-backed system. Administrators can view, filter, and progress orders through their fulfillment states.

## Security & Architecture
- **Server Actions**: All updates (`updateOrderStatusAction`, `updateShippingReceiptAction`) strictly verify that the invoking user possesses the `ADMIN` or `SUPERADMIN` role via `auth()`.
- **Database Repository**: The `AdminOrderRepository` abstracts Prisma queries and enforces the state machine.

## Status Transition Matrix
The system applies a strict state machine to prevent illegal status leaps.

| Current Status | Allowed Next Statuses | Notes |
|---|---|---|
| `WAITING_PAYMENT` | `CANCELLED` | Cannot be manually advanced to `PAYMENT_RECEIVED` (truth remains with Midtrans Webhook). |
| `MANUAL_REVIEW` | `PAYMENT_RECEIVED`, `CANCELLED` | Resolved after admin verifies stock or issues refund. |
| `PAYMENT_RECEIVED` | `PROCESSING`, `CANCELLED` | Indicates fulfillment process has begun. |
| `PROCESSING` | `READY_FOR_PICKUP` (Pickup), `READY_TO_SHIP` (Delivery), `CANCELLED` | Branches based on user's selected delivery method. |
| `READY_TO_SHIP` | `SHIPPED` | *Requires* a valid shipping receipt via `updateShippingReceiptAction`. |
| `READY_FOR_PICKUP`| `COMPLETED` | Once buyer retrieves the item. |
| `SHIPPED` | `COMPLETED` | Once package arrives. |
| `COMPLETED` | None | Terminal State. |
| `CANCELLED` | None | Terminal State. |

## Feature Behaviors
### Order List
- Orders are sorted by newest.
- Summarized stats (Pending, Completed, Manual Review).
- `MANUAL_REVIEW` rows are distinctly colored.

### Order Details
- Admin can review all snapshot items, current payment status, delivery address, and buyer details.
- Status Modal dynamically calculates allowed transitions based on `deliveryMethod`.
- Delivery orders in `READY_TO_SHIP` exhibit a receipt input field. Submitting this field automatically progresses the order to `SHIPPED`.

### Audit Logging
Any state change performed by an administrator writes an `AuditLog` entry into the database. Types tracked:
- `ORDER_STATUS_UPDATED`
- `SHIPPING_RECEIPT_UPDATED`
- `ORDER_CANCELLED`
- `MANUAL_REVIEW_RESOLVED`

## Limitations (MVP)
- **Refund Processing**: Must still happen manually in the Midtrans dashboard; no APIs for automated refund yet.
- **QR Pickup Scanner**: Not implemented yet.
- **Email Notifications**: Status changes do not trigger user emails yet.
