import { formatCurrency, formatDate } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order-status-badge'
import { Card } from '@/components/ui/card'
import { adminOrderRepository } from '@/lib/repositories/admin-order.repository'
import { AdminOrderManager } from '@/components/admin/admin-order-manager'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Admin Order Detail | KM ITB Merchandise',
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await adminOrderRepository.getAdminOrderById(params.id)

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-lg">Order not found.</p>
      </div>
    )
  }

  const firstPayment = order.payments?.[0]
  const paymentStatus = firstPayment?.status || 'WAITING'

  return (
    <div className="space-y-8">
      {order.status === 'MANUAL_REVIEW' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-6 py-4 rounded-lg shadow-sm flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h2 className="font-semibold text-lg">MANUAL REVIEW REQUIRED</h2>
            <p className="text-sm mt-1">
              This order was successfully paid, but there was an operational issue (e.g. insufficient stock). 
              Please verify inventory manually. Once resolved or refunded, update the status to PAYMENT_RECEIVED or CANCELLED below.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">Order {order.orderNumber}</h1>
          <p className="text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <AdminOrderManager 
          orderId={order.id} 
          currentStatus={order.status}
          deliveryMethod={order.deliveryMethod}
          shippingReceipt={order.shippingReceipt}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="p-6 border-gray-200">
          <h3 className="font-semibold mb-4">Customer</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{order.shippingName || order.user.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{order.user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{order.shippingPhone || order.user.waNumber || '-'}</p>
            </div>
          </div>
        </Card>

        {/* Order Status */}
        <Card className="p-6 border-gray-200">
          <h3 className="font-semibold mb-4">Status</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Order Status</p>
              <div className="mt-2">
                <OrderStatusBadge status={order.status as any} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <div className="mt-2 flex flex-col gap-1">
                <PaymentStatusBadge status={paymentStatus as any} />
                {firstPayment?.paidAt && (
                  <p className="text-xs text-gray-500 mt-1">Paid on: {formatDate(firstPayment.paidAt)}</p>
                )}
                <p className="text-xs text-gray-400 font-mono mt-1 break-all">ID: {firstPayment?.midtransId || '-'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Info */}
        <Card className="p-6 border-gray-200">
          <h3 className="font-semibold mb-4">Fulfillment Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Method</p>
              <p className="font-medium">
                {order.deliveryMethod === 'PICKUP' ? 'Pickup' : 'Delivery'}
              </p>
            </div>
            {order.deliveryMethod === 'DELIVERY' && (
              <>
                <div>
                  <p className="text-gray-600">Shipping Cost</p>
                  <p className="font-medium">
                    {Number(order.deliveryFee) === 0 ? 'FREE' : formatCurrency(Number(order.deliveryFee))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium mt-1 whitespace-pre-wrap leading-relaxed">
                    {order.shippingStreet}<br />
                    {order.shippingCity}{order.shippingPostal ? `, ${order.shippingPostal}` : ''}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="p-6 border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Product</th>
                <th className="text-left py-3 px-4 font-semibold">Variant / SKU</th>
                <th className="text-left py-3 px-4 font-semibold">Qty</th>
                <th className="text-left py-3 px-4 font-semibold">Unit Price</th>
                <th className="text-left py-3 px-4 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.productName}</td>
                  <td className="py-3 px-4 text-gray-600">{item.variantName} <br/><span className="text-xs opacity-60">{item.variantSku}</span></td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{formatCurrency(Number(item.price))}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(Number(item.subtotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="font-bold mt-1">{formatCurrency(Number(order.subtotal))}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Platform Fee (2%)</p>
            <p className="font-bold mt-1">{formatCurrency(Number(order.buyerFee))}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Delivery Fee</p>
            <p className="font-bold mt-1">{formatCurrency(Number(order.deliveryFee))}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-bold mt-1 text-lg">{formatCurrency(Number(order.total))}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
