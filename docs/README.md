# Payment System Documentation

Complete documentation for the Midtrans payment integration in the KM ITB E-Commerce platform.

## 📚 Documentation Index

### Quick Navigation

1. **[PAYMENT_IMPLEMENTATION_SUMMARY.md](../PAYMENT_IMPLEMENTATION_SUMMARY.md)** ⭐ START HERE
   - Overview of what's been built
   - Architecture highlights
   - Quick start guide
   - TODO checklist
   - **Read this first to understand the big picture**

2. **[PAYMENT_QUICK_REFERENCE.md](./PAYMENT_QUICK_REFERENCE.md)** 🚀 FOR DEVELOPERS
   - Fast lookup guide
   - File locations and purposes
   - Common tasks with code
   - Debugging tips
   - **Keep this open while coding**

3. **[PAYMENT_IMPLEMENTATION.md](./PAYMENT_IMPLEMENTATION.md)** 📖 DETAILED REFERENCE
   - Complete technical documentation
   - API route specifications
   - Service layer details
   - Mock repository patterns
   - Database integration path
   - **Refer to this for in-depth information**

4. **[PAYMENT_USAGE_EXAMPLES.md](./PAYMENT_USAGE_EXAMPLES.md)** 💡 CODE EXAMPLES
   - Real React component examples
   - API integration patterns
   - Admin dashboard examples
   - User order history examples
   - Webhook testing examples
   - **Copy-paste ready code snippets**

5. **[MIDTRANS_INTEGRATION_CHECKLIST.md](./MIDTRANS_INTEGRATION_CHECKLIST.md)** ✅ INTEGRATION GUIDE
   - Step-by-step Midtrans setup
   - Account creation guide
   - Environment configuration
   - Code implementation steps
   - Testing checklist
   - Production deployment
   - **Follow this to go live**

## 🎯 Where to Start

### If you're NEW to this project:
1. Read `PAYMENT_IMPLEMENTATION_SUMMARY.md` (5 min)
2. Look at `PAYMENT_QUICK_REFERENCE.md` to get oriented (5 min)
3. Explore the code structure:
   - `lib/types.ts` - All type definitions
   - `lib/services/order.service.ts` - Order logic
   - `lib/services/payment.service.ts` - Payment logic
   - `app/api/orders/create/route.ts` - API example

### If you're IMPLEMENTING a feature:
1. Check `PAYMENT_QUICK_REFERENCE.md` → "Common Tasks"
2. Find the relevant code in `PAYMENT_IMPLEMENTATION.md`
3. Copy patterns from `PAYMENT_USAGE_EXAMPLES.md`
4. Add your code and test

### If you're INTEGRATING MIDTRANS:
1. Follow `MIDTRANS_INTEGRATION_CHECKLIST.md` step-by-step
2. Reference `PAYMENT_IMPLEMENTATION.md` for technical details
3. Use `PAYMENT_QUICK_REFERENCE.md` for quick lookups
4. Copy code examples from `PAYMENT_USAGE_EXAMPLES.md`

### If you're DEBUGGING an issue:
1. Check error message in `PAYMENT_QUICK_REFERENCE.md` → Troubleshooting
2. Look at `PAYMENT_IMPLEMENTATION.md` → Common Issues
3. Add logging based on `PAYMENT_QUICK_REFERENCE.md` → Debugging Tips
4. Check Midtrans docs for payment-specific issues

## 📋 Project Structure

```
lib/
├── types.ts                          # All TypeScript interfaces
├── services/
│   ├── order.service.ts              # Order business logic
│   └── payment.service.ts            # Payment processing
├── repositories/
│   └── mock.repository.ts            # In-memory mock data
├── utils/
│   └── payment.ts                    # Payment utilities
└── config/
    └── payment.config.ts             # Configuration

app/api/
├── orders/
│   └── create/route.ts               # Create order
└── payments/
    └── midtrans/
        ├── create-transaction/route.ts  # Create payment
        └── webhook/route.ts             # Webhook handler

docs/
├── README.md                         # This file
├── PAYMENT_IMPLEMENTATION.md         # Technical details
├── PAYMENT_QUICK_REFERENCE.md        # Quick lookup
├── PAYMENT_USAGE_EXAMPLES.md         # Code examples
└── MIDTRANS_INTEGRATION_CHECKLIST.md # Integration steps
```

## 🔑 Key Concepts

### Order Status Flow
```
WAITING_PAYMENT → PAYMENT_RECEIVED → PROCESSING → SHIPPED → DELIVERED
              → CANCELLED
```

### Payment Status Flow
```
PENDING → AUTHORIZED → CAPTURED → SETTLED
       → FAILED / EXPIRED / CANCELLED
```

