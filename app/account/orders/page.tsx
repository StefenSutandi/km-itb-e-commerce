'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order-status-badge'
import { Button } from '@/components/ui/button'
import { mockOrders } from '@/lib/mock-data'

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-8">
          <h1 className="text-4xl font-light">My Orders</h1>

          {mockOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">You haven&apos;t placed any orders yet</p>
              <Link href="/products">
                <Button className="rounded-full bg-black hover:bg-gray-900 text-white">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`}>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-start">
                      <div>
                        <p className="text-sm text-gray-600">UIOrder Number</p>
                        <p className="font-semibold">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">UIOrder Date</p>
                        <p className="font-semibold">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="mt-1">
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment</p>
                        <div className="mt-1">
                          <PaymentStatusBadge status={order.paymentStatus as any} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
