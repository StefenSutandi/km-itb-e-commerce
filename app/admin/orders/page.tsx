import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { adminOrderRepository } from '@/lib/repositories/admin-order.repository'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/order-status-badge'

export const metadata = {
  title: 'Admin Orders | KM ITB Merchandise'
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: { search?: string, status?: string }
}) {
  const orders = await adminOrderRepository.getAdminOrders({
    search: searchParams.search,
    status: searchParams.status as any
  })

  const pendingCount = orders.filter(o => o.status === 'WAITING_PAYMENT').length
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length
  const manualReviewCount = orders.filter(o => o.status === 'MANUAL_REVIEW').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and shipments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{orders.length}</p>
            </div>
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold mt-1">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold mt-1">{completedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className={`p-4 ${manualReviewCount > 0 ? 'bg-amber-50 border-amber-200' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${manualReviewCount > 0 ? 'text-amber-800' : 'text-gray-600'}`}>Manual Review</p>
              <p className={`text-2xl font-bold mt-1 ${manualReviewCount > 0 ? 'text-amber-700' : 'text-gray-900'}`}>{manualReviewCount}</p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${manualReviewCount > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
          </div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Order Number</th>
                <th className="text-left py-4 px-6 font-semibold">Customer</th>
                <th className="text-left py-4 px-6 font-semibold">Amount</th>
                <th className="text-left py-4 px-6 font-semibold">Order Status</th>
                <th className="text-left py-4 px-6 font-semibold">Payment Status</th>
                <th className="text-left py-4 px-6 font-semibold">Date</th>
                <th className="text-left py-4 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const paymentStatus = order.payments?.[0]?.status || 'WAITING'
                  return (
                    <tr 
                      key={order.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${order.status === 'MANUAL_REVIEW' ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="py-4 px-6 font-medium">{order.orderNumber}</td>
                      <td className="py-4 px-6">
                        <p className="font-medium">{order.shippingName || order.user.name}</p>
                        <p className="text-xs text-gray-500">{order.user.email}</p>
                      </td>
                      <td className="py-4 px-6 font-medium">{formatCurrency(Number(order.total))}</td>
                      <td className="py-4 px-6">
                        <OrderStatusBadge status={order.status as any} />
                      </td>
                      <td className="py-4 px-6">
                        <PaymentStatusBadge status={paymentStatus as any} />
                      </td>
                      <td className="py-4 px-6 text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="py-4 px-6">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
