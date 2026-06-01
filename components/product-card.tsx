import Link from 'next/link'
import { UIProduct } from "@/lib/ui-types"
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  product: UIProduct
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group cursor-pointer space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-gray-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-semibold">{formatCurrency(product.price)}</span>
            <Button
              size="sm"
              className="rounded-full bg-accent hover:bg-accent text-black font-medium"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
