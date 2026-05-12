# Midtrans Integration Checklist

Complete step-by-step guide to integrate real Midtrans payments into your application.

## Phase 1: Midtrans Account Setup

### Step 1.1: Create Midtrans Account
- [ ] Go to https://midtrans.com
- [ ] Click "Sign Up"
- [ ] Fill in required information
- [ ] Choose business type
- [ ] Verify email address
- [ ] Complete KYC (Know Your Customer) verification

### Step 1.2: Access Dashboard
- [ ] Log in to https://dashboard.midtrans.com
- [ ] Complete merchant profile
- [ ] Add company details
- [ ] Add bank account for settlements
- [ ] Set up webhook URL (keep for later)

### Step 1.3: Get API Credentials (Sandbox)
- [ ] Go to Settings → Config Info
- [ ] Copy **Server Key** (keep secret!)
- [ ] Copy **Client Key** (safe to expose)
- [ ] Note: Sandbox and Production have different keys

### Step 1.4: Get API Credentials (Production)
- [ ] Go to Settings → General Settings
- [ ] Switch environment to "Production"
- [ ] Go to Settings → Config Info
- [ ] Copy **Production Server Key**
- [ ] Copy **Production Client Key**
- [ ] Note: Only do this when ready to go live

## Phase 2: Environment Configuration

### Step 2.1: Add Environment Variables
```bash
# Update .env.local (keep SERVER_KEY secret!)

# Sandbox (for testing)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxx
MIDTRANS_ENVIRONMENT=sandbox

# Production (only when live)
# MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxx
# NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxx
# MIDTRANS_ENVIRONMENT=production
```

### Step 2.2: Validate Configuration
- [ ] Run `npm run dev`
- [ ] Check console for configuration warnings
- [ ] Verify `validatePaymentConfig()` in `lib/config/payment.config.ts` passes

### Step 2.3: Webhook URL Setup
- [ ] Get your server URL (local: use ngrok, staging/prod: use domain)
  ```bash
  # If running locally, use ngrok
  ngrok http 3000
  # This gives you: https://xxxx-xx-xxx-xxx.ngrok.io
  ```
- [ ] Add to `.env.local`:
  ```
  MIDTRANS_WEBHOOK_URL=https://yourdomain.com/api/payments/midtrans/webhook
  ```

## Phase 3: Code Implementation

### Step 3.1: Implement Snap Token Generation
**File:** `lib/utils/payment.ts`

Find function `generateMidtransSnapToken()` and uncomment real implementation:

```typescript
export async function generateMidtransSnapToken(
  transactionRequest: any,
  serverKey: string,
): Promise<{ token: string; redirectUrl: string }> {
  const auth = Buffer.from(`${serverKey}:`).toString('base64')
  
  const response = await fetch(getMidtransSnapApiUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactionRequest),
  })

  if (!response.ok) {
    throw new Error(`Midtrans API error: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    token: data.token,
    redirectUrl: data.redirect_url,
  }
}
```

**Changes needed:**
- [ ] Uncomment the real implementation
- [ ] Remove mock implementation
- [ ] Test with sandbox credentials

### Step 3.2: Implement Signature Verification
**File:** `app/api/payments/midtrans/webhook/route.ts`

Find the `handleMidtransWebhook` call and uncomment signature verification:

```typescript
// TODO: Verify Midtrans signature
import crypto from 'crypto'
import { verifyMidtransSignature } from '@/lib/utils/payment'

const isValid = verifyMidtransSignature(
  order_id,
  status_code,
  gross_amount,
  signature_key,
  process.env.MIDTRANS_SERVER_KEY!,
)

if (!isValid) {
  console.error('[v0] Invalid webhook signature')
  return NextResponse.json(
    {
      success: false,
      error: { code: 'INVALID_SIGNATURE' },
    },
    { status: 401 },
  )
}
```

**Changes needed:**
- [ ] Uncomment signature verification code
- [ ] Remove mock implementation (skip verification)
- [ ] Test with Midtrans test tools

### Step 3.3: Implement Idempotency Handling
**File:** `app/api/payments/midtrans/webhook/route.ts`

Add idempotency check before processing webhook:

```typescript
// TODO: Implement idempotency check
import { db } from '@/lib/db' // When using real database

