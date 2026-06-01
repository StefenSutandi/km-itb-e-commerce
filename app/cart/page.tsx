'use client'

import Link from 'next/link'
import { CartSummary } from '@/components/cart-summary'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

// Mock cart items for demo
const mockCartItems = [
  {
    id: 'c1',
    productName: 'KM ITB Premium Hoodie',
    variant: 'Black - M',
    price: 299000,
    quantity: 1,
    image: '/images/product-1.jpg',
  },
  {
    id: 'c2',
    productName: 'KM ITB Classic T-Shirt',
    variant: 'White - L',
    price: 129000,
    quantity: 2,
    image: '/images/product-2.jpg',
  },
]

export default function CartPage() {
  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.1)
  const shipping = 50000 // Delivery cost
  const total = subtotal + tax + shipping

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* UICart Items */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-4xl font-light">Shopping UICart</h1>

            {mockCartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                <Link href="/products">
                  <Button className="rounded-full bg-black hover:bg-gray-900 text-white">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mockCartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.productName}</h3>
                      <p className="text-sm text-gray-600">{item.variant}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Qty:</span>
                          <input
                            type="number"
                            value={item.quantity}
                            className="w-12 border border-gray-300 rounded py-1 px-2 text-sm text-center"
                          />
                        </div>
                        <span className="font-semibold">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
              onCheckout={() => {
                // TODO: Navigate to checkout
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
