import { mockProducts } from '@/lib/mock-data'
import { ProductGrid } from '@/components/product-grid'

export const metadata = {
  title: 'Shop | KM ITB Official Merchandise',
  description: 'Browse our complete collection of KM ITB official merchandise',
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-light">Shop Our Collection</h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Browse our selection of premium quality KM ITB merchandise. Each item is carefully curated for style and comfort.
            </p>
          </div>

          {/* Products Grid */}
          <ProductGrid products={mockProducts} />
        </div>
      </div>
    </div>
  )
}