// Check if webhook already processed
const existingLog = await db.webhookLog.findUnique({
  where: { externalTransactionId: transaction_id }
})

if (existingLog) {
  console.log('[v0] Webhook already processed:', transaction_id)
  return NextResponse.json({ success: true }, { status: 200 })
}

// Process webhook...

// Log webhook processing
await db.webhookLog.create({
  data: {
    externalTransactionId: transaction_id,
    payload: body,
    processedAt: new Date(),
  }
})
```

**Changes needed:**
- [ ] Add `webhookLog` table to database schema
- [ ] Implement idempotency check
- [ ] Test with duplicate webhooks

### Step 3.4: Implement Order Status Update
**File:** `app/api/payments/midtrans/webhook/route.ts`

Find and uncomment order status update logic:

```typescript
// TODO: Update order status if payment successful
if (isPaymentSuccessful(payment.status)) {
  await orderService.updateOrderStatus(
    payment.orderId,
    OrderStatus.PAYMENT_RECEIVED,
  )
  console.log('[v0] Order marked as payment received:', payment.orderId)
}
```

**Changes needed:**
- [ ] Uncomment order status update
- [ ] Verify status transition is valid
- [ ] Send order confirmation email (optional)

### Step 3.5: Implement Transaction Status Checking
**File:** `lib/utils/payment.ts`

Implement real transaction status check:

```typescript
export async function checkMidtransTransactionStatus(
  orderId: string,
  serverKey: string,
): Promise<any> {
  const auth = Buffer.from(`${serverKey}:`).toString('base64')
  
  const response = await fetch(
    `${getMidtransStatusApiUrl()}/${orderId}/status`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Midtrans API error: ${response.statusText}`)
  }

  return response.json()
}
```

**Changes needed:**
- [ ] Uncomment real implementation
- [ ] Test transaction status lookup
- [ ] Handle API errors gracefully

## Phase 4: Testing with Sandbox

### Step 4.1: Test Order Creation
```bash
# 1. Create order
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-test",
    "items": [{
      "id": "cart-1",
      "productId": "prod-1",
      "variantId": "var-1",
      "quantity": 1,
      "addedAt": "2024-05-12T00:00:00Z"
    }],
    "deliveryMethod": "DELIVERY"
  }'

# 2. Copy the orderId from response
```

**Verify:**
- [ ] Order created successfully
- [ ] Order status is WAITING_PAYMENT
- [ ] Order total is calculated correctly
- [ ] Order appears in mock repository

### Step 4.2: Test Payment Transaction Creation
```bash
# Create payment transaction
curl -X POST http://localhost:3000/api/payments/midtrans/create-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "customerEmail": "test@example.com",
    "customerPhone": "08123456789",
    "customerName": "Test User"
  }'

# Copy the redirectUrl from response
```

**Verify:**
- [ ] Payment transaction created
- [ ] redirectUrl points to real Midtrans (not mock)
- [ ] Token is provided
- [ ] Can access Midtrans payment page

### Step 4.3: Test Payment on Midtrans Sandbox
- [ ] Open the redirectUrl in browser
- [ ] You should see Midtrans Snap page
- [ ] Choose a payment method
- [ ] Use sandbox test cards (see test credentials below)

### Step 4.4: Test Card Payments

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`
- OTP: `123456`

**Declined Payment:**
- Card Number: `5555 5555 5555 4444`
- Expiry: `12/25`
- CVV: `123`
- OTP: `123456`

**Verify:**
- [ ] Successful payment redirects to success page
- [ ] Failed payment redirects to error page
- [ ] Webhook is received (check logs)
- [ ] Order status updates to PAYMENT_RECEIVED

### Step 4.5: Test Webhook Delivery
**Verify in Midtrans Dashboard:**
- [ ] Go to Settings → Webhooks
- [ ] Check webhook delivery history
- [ ] Verify successful webhooks (status 200)
- [ ] Check webhook payload details

## Phase 5: Database Integration

### Step 5.1: Create Database Schema
**File:** `prisma/schema.prisma`

Add these tables:

```prisma
model Order {
  id              String    @id @default(cuid())
  orderNumber     String    @unique
  userId          String
  status          OrderStatus
  items           OrderItem[]
  payments        PaymentTransaction[]
  subtotal        Int
  tax             Int
  shippingCost    Int
  discountAmount  Int
  total           Int
  voucherCode     String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model OrderItem {
  id              String    @id @default(cuid())
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id])
  productId       String
  variantId       String
  productName     String
  variantName     String
  sku             String
  quantity        Int
  unitPrice       Int
  subtotal        Int
  createdAt       DateTime  @default(now())
}

model PaymentTransaction {
  id                    String    @id @default(cuid())
  orderId               String
  order                 Order     @relation(fields: [orderId], references: [id])
  status                PaymentStatus
  amount                Int
  currency              String
  method                String
  externalTransactionId String?   @unique
  externalReference     String?   @unique
  metadata              Json?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  completedAt           DateTime?
}

model WebhookLog {
  id                    String    @id @default(cuid())
  externalTransactionId String    @unique
  payload               Json
  processedAt           DateTime  @default(now())
}

enum OrderStatus {
  WAITING_PAYMENT
  PAYMENT_RECEIVED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  SETTLED
  EXPIRED
  FAILED
  CANCELLED
  REFUNDED
}
```

**Changes needed:**
- [ ] Add to Prisma schema
- [ ] Run `npx prisma migrate dev --name add_payment_tables`
- [ ] Generate Prisma client

### Step 5.2: Create Database Repository
**File:** `lib/repositories/database.repository.ts`

Create implementation of `IOrderRepository`, `IPaymentRepository`, etc. using Prisma:

```typescript
import { PrismaClient } from '@prisma/client'
import { IOrderRepository } from '@/lib/services/order.service'
import { Order } from '@/lib/types'

export class DatabaseRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(order: Order): Promise<Order> {
    return this.prisma.order.create({
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        status: order.status,
        // ... other fields
      },
      include: { items: true }
    })
  }

  async getById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })
  }

  // ... implement other methods
}
```

**Changes needed:**
- [ ] Create database.repository.ts
- [ ] Implement all repository interface methods
- [ ] Use Prisma Client for all database operations
- [ ] Add error handling

### Step 5.3: Update API Routes
**Files:** All routes in `app/api/`

Replace mock repository with database repository:

```typescript
// OLD - Mock Repository
const mockRepo = getMockRepository()
const orderService = new OrderService(mockRepo, mockRepo, mockRepo)

