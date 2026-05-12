import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { mockProducts } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/format'

export default function HomePage() {
  const featuredProducts = mockProducts.slice(0, 3)

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen bg-black text-white flex flex-col justify-center px-4 md:px-8 py-20 md:py-0">
        <div className="max-w-6xl mx-auto w-full">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-7xl font-light leading-tight text-balance">
              KM ITB Official Merchandise
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              Premium quality apparel and accessories for the ITB community. Wear your pride with our exclusive collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-accent hover:bg-accent text-black font-semibold px-8 py-6"
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="#featured">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-white text-white hover:bg-white/10 font-semibold px-8 py-6"
                >
                  View Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="bg-white py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-light">Featured Collection</h2>
              <p className="text-gray-600 text-lg">Explore our most popular items</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
                    <div className="aspect-square bg-gray-200 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-black">
                          {formatCurrency(product.price)}
                        </span>
                        <Button
                          size="sm"
                          className="rounded-full bg-accent hover:bg-accent text-black font-medium"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="rounded-full border-black text-black hover:bg-black hover:text-white font-semibold px-8 py-6"
                >
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold">Premium Quality</h3>
              <p className="text-gray-600">
                Crafted from the finest materials for comfort and durability
              </p>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-gray-600">
                Same-day pickup or reliable delivery to your doorstep
              </p>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold">Official Design</h3>
              <p className="text-gray-600">
                Authentic KM ITB designs you won&apos;t find anywhere else
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
