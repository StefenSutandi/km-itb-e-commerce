import { Card } from '@/components/ui/card'
import { mockOrders, mockProducts } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/format'

export default function AdminReportsPage() {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = mockOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const pendingRevenue = mockOrders
    .filter((o) => o.status === 'WAITING_PAYMENT')
    .reduce((sum, order) => sum + order.total, 0)

  // Calculate top products by orders
  const productOrderCount: Record<string, { name: string; count: number; revenue: number }> = {}
  mockOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = mockProducts.find((p) => p.id === item.productId)
      if (product) {
        if (!productOrderCount[item.productId]) {
          productOrderCount[item.productId] = {
            name: product.name,
            count: 0,
            revenue: 0,
          }
        }
        productOrderCount[item.productId].count += item.quantity
        productOrderCount[item.productId].revenue += item.subtotal
      }
    })
  })

  const topProducts = Object.entries(productOrderCount)
    .map(([_, data]) => data)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light">Sales Reports</h1>
        <p className="text-gray-600 mt-1">View detailed sales analytics and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </Card>
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Total Orders</p>
          <p className="text-3xl font-bold mt-2">{totalOrders}</p>
          <p className="text-xs text-gray-500 mt-2">Completed orders</p>
        </Card>
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Average Order Value</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(averageOrderValue)}</p>
          <p className="text-xs text-gray-500 mt-2">Per order</p>
        </Card>
        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Pending Revenue</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(pendingRevenue)}</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting payment</p>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6 border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Product</th>
                <th className="text-left py-3 px-4 font-semibold">Units Sold</th>
                <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                <th className="text-left py-3 px-4 font-semibold">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.count}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(product.revenue)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{
                            width: `${(product.revenue / totalRevenue) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {((product.revenue / totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Status Distribution */}
      <Card className="p-6 border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Order Status Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              status: 'WAITING_PAYMENT',
              label: 'Waiting Payment',
              color: 'bg-yellow-100 border-yellow-300',
            },
            {
              status: 'PAYMENT_RECEIVED',
              label: 'Payment Received',
              color: 'bg-green-100 border-green-300',
            },
          ].map((stat) => {
            const count = mockOrders.filter((o) => o.status === stat.status).length
            const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
            return (
              <div key={stat.status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{stat.label}</span>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <div className={`h-3 rounded-full border ${stat.color}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{percentage.toFixed(1)}% of all orders</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
