# Midtrans Sandbox Integration (Phase 3A)

## Overview
Phase 3A integrates Midtrans payment gateway to generate Snap URLs for existing `WAITING_PAYMENT` orders. It leverages a secure Server Action to interact with the Midtrans API.

## Environment Variables
Ensure the following variables are set in `.env`:
```env
MIDTRANS_SERVER_KEY="SB-Mid-server-..."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
**Security Note**: Never expose `MIDTRANS_SERVER_KEY` to the client.

## Flow
1. User creates an Order via Cart (Phase 2D). Order is `WAITING_PAYMENT`.
2. User visits `/account/orders/[id]` and clicks **"Bayar Sekarang"**.
3. A Client Component (`MidtransPayButton`) invokes a Server Action (`createMidtransTransactionAction`).
4. The Server Action:
   - Validates that the active user owns the order.
   - Computes the gross amount straight from the database (client amounts are not trusted).
   - Generates a payload (including Platform Fees mapped as item details).
   - Uses `lib/payments/midtrans.ts` (native Fetch) to request a Snap Token using Basic Auth.
5. `PaymentTransaction` in the DB is updated to `PENDING` and saves the `snapToken` and `snapRedirectUrl`.
6. Client is redirected to the `snapRedirectUrl`.

## Midtrans Sandbox Setup
You can test payments using Midtrans Sandbox. 
1. Get keys from the [Midtrans Dashboard](https://dashboard.midtrans.com/settings/config_info).
2. When redirected to the Snap URL, select any payment method (e.g. BCA Virtual Account) and use the [Midtrans Sandbox Simulator](https://simulator.sandbox.midtrans.com/) to simulate a successful payment.

## Current Limitations (Resolved in later phases)
- **No Webhook (Phase 3B)**: If you pay in the sandbox, the system won't know. The Order status remains `WAITING_PAYMENT`.
- **No Stock Decrement**: Stock will only be decremented when the webhook successfully receives the `settlement` payload.
- **No Failure Handling**: If payment expires, the system does not yet automatically cancel the order.
