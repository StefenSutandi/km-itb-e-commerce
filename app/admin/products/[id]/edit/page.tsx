import { ProductForm } from '@/components/admin/product-form'
import { adminProductRepository } from '@/lib/repositories/admin-product.repository'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Edit Product | Admin KM ITB',
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await adminProductRepository.getAdminProductById(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light">Edit Product</h1>
      <ProductForm initialData={product} />
    </div>
  )
}
