'use client'

import { useState } from 'react'
import { mockProducts, mockVariants } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = mockProducts.find((p) => p.slug === params.slug)

  if (!product) {
    notFound()
  }

  const variants = mockVariants.filter((v) => v.productId === product.id)
  const [selectedVariant, setSelectedVariant] = useState(variants[0])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const handleAddToCart = () => {
    // TODO: Implement cart state management
    console.log('Added to cart:', {
      product,
      variant: selectedVariant,
      quantity,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {product.images.map((image: any, idx: any) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={image} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-light leading-tight">{product.name}</h1>
              <p className="text-2xl font-semibold">{formatCurrency(product.price)}</p>
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Variant Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Select Option</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedVariant.id === variant.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={variant.stock === 0}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Info */}
            <div className="text-sm text-gray-600">
              {selectedVariant.stock > 0 ? (
                <span className="text-green-600 font-medium">{selectedVariant.stock} in stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of stock</span>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-300 rounded-lg py-2"
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={selectedVariant.stock === 0}
                className="w-full rounded-full bg-black hover:bg-gray-900 text-white font-semibold py-6"
              >
                Add to UICart
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-black text-black hover:bg-black hover:text-white font-semibold py-6"
              >
                Save for Later
              </Button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Shipping</p>
                <p className="text-gray-600">Free pickup or IDR 50,000 for delivery</p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Returns</p>
                <p className="text-gray-600">30-day hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