// NEW - Database Repository
import { prisma } from '@/lib/db'
import { DatabaseRepository } from '@/lib/repositories/database.repository'

const dbRepo = new DatabaseRepository(prisma)
const orderService = new OrderService(dbRepo, dbRepo, dbRepo)
```

**Changes needed:**
- [ ] Update `app/api/orders/create/route.ts`
- [ ] Update `app/api/payments/midtrans/create-transaction/route.ts`
- [ ] Update `app/api/payments/midtrans/webhook/route.ts`
- [ ] Test all API routes with database

## Phase 6: Webhook Configuration

### Step 6.1: Configure Webhook in Midtrans
- [ ] Go to Midtrans Dashboard
- [ ] Navigate to Settings → Webhook Configuration
- [ ] Set URL: `https://yourdomain.com/api/payments/midtrans/webhook`
- [ ] Enable: Yes
- [ ] Click Save

### Step 6.2: Test Webhook Delivery
**In Midtrans Dashboard:**
- [ ] Go to Webhook → Webhook Delivery History
- [ ] Find recent webhooks from test payments
- [ ] Click on webhook to see:
  - [ ] Request payload
  - [ ] Response status
  - [ ] Retry history

### Step 6.3: Monitor Webhook Processing
**Add logging to webhook endpoint:**

```typescript
console.log('[v0] Webhook received:', {
  timestamp: new Date(),
  transactionId: transaction_id,
  orderId: order_id,
  status: transaction_status,
})

console.log('[v0] Webhook processed:', {
  paymentId: payment.id,
  newStatus: payment.status,
})
```

