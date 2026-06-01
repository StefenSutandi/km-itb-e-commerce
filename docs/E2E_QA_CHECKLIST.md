# End-to-End QA Checklist

This checklist should be executed in the Staging Environment to verify the core transaction flows from end to end.

## 1. Authentication & Profiling
- [ ] **Buyer Login**: Log in as a standard user via Google OAuth.
- [ ] **Complete Profile**: Navigate to `/complete-profile` and enter a WhatsApp number. Ensure it saves successfully.
- [ ] **Admin Login**: Log in with an account that has `ADMIN` or `SUPERADMIN` roles. Ensure `/admin` is accessible.

## 2. Product Management (Admin)
- [ ] **Create Product**: Navigate to `/admin/products/new`. Create a product with a name, description, category, and multiple variants (e.g., Size M, Size L).
- [ ] **Upload Image**: Verify an image URL or upload succeeds.
- [ ] **Publish Product**: Set the product to Active/Published.

## 3. Cart & Checkout (Buyer)
- [ ] **Add to Cart**: As a buyer, browse to the newly published product and add it to the cart.
- [ ] **Persistent Cart**: Refresh the page or log out/in. Verify the item remains in the cart.
- [ ] **Checkout Flow**: Go to `/checkout`. Select a delivery method (e.g., Delivery) and fill out shipping details.
- [ ] **Create Order**: Submit the order. Verify the system redirects to the Order Detail page, and the cart is emptied.
- [ ] **Email Check (Wait for Payment)**: Verify an email arrives stating "Pesanan Anda Diterima".

## 4. Payment Gateway (Midtrans)
- [ ] **Snap Transaction**: On the Order Detail page, click the Midtrans payment button. Verify the Snap interface opens or redirects successfully.
- [ ] **Sandbox Payment**: Use a Midtrans Sandbox test credential (e.g., BCA KlikPay or credit card) to successfully complete the payment.
- [ ] **Webhook Idempotency**: Simulate a duplicate webhook payload using Postman or the Midtrans simulator to the `/api/payments/midtrans/webhook` route. Verify the server returns `idempotent` and does not process it twice.
- [ ] **Stock Decrement**: Check the product variants in the DB. Ensure the stock decreased exactly by the ordered quantity (and didn't double-decrement from the duplicate webhook).
- [ ] **Email Check (Payment Success)**: Verify an email arrives stating "Pembayaran Berhasil".
- [ ] **Order Status**: Refresh the buyer Order Detail page. Verify the status is now `PAYMENT_RECEIVED`.

## 5. Fulfillment (Admin)
- [ ] **View Orders**: Log in as Admin and go to `/admin/orders`. Verify the new order appears with status `PAYMENT_RECEIVED`.
- [ ] **Process Order**: Click into the order and update status to `PROCESSING`.
- [ ] **Prepare for Shipment**: Update status to `READY_TO_SHIP`.
- [ ] **Shipping Receipt**: In the UI, enter a mock receipt number (e.g., `RESI123456`) and save. 
- [ ] **Auto-Transition**: Verify the order automatically transitioned to `SHIPPED`.
- [ ] **Email Check (Shipped)**: Verify the buyer received the shipping notification email.

## 6. Edge Cases & Exception Handling
- [ ] **Cancelled Order Path**: Create a test order, skip payment. As an admin, manually change the status to `CANCELLED`. Verify the cancellation email is sent.
- [ ] **Manual Review Path**: Create a test order for a product that only has 1 stock left. While waiting for payment, manually decrement the DB stock to 0. Then, simulate a successful Midtrans payment. Verify the order enters `MANUAL_REVIEW`, no stock is decremented, and the `MANUAL_REVIEW_REQUIRED` email is sent. As admin, manually resolve it back to `PAYMENT_RECEIVED`.

## 7. Audit Logging
- [ ] **Database Inspection**: Connect to the staging database and inspect `audit_logs` and `notification_logs`. Ensure all major state changes and email attempts are accurately recorded with metadata.
