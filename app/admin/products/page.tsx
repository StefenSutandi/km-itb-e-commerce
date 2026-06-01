import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { adminProductRepository } from '@/lib/repositories/admin-product.repository'
import { AdminProductsTable } from '@/components/admin/admin-products-table'

export const metadata = {
  title: 'Admin Products | KM ITB Merchandise'
}

export default async function AdminProductsPage() {
  const products = await adminProductRepository.getAllProducts()

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

      <AdminProductsTable products={products} />
    </div>
  )
}
