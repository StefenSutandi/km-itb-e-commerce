# Midtrans Webhook (Phase 3B)

## Overview
Phase 3B implements the server-side webhook listener to automatically update Payment and Order statuses when Midtrans processes a payment asynchronously (e.g. Virtual Accounts, Gopay, QRIS).

## Webhook Endpoint
**URL**: `https://yourdomain.com/api/payments/midtrans/webhook`
(Set this in the Midtrans Dashboard -> Settings -> Configuration).

## Security: Signature Verification
The webhook payload is verified using `crypto.createHash('sha512')`. The hash consists of `order_id + status_code + gross_amount + server_key`. If the hash does not match `signature_key` from Midtrans, the request is rejected with a `401 Unauthorized` status.

## Status Mapping
- `settlement` | `capture` (with `accept`) -> `PaymentStatus.SUCCESS`
- `pending` -> `PaymentStatus.PENDING`
- `expire` -> `PaymentStatus.EXPIRED`
- `cancel` -> `PaymentStatus.CANCELLED`
- `deny` | `failure` -> `PaymentStatus.FAILED`

## Stock Decrement & Idempotency
Because webhooks can be delivered multiple times by the Midtrans system, the webhook endpoint must be idempotent.
1. When a notification is received, if the database `PaymentTransaction` is *already* `SUCCESS`, the endpoint returns 200 OK immediately and takes no further action.
2. When moving a payment to `SUCCESS`, a Prisma `$transaction` checks `ProductVariant.stock`. 
   - **Sufficient Stock**: Stock is decremented precisely once, and the Order status is advanced to `PAYMENT_RECEIVED`.
   - **Insufficient Stock**: The payment is correctly logged as `SUCCESS`, but the Order status is changed to `MANUAL_REVIEW`. Stock is NOT decremented.

## MANUAL_REVIEW
The `MANUAL_REVIEW` order status is a safety net. It represents a scenario where the buyer successfully transferred money, but a race condition (e.g., someone else bought the last item seconds earlier) caused the stock to deplete. 
When this happens:
- The UI tells the user: "Pembayaran berhasil, tetapi pesanan memerlukan pengecekan admin."
- Administrators must manually investigate and either refund the payment via the Midtrans Dashboard or fulfill the order using alternative inventory.

## Current Limitations (MVP)
- **No Automated Refunds**: If stock is missing, the system marks the order for manual review. It does not automatically trigger an API refund to the customer.
- **No Email Notifications**: Buyers do not receive a success email yet.
- **Admin UI**: There is no Admin UI dashboard yet to view `MANUAL_REVIEW` orders. (Scheduled for Phase 4).

## Testing Locally
To test webhooks locally:
1. Run your Next.js app on port 3000.
2. Use a tool like **ngrok** to expose port 3000 to the internet (`ngrok http 3000`).
3. Copy the ngrok `https` URL and place it in your Midtrans Sandbox Dashboard Webhook URL field: `https://<ngrok-url>.ngrok.app/api/payments/midtrans/webhook`.
4. Trigger a payment using the Sandbox Simulator.
