# Order Creation (Phase 2D)

## Overview
Phase 2D replaces mock order generation with real database-backed order creation from a user's cart. This logic is executed via a secure Prisma transaction.

## Order Snapshotting
To maintain historical accuracy, the `OrderItem` table captures snapshot data at the exact moment of order creation.
- `productName`
- `productSlug`
- `variantName`
- `variantSku`
- `price`
- `subtotal`

This ensures that if a product's name, SKU, or price changes in the future, the old invoice or order detail page remains completely accurate to what the user originally purchased.

## Totals Calculation & Buyer Fee
- Subtotals are calculated dynamically on the server by multiplying each `variant.price` by the cart `quantity`. The client-side totals are completely ignored to prevent tampering.
- A **2% Platform Fee (Buyer Fee)** is automatically applied during order generation. `buyerFee = Math.round(subtotal * 0.02)`.

## Stock Validation vs. Decrement
At this stage (Phase 2D), when an order is created, the system only **validates** that `item.quantity <= variant.stock`.
- **Stock is NOT decremented.**
- The order status is set to `WAITING_PAYMENT`.

**Reasoning**: If a user abandons their checkout after generating a `WAITING_PAYMENT` order, decrementing stock immediately would cause fake stock loss (the items would be stuck forever).

**Phase 3 Implementation Note**: In the next phase (Midtrans Integration), stock will be validated *again* immediately before the payment gateway generates a snap token, and stock will officially be decremented *only upon successful payment webhook receipt*. 

## Cart Clearing
After the Order and OrderItems are created in the database, the user's `CartItem`s are cleared.

## Payment Placeholder
A dummy `PaymentTransaction` row is created alongside the order, with `status: 'WAITING'` and `paymentType: 'MIDTRANS_PLACEHOLDER'`. In Phase 3, this will be replaced with real Midtrans integration.

## Limitations
- Admin Order Management UI is still a mock. Updating Admin orders is scheduled for Phase 4.
- Guest checkouts are not supported yet.
- Checkout vouchers are still a UI placeholder and not validated against a DB table.
