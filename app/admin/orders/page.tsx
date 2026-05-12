'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'
import { mockOrders } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle, Clock } from 'lucide-react'

export default function AdminOrdersPage() {
  const pendingOrders = mockOrders.filter((o) => o.status === 'WAITING_PAYMENT')
  const completedOrders = mockOrders.filter((o) => o.status === 'PAYMENT_RECEIVED')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and shipments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{mockOrders.length}</p>
            </div>
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold mt-1">{pendingOrders.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold mt-1">{completedOrders.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
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
                <th className="text-left py-4 px-6 font-semibold">Status</th>
                <th className="text-left py-4 px-6 font-semibold">Date</th>
                <th className="text-left py-4 px-6 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{order.orderNumber}</td>
                  <td className="py-4 px-6">
                    <p className="font-medium">Budi Santoso</p>
                    <p className="text-xs text-gray-500">budi@example.com</p>
                  </td>
                  <td className="py-4 px-6 font-medium">{formatCurrency(order.total)}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'PAYMENT_RECEIVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
