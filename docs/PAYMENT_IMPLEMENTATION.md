# Payment Implementation Guide

## Overview

This document describes the payment integration architecture for KM ITB E-Commerce platform. The system is designed with **Midtrans** integration in mind, using mock repositories and services that can be swapped with real database implementations.

## Architecture

### Current State (Mock Implementation)
- ✅ Type-safe order and payment interfaces
- ✅ Service layer with dependency injection
- ✅ Mock repository with in-memory storage
- ✅ API route structure with Midtrans placeholders
- ✅ Environment-based configuration
- ✅ Comprehensive TODO comments for future implementation

### Future: Real Implementation
- Database integration (Prisma + PostgreSQL)
- Real Midtrans API calls
- Webhook signature verification
- Idempotency handling
- Email notifications
- Admin dashboard for payment management

## File Structure

```
lib/
├── types.ts                    # All type definitions
├── services/
│   ├── order.service.ts        # Order business logic
│   └── payment.service.ts      # Payment processing logic
├── repositories/
│   └── mock.repository.ts      # Mock in-memory repository
├── utils/
│   └── payment.ts              # Payment utilities & helpers
└── config/
    └── payment.config.ts       # Configuration & environment vars

app/api/
├── orders/
│   └── create/route.ts         # POST /api/orders/create
└── payments/
    └── midtrans/
        ├── create-transaction/ # POST /api/payments/midtrans/create-transaction
        └── webhook/            # POST /api/payments/midtrans/webhook
```

## Key Components

### 1. Types System (`lib/types.ts`)

Comprehensive TypeScript interfaces for:
- **User** - Customer and admin users
- **Product** - Products with variants
- **ProductVariant** - SKU, stock, variant-specific pricing
- **CartItem** - Shopping cart items
- **Order** - Order details with status
- **OrderItem** - Line items in orders
- **PaymentTransaction** - Payment records
- **Invoice** - Invoice generation
- **Voucher** - Discount codes
- **Enums**: OrderStatus, PaymentStatus, DeliveryMethod, AdminRole

### 2. Service Layer

#### OrderService
```typescript
async createOrder(req: CreateOrderRequest): Promise<Order>
async calculateCheckout(...): Promise<CheckoutSummary>
async getOrder(orderId: string): Promise<Order | null>
async getUserOrders(userId: string): Promise<Order[]>
async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>
```

**Features:**
- Order number generation (KM-YYYYMMDD-RANDOMHEX)
- Cart to order conversion
- Voucher application & validation
- Tax calculation (10% default)
- Shipping cost calculation
- Status transition validation

#### PaymentService
```typescript
async createMidtransTransaction(...): Promise<PaymentTransaction>
async handleMidtransWebhook(...): Promise<PaymentTransaction>
async getPayment(paymentId: string): Promise<PaymentTransaction | null>
async updatePaymentStatus(...): Promise<PaymentTransaction>
```

**Features:**
- Midtrans transaction creation
- Webhook handling
- Payment status tracking
- Admin payment status override

### 3. Mock Repository (`lib/repositories/mock.repository.ts`)

In-memory implementation of:
- `IOrderRepository` - Full CRUD for orders
- `IProductRepository` - Product & variant lookups
- `IVoucherRepository` - Voucher validation
- `IPaymentRepository` - Payment transaction storage

**Mock Data Included:**
- 3 Products (Hoodie, T-Shirt, Cap)
- 6 Product Variants with stock
- 2 Active Vouchers (WELCOME10, SAVE50K)

**To Replace with Database:**
Create `DatabaseRepository` implementing same interfaces and swap in API routes.

### 4. API Routes

#### POST `/api/orders/create`
**Purpose:** Create order from cart

**Request:**
```json
{
  "userId": "user-123",
  "items": [
    {
      "id": "cart-1",
      "productId": "prod-1",
      "variantId": "var-1",
      "quantity": 2,
      "addedAt": "2024-05-12T00:00:00Z"
    }
  ],
  "deliveryMethod": "DELIVERY",
  "voucherCode": "WELCOME10",
  "notes": "Please handle with care"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-1715500800000-abc123",
    "orderNumber": "KM-20240512-A3F8E2",
    "userId": "user-123",
    "status": "WAITING_PAYMENT",
    "items": [...],
    "subtotal": 350000,
    "tax": 35000,
    "shippingCost": 50000,
    "discountAmount": 35000,
    "total": 400000
  },
  "timestamp": "2024-05-12T10:30:00Z"
}
```

