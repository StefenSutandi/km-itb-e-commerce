import Link from 'next/link'
import { CartSummary } from '@/components/cart-summary'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import { cartRepository } from '@/lib/repositories/cart.repository'
import { CartItemList } from '@/components/cart/cart-item-list'

export const metadata = {
  title: 'Shopping Cart | KM ITB Merchandise',
}

export default async function CartPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <h1 className="text-4xl font-light mb-6">Shopping Cart</h1>
          <p className="text-gray-600 text-lg mb-8">Silakan login terlebih dahulu untuk melihat keranjang Anda.</p>
          <Link href="/login">
            <Button className="rounded-full bg-black hover:bg-gray-900 text-white px-8">
              Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const cart = await cartRepository.getCartByUserId(session.user.id)
  const items = cart?.items || []
  
  const summary = await cartRepository.calculateCartSummary(session.user.id)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* UICart Items */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-4xl font-light">Shopping Cart</h1>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                <Link href="/products">
                  <Button className="rounded-full bg-black hover:bg-gray-900 text-white">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <CartItemList initialItems={items} />
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={summary.subtotal}
              tax={summary.tax}
              shipping={summary.shipping}
              total={summary.total}
              onCheckout="/checkout"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
