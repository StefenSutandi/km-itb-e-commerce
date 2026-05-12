import { Card } from '@/components/ui/card'
import { mockProducts, mockOrders } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/format'
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = mockOrders.length
  const totalProducts = mockProducts.length

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Pending Orders',
      value: mockOrders.filter((o) => o.status === 'WAITING_PAYMENT').length,
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-light">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back to the KM ITB admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card className="p-6 border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Order #</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4">
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
                  <td className="py-3 px-4">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
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