**TODO:** Add Zod validation, authentication check

#### POST `/api/payments/midtrans/create-transaction`
**Purpose:** Initiate Midtrans payment

**Request:**
```json
{
  "orderId": "order-1715500800000-abc123",
  "customerEmail": "buyer@example.com",
  "customerPhone": "08123456789",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-1715500800000-def456",
      "orderId": "order-1715500800000-abc123",
      "status": "PENDING",
      "amount": 400000,
      "method": "MIDTRANS",
      "externalReference": "KM-20240512-A3F8E2-xyz789"
    },
    "redirectUrl": "https://app.sandbox.midtrans.com/snap/v1/...",
    "token": "mock-token-1715500800000"
  },
  "timestamp": "2024-05-12T10:30:00Z"
}
```

**TODO:** Validate Midtrans config, order status check

#### POST `/api/payments/midtrans/webhook`
**Purpose:** Handle Midtrans status callbacks

**Midtrans Sends:**
```json
{
  "transaction_id": "1234567890",
  "order_id": "KM-20240512-A3F8E2-xyz789",
  "transaction_status": "settlement",
  "status_code": "200",
  "signature_key": "...",
  "gross_amount": "400000.00",
  "fraud_status": "accept"
}
```

**Processing:**
1. ✅ Receive webhook
2. TODO: Verify signature
3. TODO: Check idempotency (prevent duplicates)
4. TODO: Update payment status
5. TODO: Update order status
6. TODO: Send notifications
7. TODO: Handle fraud detection
8. Return 200 OK to Midtrans

## Midtrans Integration TODOs

### 1. Signature Verification
**File:** `lib/utils/payment.ts` + webhook route
```typescript
// TODO: Implement HMAC-SHA512 signature verification
const serverKey = process.env.MIDTRANS_SERVER_KEY!
const expectedSignature = crypto
  .createHmac('sha512', serverKey)
  .update(`${orderId}${statusCode}${grossAmount}`)
  .digest('hex')

if (signature !== expectedSignature) {
  throw new Error('Invalid signature')
}
```

### 2. Payment Status Mapping
**File:** `lib/services/payment.service.ts`

Map Midtrans statuses to app enums:
```
capture → PaymentStatus.CAPTURED
settlement → PaymentStatus.SETTLED
pending → PaymentStatus.PENDING
deny → PaymentStatus.FAILED
cancel → PaymentStatus.CANCELLED
expire → PaymentStatus.EXPIRED
failure → PaymentStatus.FAILED
```

### 3. Idempotency Handling
**File:** Webhook route + database

Prevent duplicate processing:
```typescript
// TODO: Check if webhook already processed
const existing = await db.webhookLogs.findUnique({
  where: { externalTransactionId: transaction_id }
})

if (existing) {
  return { success: true } // Already processed
}

// Process...
// Log webhook receipt for idempotency
await db.webhookLogs.create({
  externalTransactionId: transaction_id,
  timestamp: new Date()
})
```

### 4. Order Status Update
**File:** Webhook route + order service

After successful payment:
```typescript
// TODO: Implement in webhook handler
if (isPaymentSuccessful(paymentStatus)) {
  await orderService.updateOrderStatus(
    payment.orderId,
    OrderStatus.PAYMENT_RECEIVED
  )
}
```

### 5. Snap Token Generation
**File:** `lib/utils/payment.ts`

Make actual API call to Midtrans:
```typescript
// TODO: Implement real API call
const auth = Buffer.from(`${serverKey}:`).toString('base64')
const response = await fetch(getMidtransSnapApiUrl(), {
  method: 'POST',
  headers: {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(buildMidtransTransactionRequest(...)),
})
return response.json() // { token, redirect_url }
```

## Environment Variables

### Required for Real Integration
```bash
# Midtrans API Keys
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key

# Webhook URL
MIDTRANS_WEBHOOK_URL=https://yourdomain.com/api/payments/midtrans/webhook
```

### Optional Settings
```bash
# Feature flags
MIDTRANS_ENVIRONMENT=sandbox  # or production
NEXT_PUBLIC_MOCK_PAYMENT=false
NEXT_PUBLIC_REAL_PAYMENT=false

# Payment config
AUTO_PROCESS_ORDERS=true
SEND_CONFIRMATION_EMAILS=true

# Admin notifications
ADMIN_NOTIFICATION_EMAILS=admin@km-itb.ac.id
```

See `.env.example` for full list.

