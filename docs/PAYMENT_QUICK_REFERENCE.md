# Payment System - Quick Reference

## Fast Track: Where to Make Changes

### When Adding Real Midtrans Integration

1. **Get API Keys**
   - Sign up at [Midtrans Dashboard](https://dashboard.midtrans.com/)
   - Copy Server Key & Client Key
   - Add to `.env.local`:
   ```
   MIDTRANS_SERVER_KEY=your_server_key
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
   ```

2. **Enable Real Payments** 
   - Update `.env.local`:
   ```
   MIDTRANS_ENVIRONMENT=sandbox
   NEXT_PUBLIC_REAL_PAYMENT=true
   NEXT_PUBLIC_MOCK_PAYMENT=false
   ```

3. **Implement Snap Token Generation**
   - File: `lib/utils/payment.ts`
   - Function: `generateMidtransSnapToken()`
   - Replace mock implementation with real API call
   - See TODO comments in function

4. **Verify Webhook Signatures**
   - File: `app/api/payments/midtrans/webhook/route.ts`
   - Function: Use `verifyMidtransSignature()` from utils
   - Uncomment signature verification code
   - See TODO comments

5. **Connect to Real Database**
   - Create: `lib/repositories/database.repository.ts`
   - Implement: `IOrderRepository`, `IPaymentRepository`, etc.
   - Update: API routes to use DatabaseRepository instead of MockRepository
   - No changes needed to services!

### When Setting Up Webhook

1. **Get Webhook URL**
   - Local testing: Use [ngrok](https://ngrok.com/) to expose localhost
   - Staging: `https://staging.km-itb.ac.id/api/payments/midtrans/webhook`
   - Production: `https://km-itb.ac.id/api/payments/midtrans/webhook`

2. **Configure in Midtrans Dashboard**
   - Go to: Settings → Notification URL
   - POST URL: Your webhook URL
   - HTTP Method: POST
   - Active: Yes

3. **Test Webhook**
   ```bash
   # Send test webhook
   curl -X POST http://localhost:3000/api/payments/midtrans/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "transaction_id": "test-123",
       "order_id": "KM-20240512-ABC123",
       "transaction_status": "settlement",
       "status_code": "200",
       "gross_amount": "400000.00",
       "signature_key": "mock-sig"
     }'
   ```

## Service Usage Examples

### Create Order
```typescript
import { OrderService } from '@/lib/services/order.service'
import { getMockRepository } from '@/lib/repositories/mock.repository'

const repo = getMockRepository()
const orderService = new OrderService(repo, repo, repo)

const order = await orderService.createOrder({
  userId: 'user-123',
  items: [
    {
      id: 'cart-1',
      productId: 'prod-1',
      variantId: 'var-1',
      quantity: 2,
      addedAt: new Date(),
    },
  ],
  deliveryMethod: 'DELIVERY',
  voucherCode: 'WELCOME10',
})
```

### Create Payment Transaction
```typescript
import { PaymentService, MockMidtransGateway } from '@/lib/services/payment.service'
import { getMockRepository } from '@/lib/repositories/mock.repository'

const repo = getMockRepository()
const paymentService = new PaymentService(repo, new MockMidtransGateway())

const { payment, redirectUrl, token } = await paymentService.createMidtransTransaction(
  order,
  'buyer@example.com',
  '08123456789',
  'John Doe',
)

// Redirect user to redirectUrl
```

### Handle Webhook
```typescript
// File: app/api/payments/midtrans/webhook/route.ts
const payment = await paymentService.handleMidtransWebhook(
  orderId,
  transactionStatus, // 'settlement', 'capture', 'deny', etc.
  grossAmount,
  signature,
)

// Payment status is now updated in database
// Next: Update order status (see TODO comments)
```

### Update Order Status (Admin)
```typescript
import { OrderStatus } from '@/lib/types'

const updatedOrder = await orderService.updateOrderStatus(
  'order-1715500800000-abc123',
  OrderStatus.PROCESSING,
)
```

## Key Files & Their Purpose

| File | Purpose | What to Change |
|------|---------|-----------------|
| `lib/types.ts` | All TypeScript interfaces | Add new fields here first |
| `lib/services/order.service.ts` | Order business logic | Already complete, rarely needs changes |
| `lib/services/payment.service.ts` | Payment processing | TODO: Status mapping, idempotency |
| `lib/repositories/mock.repository.ts` | In-memory storage | Copy & create `database.repository.ts` when using real DB |
| `lib/utils/payment.ts` | Payment utilities | TODO: Real Midtrans API calls |
| `lib/config/payment.config.ts` | Configuration | Update settings here |
| `app/api/orders/create/route.ts` | Create order | TODO: Add Zod validation |
| `app/api/payments/midtrans/create-transaction/route.ts` | Create payment | TODO: Real Midtrans integration |
| `app/api/payments/midtrans/webhook/route.ts` | Handle webhook | TODO: Signature verification, idempotency |

## Common Tasks

### Add New Order Status
1. Add to `OrderStatus` enum in `lib/types.ts`
2. Add validation in `OrderService.validateStatusTransition()`
3. Update order status filter UI components

### Add New Payment Method
1. Add to service: `PaymentService`
2. Create new API route: `app/api/payments/{method}/...`
3. Update `PaymentStatus` enum if needed
4. Add to config: `PAYMENT_CONFIG.PAYMENT.ENABLED_METHODS`

### Add Voucher Type
1. Already supports: FIXED & PERCENTAGE discount types
2. To add new type: Update `Voucher` interface and calculation logic in `OrderService.calculateCheckout()`

### Send Payment Confirmation Email
1. TODO: Implement in webhook handler
2. Use email service (Resend, SendGrid, etc.)
3. Send template: Order confirmed + payment details
4. Send to: customer.email

### Add Admin Payment Override
1. Already exists: `PaymentService.updatePaymentStatus()`
2. Create UI component for admin dashboard
3. Add validation to prevent invalid transitions
4. Log all overrides for audit trail

## Testing With Mock Data

### Included Mock Products
- **KM ITB Hoodie** (prod-1): 350,000 IDR
  - Variants: M Black, L Black, M White
- **KM ITB T-Shirt** (prod-2): 150,000 IDR
  - Variants: S, M, L
- **KM ITB Cap** (prod-3): 100,000 IDR
  - Variants: One Size

### Included Mock Vouchers
- **WELCOME10**: 10% off (min 100k, max 10% off)
- **SAVE50K**: Fixed 50k off (min 300k purchase)

### Test Scenarios
```typescript
// Scenario 1: Order with pickup (no shipping)
const order = await orderService.createOrder({
  deliveryMethod: 'PICKUP',
  items: [{ quantity: 2, variantId: 'var-1' }],
  // Result: subtotal + tax (no shipping)
})

// Scenario 2: Order with voucher
const order = await orderService.createOrder({
  voucherCode: 'WELCOME10',
  items: [{ quantity: 1, variantId: 'var-1' }],
  // Result: applies 10% discount
})

// Scenario 3: Full checkout flow
const order = await orderService.createOrder({ ... })
const payment = await paymentService.createMidtransTransaction(order, ...)
// Simulate webhook
await paymentService.handleMidtransWebhook(...)
```

## Debugging Tips

### Check Mock Data
```typescript
const repo = getMockRepository()
const order = await repo.getById('order-123')
console.log(order) // See full order details

// List all orders
const orders = await repo.getAll()
console.log(orders)
```

### Trace Payment Flow
```typescript
// Add these logs to services/payment.service.ts
console.log('[v0] Creating transaction for order:', order.id)
console.log('[v0] Webhook received:', { transactionStatus, orderId })
console.log('[v0] Payment updated:', { paymentId, newStatus })
```

### Verify Calculation
```typescript
const checkout = await orderService.calculateCheckout(
  items,
  'DELIVERY',
  'WELCOME10',
)
console.log({
  subtotal: checkout.subtotal,      // 700000
  tax: checkout.tax,                // 70000
  shipping: checkout.shippingCost,  // 50000
  discount: checkout.discountAmount, // 82000 (10% of subtotal+tax+shipping)
  total: checkout.total,            // 738000
})
```

## Error Handling

### Order Creation Fails
- Check: Products exist (`getById` returns null?)
- Check: Variant exists (`getVariantById` returns null?)
- Check: Voucher code valid (check expiry date)
- Check: Stock available in variant

### Payment Transaction Fails
- Check: Order status is WAITING_PAYMENT
- Check: Midtrans environment set correctly
- Check: API keys configured in env
- Check: Webhook URL reachable from internet

### Webhook Not Processing
- Check: Webhook URL configured in Midtrans dashboard
- Check: Signature verification enabled/disabled (both ok for testing)
- Check: API returning 200 OK to Midtrans
- Check: Database available for updates
- Check: Logs for error messages

## Performance Notes

- **Mock Repository**: O(1) lookups for most operations (using Maps)
- **List operations**: O(n) but acceptable for prototype
- **Sorting**: In-memory after fetch (efficient for small datasets)
- When switching to DB: Add pagination & indexes for large datasets

## Security Checklist

- [ ] `MIDTRANS_SERVER_KEY` is never logged or exposed
- [ ] Webhook signature verification implemented
- [ ] Order totals validated server-side
- [ ] Customer can only see their own orders
- [ ] Admin endpoints protected by auth
- [ ] All inputs validated with Zod
- [ ] SQL injection prevented (using Prisma/ORM)
- [ ] CSRF protection on forms
- [ ] Rate limiting on payment endpoints
- [ ] All payment logs have audit trail

## Next Session Checklist

Before closing, confirm:
- [ ] All environment variables documented in `.env.example`
- [ ] API routes have consistent error handling
- [ ] Services are properly abstracted (can swap implementations)
- [ ] Mock data covers main use cases
- [ ] TODO comments mark all integration points
- [ ] Tests pass (when added)
- [ ] Documentation is up-to-date

---

**Created:** May 12, 2024  
**Keep This Open:** While implementing real Midtrans integration
