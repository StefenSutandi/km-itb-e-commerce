# Payment Integration - Usage Examples

Complete examples of how to use the payment system in your React components and API routes.

## Example 1: Create Order from Checkout

### Step 1: Call Order Creation API
```typescript
// components/checkout/checkout-form.tsx
import { useState } from 'react'
import { CreateOrderRequest, DeliveryMethod } from '@/lib/types'

export function CheckoutForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(formData: {
    items: CartItem[]
    deliveryMethod: DeliveryMethod
    voucherCode?: string
  }) {
    setLoading(true)
    setError(null)

    try {
      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          items: formData.items,
          deliveryMethod: formData.deliveryMethod,
          voucherCode: formData.voucherCode,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to create order')
      }

      const { data: order } = await response.json()
      console.log('[v0] Order created:', order)

      // Redirect to payment
      await handlePayment(order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[v0] Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment(order: Order) {
    try {
      // Request Midtrans transaction
      const response = await fetch('/api/payments/midtrans/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerEmail: currentUser.email,
          customerPhone: currentUser.phone,
          customerName: currentUser.name,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment transaction')
      }

      const { data } = await response.json()
      console.log('[v0] Payment created:', data)

      // In development with mock payment
      if (data.redirectUrl.includes('mock-payment')) {
        // Redirect to mock payment page
        window.location.href = data.redirectUrl
      } else {
        // In production with real Midtrans
        // Snap.pay(data.token, {
        //   onSuccess: () => { ... },
        //   onPending: () => { ... },
        //   onError: () => { ... },
        // })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      // Get form data and call handleCheckout
    }}>
      {/* Checkout form JSX */}
    </form>
  )
}
```

## Example 2: Mock Payment Simulation

