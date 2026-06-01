# Email Notifications (Phase 5A)

This document describes the simple, zero-dependency, transactional email system implemented in Phase 5A.

## Configuration

Set the following variables in `.env`:
```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."
EMAIL_FROM="orders@yourdomain.com"
```

If these keys are missing or invalid, the system gracefully falls back to mock console logging so that local development remains unblocked.

## Event Triggers

Emails are triggered securely and asynchronously from the server side. A failure to send an email **never** rolls back the underlying database operation. 

1. **Order Created / Waiting Payment**
   - Triggered in `app/checkout/actions.ts` after the cart is checked out and the DB Order is created.
2. **Payment Success**
   - Triggered in `lib/repositories/payment.repository.ts` when a Midtrans webhook transitions the payment into `SUCCESS` and decrements stock.
3. **Manual Review Required**
   - Triggered in `lib/repositories/payment.repository.ts` when a Midtrans webhook transitions the payment into `SUCCESS` but stock is insufficient.
4. **Order Status Updated**
   - Triggered in `lib/repositories/admin-order.repository.ts` when the Admin manually progresses the state machine (e.g. `PAYMENT_RECEIVED` -> `PROCESSING`).
5. **Shipping Receipt Updated**
   - Triggered in `lib/repositories/admin-order.repository.ts` when the Admin adds a shipping receipt, automatically transitioning the order to `SHIPPED`.
6. **Order Cancelled**
   - Triggered in `lib/repositories/admin-order.repository.ts` when the Admin manually cancels the order.

## Duplicate Email Prevention

Webhooks from payment gateways can arrive multiple times. The idempotent check inside `payment.repository.ts` verifies `if (payment.status === PaymentStatus.SUCCESS)` and returns early *before* hitting the email trigger. This natively prevents duplicate "Payment Success" emails.

## Audit and Logging

Every single email attempt (successful or failed) is written to the `NotificationLog` table. This provides a unified history of communication attempts for debugging and customer support. 
- Types logged: `PAYMENT_WAITING`, `PAYMENT_SUCCESS`, `ORDER_STATUS_UPDATED`, `ORDER_CANCELLED`, `MANUAL_REVIEW_REQUIRED`, `SHIPPING_RECEIPT_UPDATED`

## Limitations
- **No SMTP by default**: The current MVP uses a raw `fetch` to `api.resend.com` to achieve a zero-dependency implementation. If a generic SMTP provider is desired, a library like `nodemailer` must be installed.
- **No Templates**: Emails are constructed via raw HTML template literals. No complex MJML or React Email components are used yet.
- **No Resync UI**: There is currently no Admin UI button to manually "Resend" an email if it fails.
