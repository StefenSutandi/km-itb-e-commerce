'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2, Trash2, Archive, CheckCircle } from 'lucide-react'
import { UIProduct } from '@/lib/ui-types'
import { archiveProductAction, publishProductAction } from '@/app/admin/products/actions'

export function AdminProductsTable({ products }: { products: UIProduct[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product? It will be hidden from the public catalog.')) return
    setLoadingId(id)
    try {
      await archiveProductAction(id)
    } finally {
      setLoadingId(null)
    }
  }

  const handlePublish = async (id: string) => {
    if (!confirm('Are you sure you want to publish this product to the public catalog?')) return
    setLoadingId(id)
    try {
      await publishProductAction(id)
    } finally {
      setLoadingId(null)
    }
  }

  return (
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No products found. Add one to get started!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.slug}</p>
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
                        product.status === 'PUBLISHED' || product.status === 'READY_STOCK'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'ARCHIVED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      
                      {product.status !== 'PUBLISHED' && product.status !== 'ARCHIVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePublish(product.id)}
                          disabled={loadingId === product.id}
                          className="text-green-600 hover:text-green-700 gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Publish
                        </Button>
                      )}

                      {product.status !== 'ARCHIVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArchive(product.id)}
                          disabled={loadingId === product.id}
                          className="text-red-600 hover:text-red-700 gap-2"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
