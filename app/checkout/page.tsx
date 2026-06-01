import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import { cartRepository } from '@/lib/repositories/cart.repository'
import { CheckoutClient } from './checkout-client'

export const metadata = {
  title: 'Checkout | KM ITB Merchandise',
}

export default async function CheckoutPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <h1 className="text-4xl font-light mb-6">Checkout</h1>
          <p className="text-gray-600 text-lg mb-8">Silakan login terlebih dahulu untuk melakukan checkout.</p>
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
  
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <h1 className="text-4xl font-light mb-6">Checkout</h1>
          <p className="text-gray-600 text-lg mb-8">Your cart is empty.</p>
          <Link href="/products">
            <Button className="rounded-full bg-black hover:bg-gray-900 text-white px-8">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const summary = await cartRepository.calculateCartSummary(session.user.id)
  
  // Replace tax with 2% buyer fee for checkout
  const buyerFee = Math.round(summary.subtotal * 0.02)
  const baseShipping = 50000 // Mock base shipping
  const initialTotal = summary.subtotal + buyerFee + baseShipping

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <CheckoutClient 
          initialSubtotal={summary.subtotal}
          initialTax={buyerFee} // Pass buyer fee as the tax/fee field
          baseShipping={baseShipping}
          initialTotal={initialTotal}
        />
      </div>
    </div>
  )
}