**Verify in logs:**
- [ ] Webhook received logs
- [ ] Payment update logs
- [ ] Order status change logs
- [ ] Error logs (if any)

## Phase 7: Production Deployment

### Step 7.1: Environment Setup
- [ ] Switch to production credentials in Midtrans dashboard
- [ ] Copy production Server Key
- [ ] Copy production Client Key
- [ ] Update production `.env.production`:
  ```
  MIDTRANS_SERVER_KEY=Mid-server-production-key
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-production-key
  MIDTRANS_ENVIRONMENT=production
  ```

### Step 7.2: Pre-Deployment Testing
- [ ] Test with production Midtrans account
- [ ] Verify webhook URL is publicly accessible
- [ ] Test with real payment methods (small amount)
- [ ] Verify order creation in production database
- [ ] Check payment status updates

### Step 7.3: Deploy to Production
- [ ] Deploy to Vercel (or your hosting)
- [ ] Set environment variables in hosting dashboard
- [ ] Verify deployment successful
- [ ] Test payment flow end-to-end
- [ ] Monitor logs for errors

### Step 7.4: Configure Webhooks (Production)
- [ ] In Midtrans Dashboard, update webhook URL to production
- [ ] Update any email templates with production URLs
- [ ] Test webhook delivery with small payment

### Step 7.5: Monitoring & Alerts
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Set up payment alerts
- [ ] Set up webhook failure alerts
- [ ] Configure admin notifications
- [ ] Set up uptime monitoring

## Phase 8: Post-Launch

### Step 8.1: Monitor First Transactions
- [ ] Watch for successful payments
- [ ] Check webhook delivery success rate
- [ ] Monitor API response times
- [ ] Check error rates
- [ ] Verify order notifications sent

### Step 8.2: Customer Support
- [ ] Set up payment dispute handling
- [ ] Set up refund process
- [ ] Document payment troubleshooting
- [ ] Create FAQ for payment issues
- [ ] Set up payment support channel

### Step 8.3: Performance Optimization
- [ ] Monitor database query performance
- [ ] Add indexes for frequently queried fields
- [ ] Cache product/variant data
- [ ] Optimize webhook processing
- [ ] Consider async order processing

### Step 8.4: Security Audit
- [ ] Review all environment variables are secure
- [ ] Verify signature verification is enabled
- [ ] Check SQL injection protection
- [ ] Review CORS configuration
- [ ] Audit webhook payload validation

## Troubleshooting

### Issue: "Invalid Midtrans signature"
**Solution:**
- Verify server key is correct in `.env`
- Check signature calculation in `lib/utils/payment.ts`
- Use HMAC-SHA512 with correct string concatenation
- Compare with Midtrans documentation

### Issue: "Webhook not received"
**Solution:**
- Verify webhook URL is publicly accessible
- Check webhook URL in Midtrans dashboard
- Verify ngrok tunnel is active (if local testing)
- Check firewall/security groups allow inbound connections
- Review Midtrans webhook delivery history

### Issue: "Order not found in webhook"
**Solution:**
- Verify order created before webhook sent
- Check order ID format matches Midtrans order ID
- Verify database connection in webhook handler
- Add logging to trace order creation

### Issue: "Duplicate payments"
**Solution:**
- Implement idempotency with transaction IDs
- Add webhook log to track processed webhooks
- Use database unique constraints
- Test with duplicate webhook delivery

## Quick Reference

### Midtrans Sandbox Credentials
- **Server Key:** SB-Mid-server-xxxxx
- **Client Key:** SB-Mid-client-xxxxx
- **Environment:** sandbox

### Midtrans Production Credentials
- **Server Key:** Mid-server-xxxxx
- **Client Key:** Mid-client-xxxxx
- **Environment:** production

### Important URLs
- Midtrans Dashboard: https://dashboard.midtrans.com
- API Docs: https://docs.midtrans.com
- Test Credentials: https://docs.midtrans.com/en/snap/preparations

---

**Status:** Ready to implement
**Time Estimate:** 2-4 hours for full integration
**Difficulty:** Medium
**Support:** Check Midtrans docs & contact support at support@midtrans.com