### Create Mock Payment Page
```typescript
// app/mock-payment/page.tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MockPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  async function simulatePaymentSuccess() {
    setLoading(true)

    try {
      // Simulate webhook callback
      const response = await fetch('/api/payments/midtrans/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: `mock-txn-${Date.now()}`,
          order_id: orderId,
          transaction_status: 'settlement',
          status_code: '200',
          gross_amount: amount,
          signature_key: 'mock-sig',
          fraud_status: 'accept',
        }),
      })

      if (!response.ok) {
        throw new Error('Payment simulation failed')
      }

      // Redirect to success page
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      console.error('[v0] Payment simulation error:', error)
      router.push(`/checkout/error?orderId=${orderId}`)
    } finally {
      setLoading(false)
    }
  }

  async function simulatePaymentFailed() {
    setLoading(true)

    try {
      // Simulate failed webhook
      await fetch('/api/payments/midtrans/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: `mock-txn-${Date.now()}`,
          order_id: orderId,
          transaction_status: 'deny',
          status_code: '403',
          gross_amount: amount,
          signature_key: 'mock-sig',
          fraud_status: 'deny',
        }),
      })

      router.push(`/checkout/error?orderId=${orderId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Mock Payment Page</h1>
      <p className="text-gray-600">Order: {orderId}</p>
      <p className="text-lg font-semibold">Amount: Rp {amount?.toLocaleString('id-ID')}</p>

      <div className="flex gap-4">
        <button
          onClick={simulatePaymentSuccess}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </button>
        <button
          onClick={simulatePaymentFailed}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Fail Payment'}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        This is a mock payment page for testing. In production, you&apos;ll be redirected
        to the actual Midtrans Snap payment page.
      </p>
    </div>
  )
}
```

## Example 3: Admin Order Management

### View Orders & Update Status
```typescript
// app/admin/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Order, OrderStatus } from '@/lib/types'
import { OrderService } from '@/lib/services/order.service'
import { getMockRepository } from '@/lib/repositories/mock.repository'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        // In production, fetch from API
        // const response = await fetch('/api/admin/orders')
        // const { data } = await response.json()

        // For now, use mock repository
        const repo = getMockRepository()
        const orderService = new OrderService(repo, repo, repo)
        const allOrders = await orderService.getAllOrders(50, 0)
        setOrders(allOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      // Call API to update order
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      )

      console.log('[v0] Order status updated:', orderId, newStatus)
    } catch (err) {
      console.error('[v0] Error updating order:', err)
    }
  }

  if (loading) return <div>Loading orders...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Order Number</th>
            <th className="text-left py-3 px-4">Customer</th>
            <th className="text-left py-3 px-4">Amount</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-mono text-sm">{order.orderNumber}</td>
              <td className="py-3 px-4">{order.userId}</td>
              <td className="py-3 px-4">
                Rp {order.total.toLocaleString('id-ID')}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === OrderStatus.PAYMENT_RECEIVED
                      ? 'bg-green-100 text-green-800'
                      : order.status === OrderStatus.WAITING_PAYMENT
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {order.status === OrderStatus.PAYMENT_RECEIVED && (
                  <button
                    onClick={() =>
                      updateOrderStatus(order.id, OrderStatus.PROCESSING)
                    }
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700"
                  >
                    Mark Processing
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Example 4: User Order History

### Display User's Orders
```typescript
// app/my-orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Order } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/payment'

export default function MyOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      if (!user) return

      try {
        // In production: fetch from API
        // const response = await fetch(`/api/users/${user.id}/orders`)
        // const { data } = await response.json()

        // For now, fetch from mock repo
        const response = await fetch(`/api/orders/user/${user.id}`)
        const { data } = await response.json()
        setOrders(data)
      } catch (err) {
        console.error('[v0] Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user])

  if (loading) return <div>Loading your orders...</div>
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-mono text-sm text-gray-600">{order.orderNumber}</p>
              <p className="text-gray-600 text-sm">
                {new Date(order.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'PAYMENT_RECEIVED'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'WAITING_PAYMENT'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="space-y-2 mb-3 pb-3 border-b">
            {order.items.map((item) => (
              <p key={item.id} className="text-sm text-gray-600">
                {item.productName} x {item.quantity} = {formatCurrency(item.subtotal)}
              </p>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Total: {formatCurrency(order.total)}
            </p>
            <a
              href={`/my-orders/${order.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Example 5: Payment Webhook Test

### Test Webhook Locally with cURL
```bash
# Success scenario
curl -X POST http://localhost:3000/api/payments/midtrans/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "mock-txn-123456",
    "order_id": "KM-20240512-A3F8E2",
    "transaction_status": "settlement",
    "status_code": "200",
    "gross_amount": "400000.00",
    "signature_key": "mock-signature",
    "fraud_status": "accept"
  }'

# Failure scenario
curl -X POST http://localhost:3000/api/payments/midtrans/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "mock-txn-123457",
    "order_id": "KM-20240512-B4G9F3",
    "transaction_status": "deny",
    "status_code": "403",
    "gross_amount": "350000.00",
    "signature_key": "mock-signature",
    "fraud_status": "deny"
  }'
```

## Example 6: Apply Voucher During Checkout

### Validate & Apply Voucher
```typescript
// components/checkout/voucher-input.tsx
import { useState } from 'react'
import { Voucher } from '@/lib/types'
import { getMockRepository } from '@/lib/repositories/mock.repository'

interface VoucherInputProps {
  onVoucherApplied: (voucher: Voucher | null) => void
}

export function VoucherInput({ onVoucherApplied }: VoucherInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<Voucher | null>(null)

  async function applyVoucher() {
    setError(null)

    try {
      // Validate voucher
      const repo = getMockRepository()
      const voucher = await repo.getByCode(code)

      if (!voucher) {
        setError('Voucher code not found')
        return
      }

      if (!voucher.isActive) {
        setError('This voucher is no longer active')
        return
      }

      if (new Date() > voucher.expiresAt) {
        setError('This voucher has expired')
        return
      }

      if (voucher.currentUsage >= voucher.maxUsage) {
        setError('This voucher has reached its usage limit')
        return
      }

      setApplied(voucher)
      onVoucherApplied(voucher)
      console.log('[v0] Voucher applied:', voucher.code)
    } catch (err) {
      setError('Failed to apply voucher')
      console.error('[v0] Voucher error:', err)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter voucher code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 px-4 py-2 border rounded-full"
          disabled={!!applied}
        />
        <button
          onClick={applyVoucher}
          disabled={!code || !!applied}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {applied && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 font-medium">{applied.code} applied ✓</p>
          <p className="text-green-700 text-sm">
            {applied.discountType === 'PERCENTAGE'
              ? `Save ${applied.discountValue}%`
              : `Save Rp ${applied.discountValue.toLocaleString('id-ID')}`}
          </p>
        </div>
      )}
    </div>
  )
}
```

## Example 7: Payment Status Badge

### Reusable Status Display Component
```typescript
// components/payment-status-badge.tsx
import { PaymentStatus } from '@/lib/types'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  size?: 'sm' | 'md' | 'lg'
}

export function PaymentStatusBadge({
  status,
  size = 'md',
}: PaymentStatusBadgeProps) {
  const config: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
    [PaymentStatus.PENDING]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pending',
    },
    [PaymentStatus.AUTHORIZED]: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Authorized',
    },
    [PaymentStatus.CAPTURED]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Captured',
    },
    [PaymentStatus.SETTLED]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Settled',
    },
    [PaymentStatus.EXPIRED]: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: 'Expired',
    },
    [PaymentStatus.FAILED]: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Failed',
    },
    [PaymentStatus.CANCELLED]: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Cancelled',
    },
    [PaymentStatus.REFUNDED]: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      label: 'Refunded',
    },
  }

  const { bg, text, label } = config[status]
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm'

  return <span className={`${bg} ${text} ${sizeClass} rounded-full font-medium`}>{label}</span>
}
```

---

These examples show common patterns for integrating the payment system into your application. Adapt them based on your specific needs and authentication setup.
