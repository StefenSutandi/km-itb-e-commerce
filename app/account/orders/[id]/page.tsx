import { mockOrders, mockProducts } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order-status-badge'
import { Card } from '@/components/ui/card'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = mockOrders.find((o) => o.id === params.id)

  if (!order) {
    return <div>Order not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-light">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-2">{formatDate(order.createdAt)}</p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-gray-200">
              <p className="text-sm text-gray-600">Order Status</p>
              <div className="mt-3">
                <OrderStatusBadge status={order.status} />
              </div>
            </Card>
            <Card className="p-6 border-gray-200">
              <p className="text-sm text-gray-600">Payment Status</p>
              <div className="mt-3">
                <PaymentStatusBadge status={order.paymentStatus as any} />
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => {
                const product = mockProducts.find((p) => p.id === item.productId)
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-100 rounded-lg"
                  >
                    <img
                      src={product?.images[0]}
                      alt={product?.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.unitPrice)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>

          {/* Delivery Info */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Delivery Method</p>
                <p className="font-medium mt-1">
                  {order.deliveryMethod === 'PICKUP' ? 'Store Pickup' : 'Home Delivery'}
                </p>
              </div>
              {order.deliveryMethod === 'DELIVERY' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-medium mt-1">123 Jalan Ganesha, Bandung, Indonesia</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium mt-1">
                      {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID')}
                    </p>
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