## Database Integration Path

### Current: Mock Repository
```typescript
const mockRepo = getMockRepository()
const paymentService = new PaymentService(mockRepo, gateway)
```

### Future: Prisma + PostgreSQL
```typescript
// Create database repository implementing same interfaces
class DatabaseRepository 
  implements IOrderRepository, IPaymentRepository, ... {
  constructor(private prisma: PrismaClient) {}
  
  async create(order: Order) {
    return this.prisma.order.create({ data: order })
  }
  // ... implement other methods
}

// Swap in API routes (no changes to services!)
const dbRepo = new DatabaseRepository(prisma)
const paymentService = new PaymentService(dbRepo, gateway)
```

**Prisma Schema (to be created):**
```prisma
model Order {
  id              String
  orderNumber     String   @unique
  userId          String
  status          OrderStatus
  items           OrderItem[]
  payments        PaymentTransaction[]
  // ... other fields
}

model PaymentTransaction {
  id              String
  orderId         String
  status          PaymentStatus
  externalId      String? @unique
  // ... other fields
}

model Voucher {
  id              String
  code            String   @unique
  discountType    String
  // ... other fields
}
```

## Testing Checklist

### Mock Payment Flow
- [ ] Create order via `/api/orders/create`
- [ ] Generate Midtrans transaction via `/api/payments/midtrans/create-transaction`
- [ ] Redirect to mock payment page
- [ ] Verify order shows in My Orders
- [ ] Verify admin can see order

### Webhook Simulation
- [ ] Send mock webhook to `/api/payments/midtrans/webhook`
- [ ] Verify payment status updates
- [ ] Verify order status updates (WAITING_PAYMENT → PAYMENT_RECEIVED)
- [ ] Check duplicate webhook handling

### Admin Functions
- [ ] View all orders with filters
- [ ] Manual status updates (with confirmation)
- [ ] Voucher management
- [ ] Sales reports
- [ ] Order detail view with full history

## Security Considerations

1. **Server Key Protection**
   - Never expose `MIDTRANS_SERVER_KEY` to client
   - Always verify webhooks with signature
   - Use environment variables, never hardcode

2. **Webhook Verification**
   - Always verify Midtrans signatures
   - Check transaction amounts match
   - Implement idempotency to prevent duplicates

3. **Input Validation**
   - Validate all API inputs with Zod schemas
   - Sanitize customer input before storing
   - Check order totals client + server side

4. **Database Security**
   - Use Row-Level Security (RLS) for user data
   - Never expose sensitive data in API responses
   - Log all payment operations for audit trail

5. **Rate Limiting**
   - Limit payment creation attempts per user
   - Throttle webhook processing
   - Implement exponential backoff for retries

## Common Issues & Solutions

### "Invalid Midtrans signature"
- Ensure `MIDTRANS_SERVER_KEY` is correct
- Verify signature calculation (HMAC-SHA512)
- Check Midtrans dashboard for correct key

### "Order not found in webhook"
- Implement idempotency check
- Ensure order created before webhook sent
- Check order ID formatting (KM-YYYYMMDD-XXXXX)

### "Duplicate payment processing"
- Implement webhook idempotency logs
- Add unique constraints on external transaction IDs
- Retry with exponential backoff

### "Payment timeout"
- Configure webhook retry in Midtrans dashboard
- Implement webhook signature verification
- Add request timeout handling

## Next Steps

1. **Test mock implementation** with mock payment flow
2. **Set up Midtrans account** (sandbox first)
3. **Get API credentials** from Midtrans dashboard
4. **Implement signature verification** in webhook handler
5. **Set up real database** (Prisma + PostgreSQL)
6. **Create DatabaseRepository** implementing interfaces
7. **Add email notifications** for payment confirmations
8. **Implement admin dashboard** for payment management
9. **Deploy to staging** for testing with real Midtrans
10. **Configure webhook URL** in Midtrans dashboard
11. **Deploy to production** with real Midtrans environment

## Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Snap Integration](https://docs.midtrans.com/en/snap/overview)
- [Midtrans Webhook Handling](https://docs.midtrans.com/en/snap/advanced-feature#webhook-handler)
- [Midtrans API Reference](https://api-docs.midtrans.com/)
- [Midtrans Sandbox Testing](https://docs.midtrans.com/en/snap/preparations#sandbox-details)

---

**Last Updated:** May 12, 2024  
**Version:** 1.0.0  
**Status:** Mock Implementation Ready