### Service Architecture
```
API Routes (HTTP)
    ↓ (dependency injection)
Services (Business Logic)
    ↓ (use repositories)
Repository (Data Access)
    ↓
Mock Repository (in-memory) ← Can be swapped with DatabaseRepository
```

## 🚀 Quick Start

### 1. Set Up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your values (optional for mock testing)
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test Order Creation
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [{
      "id": "c1",
      "productId": "prod-1",
      "variantId": "var-1",
      "quantity": 1,
      "addedAt": "2024-05-12T00:00:00Z"
    }],
    "deliveryMethod": "DELIVERY"
  }'
```

### 4. Test Payment Creation
```bash
curl -X POST http://localhost:3000/api/payments/midtrans/create-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "customerEmail": "test@example.com",
    "customerPhone": "08123456789",
    "customerName": "Test User"
  }'
```

### 5. Test Webhook
```bash
curl -X POST http://localhost:3000/api/payments/midtrans/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test-txn",
    "order_id": "KM-20240512-ABC",
    "transaction_status": "settlement",
    "status_code": "200",
    "gross_amount": "400000.00",
    "signature_key": "test"
  }'
```

## 📖 Documentation by Task

### I want to...

**Understand the architecture**
→ Read: `PAYMENT_IMPLEMENTATION_SUMMARY.md` + `PAYMENT_IMPLEMENTATION.md`

**Set up Midtrans integration**
→ Follow: `MIDTRANS_INTEGRATION_CHECKLIST.md`

**Add real database**
→ Check: `PAYMENT_IMPLEMENTATION.md` → Database Integration Path

**Send payment confirmation emails**
→ See: `PAYMENT_IMPLEMENTATION.md` → TODO comments

**Build admin dashboard**
→ Copy: `PAYMENT_USAGE_EXAMPLES.md` → Admin Order Management

**Test payment flow**
→ Use: `PAYMENT_USAGE_EXAMPLES.md` → Mock Payment Simulation

**Debug a payment issue**
→ Follow: `PAYMENT_QUICK_REFERENCE.md` → Debugging Tips

**Add a new payment method**
→ Check: `PAYMENT_QUICK_REFERENCE.md` → Common Tasks

## ✅ Implementation Checklist

### Current State (✅ Complete)
- [x] Type system with all domain models
- [x] Service layer with business logic
- [x] Mock repository with test data
- [x] API routes with error handling
- [x] Comprehensive documentation
- [x] Code examples and patterns
- [x] Environment configuration

### Before Going Live (TODO)
- [ ] Midtrans account setup
- [ ] Real API credentials
- [ ] Signature verification
- [ ] Database integration
- [ ] Webhook idempotency
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Production testing
- [ ] Security audit

See `PAYMENT_IMPLEMENTATION_SUMMARY.md` for full checklist.

## 🆘 Common Issues

### Environment Variables Not Loading
→ Check: `lib/config/payment.config.ts` + `.env.example`

### Webhook Not Processing
→ Check: `PAYMENT_QUICK_REFERENCE.md` → Debugging Tips

### Order Calculation Wrong
→ Check: `PAYMENT_IMPLEMENTATION.md` → Tax & Shipping Calculation

### API Route Errors
→ Check: `PAYMENT_USAGE_EXAMPLES.md` → Code Examples

### Midtrans Integration Help
→ Follow: `MIDTRANS_INTEGRATION_CHECKLIST.md`

## 🔗 External Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans API Reference](https://api-docs.midtrans.com/)
- [Midtrans Snap Integration](https://docs.midtrans.com/en/snap/overview)
- [Midtrans Webhook Guide](https://docs.midtrans.com/en/snap/advanced-feature#webhook-handler)

## 💬 Need Help?

### Check These First
1. **Quick Reference** → `PAYMENT_QUICK_REFERENCE.md`
2. **Examples** → `PAYMENT_USAGE_EXAMPLES.md`
3. **Checklist** → `MIDTRANS_INTEGRATION_CHECKLIST.md`
4. **Full Docs** → `PAYMENT_IMPLEMENTATION.md`

### Contact Midtrans
- Email: support@midtrans.com
- Dashboard: https://dashboard.midtrans.com
- Chat: Available in Midtrans Dashboard

### Report Bugs
- Add TODO comments in code
- Update documentation
- Test thoroughly before going live

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-05-12 | Initial implementation - mock repository, services, API routes, documentation |

## 👥 Contributors

- Payment System Architecture & Implementation

## 📝 License

Same as main project

---

## 📌 Last Updated

**Date:** May 12, 2024  
**Status:** ✅ Ready for Development  
**Next Step:** Follow `MIDTRANS_INTEGRATION_CHECKLIST.md` to add real Midtrans integration

**Keep this index handy** - refer back to find the right documentation for your task!
