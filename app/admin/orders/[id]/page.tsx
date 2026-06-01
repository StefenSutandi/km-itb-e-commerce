'use client'

import { useState } from 'react'
import { mockOrders, mockProducts } from '@/lib/mock-data'
import { formatCurrency, formatDate, formatOrderStatus } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order-status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = mockOrders.find((o) => o.id === params.id)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order?.status)

  if (!order) {
    return <div>Order not found</div>
  }

  const handleUpdateStatus = () => {
    console.log('Update order status to:', selectedStatus)
    setShowStatusModal(false)
    // TODO: Call API to update order status
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light">Order {order.orderNumber}</h1>
          <p className="text-gray-600 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <Button
          onClick={() => setShowStatusModal(true)}
          className="rounded-full bg-black hover:bg-gray-900 text-white"
        >
          Update Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card className="p-6 border-gray-200">
          <h3 className="font-semibold mb-4">Customer</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">Budi Santoso</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">budi@example.com</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">08123456789</p>
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
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <div className="mt-2">
                <PaymentStatusBadge status={order.paymentStatus as any} />
              </div>
            </div>
          </div>
        </Card>

        {/* Shipping Info */}
        <Card className="p-6 border-gray-200">
          <h3 className="font-semibold mb-4">Shipping</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Method</p>
              <p className="font-medium">
                {order.deliveryMethod === 'PICKUP' ? 'Pickup' : 'Delivery'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Cost</p>
              <p className="font-medium">
                {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="p-6 border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Product</th>
                <th className="text-left py-3 px-4 font-semibold">Qty</th>
                <th className="text-left py-3 px-4 font-semibold">Unit Price</th>
                <th className="text-left py-3 px-4 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any) => {
                const product = mockProducts.find((p) => p.id === item.productId)
                return (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{product?.name}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(item.subtotal)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 border-gray-200 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="font-bold mt-1">{formatCurrency(order.subtotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax</p>
            <p className="font-bold mt-1">{formatCurrency(order.taxAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Shipping</p>
            <p className="font-bold mt-1">{formatCurrency(order.shippingCost)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-bold mt-1 text-lg">{formatCurrency(order.total)}</p>
          </div>
        </div>
      </Card>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Update Order Status</h2>
            <div className="space-y-3 mb-6">
              {[
                'WAITING_PAYMENT',
                'PAYMENT_RECEIVED',
                'PROCESSING',
                'SHIPPED',
                'DELIVERED',
              ].map((status) => (
                <label
                  key={status}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="font-medium">{formatOrderStatus(status as any)}</span>
                </label>
              ))}
            </div>

            {selectedStatus !== order.status && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Confirm status change</p>
                  <p>
                    {formatOrderStatus(order.status)} → {formatOrderStatus(selectedStatus as any)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowStatusModal(false)}
                variant="outline"
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={selectedStatus === order.status}
                className="flex-1 rounded-full bg-black hover:bg-gray-900 text-white"
              >
                Update
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
