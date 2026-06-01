import { formatCurrency, formatDate } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order-status-badge'
import { Card } from '@/components/ui/card'
import { auth } from '@/auth'
import { orderRepository } from '@/lib/repositories/order.repository'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MidtransPayButton } from '@/components/payment/midtrans-pay-button'

export const metadata = {
  title: 'Order Detail | KM ITB Merchandise',
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-lg mb-4">Silakan login untuk melihat detail pesanan Anda.</p>
        <Link href="/login">
          <Button className="rounded-full bg-black hover:bg-gray-900 text-white">Login</Button>
        </Link>
      </div>
    )
  }

  const order = await orderRepository.getOrderByIdForUser(session.user.id, params.id)

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-lg">Pesanan tidak ditemukan.</p>
      </div>
    )
  }

  const firstPayment = order.payments?.[0]
  const paymentStatus = firstPayment?.status || 'WAITING'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light">Order {order.orderNumber}</h1>
              <p className="text-gray-600 mt-2">{formatDate(order.createdAt)}</p>
            </div>
            {order.status === 'WAITING_PAYMENT' && (
              <MidtransPayButton 
                orderId={order.id} 
                existingRedirectUrl={firstPayment?.snapRedirectUrl} 
              />
            )}
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-gray-200">
              <p className="text-sm text-gray-600">Order Status</p>
              <div className="mt-3">
                <OrderStatusBadge status={order.status as any} />
              </div>
            </Card>
            <Card className="p-6 border-gray-200">
              <p className="text-sm text-gray-600">Payment Status</p>
              <div className="mt-3">
                <PaymentStatusBadge status={paymentStatus as any} />
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-gray-100 rounded-lg"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                    <span className="text-xs text-center px-2">Image unavailable</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-gray-600">{item.variantName}</p>
                    <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(Number(item.price))}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(Number(item.subtotal))}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (2%)</span>
                <span className="font-medium">{formatCurrency(Number(order.buyerFee))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {Number(order.deliveryFee) === 0 ? 'FREE' : formatCurrency(Number(order.deliveryFee))}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(order.discount))}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </Card>

          {/* Delivery Info */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Delivery Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Delivery Method</p>
                <p className="font-medium">{order.deliveryMethod}</p>
              </div>
              {order.deliveryMethod === 'DELIVERY' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="font-medium">
                      {order.shippingName}<br />
                      {order.shippingStreet}<br />
                      {order.shippingCity}, {order.shippingPostal}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="font-medium">{order.shippingPhone}</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
