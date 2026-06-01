import { ProductForm } from '@/components/admin/product-form'

export const metadata = {
  title: 'Add New Product | Admin KM ITB',
}

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light">Add New Product</h1>
      <ProductForm />
    </div>
  )
}
