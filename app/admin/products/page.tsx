'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/format'
import { mockProducts } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2, Plus } from 'lucide-react'

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="rounded-full bg-accent hover:bg-accent text-black gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <Card className="border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Product</th>
                <th className="text-left py-4 px-6 font-semibold">Category</th>
                <th className="text-left py-4 px-6 font-semibold">Price</th>
                <th className="text-left py-4 px-6 font-semibold">Status</th>
                <th className="text-left py-4 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium">{formatCurrency(product.price)}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
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
