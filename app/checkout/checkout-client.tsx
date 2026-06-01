'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CartSummary } from '@/components/cart-summary'
import { Truck, Package } from 'lucide-react'
import { createOrderFromCartAction } from './actions'

interface CheckoutClientProps {
  initialSubtotal: number
  initialTax: number
  baseShipping: number
  initialTotal: number
}

export function CheckoutClient({
  initialSubtotal,
  initialTax,
  baseShipping,
  initialTotal,
}: CheckoutClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const shipping = deliveryMethod === 'DELIVERY' ? baseShipping : 0
  let discount = 0

  if (appliedVoucher) {
    discount = appliedVoucher.discount
  }

  // initialTax is effectively the 2% buyer fee now.
  const total = initialSubtotal + initialTax + shipping - discount

  const handleApplyVoucher = () => {
    if (voucherCode === 'WELCOME10') {
      setAppliedVoucher({ code: voucherCode, discount: 50000 })
    } else {
      alert('Voucher code not found')
    }
  }

  const handleCheckout = () => {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('deliveryMethod', deliveryMethod)
      // Form fields would be gathered here if we used proper react-hook-form
      // For now we just mock the contact info based on inputs
      const emailInput = document.getElementById('email') as HTMLInputElement
      const phoneInput = document.getElementById('phone') as HTMLInputElement
      if (emailInput?.value) formData.append('shippingName', emailInput.value)
      if (phoneInput?.value) formData.append('shippingPhone', phoneInput.value)
      
      if (deliveryMethod === 'DELIVERY') {
        const addressInput = document.getElementById('address') as HTMLInputElement
        const cityInput = document.getElementById('city') as HTMLInputElement
        const postalInput = document.getElementById('postal') as HTMLInputElement
        
        if (addressInput?.value) formData.append('shippingStreet', addressInput.value)
        if (cityInput?.value) formData.append('shippingCity', cityInput.value)
        if (postalInput?.value) formData.append('shippingPostal', postalInput.value)
      }

      const res = await createOrderFromCartAction(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.orderId) {
        router.push(`/account/orders/${res.orderId}`)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
      {/* Form */}
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-4xl font-light">Checkout</h1>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-light">Contact Information</h2>
          <div className="space-y-3">
            <input
              id="email"
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              id="phone"
              type="tel"
              placeholder="Phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* Delivery Method */}
        <div className="space-y-4">
          <h2 className="text-2xl font-light">Delivery Method</h2>
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
              <input
                type="radio"
                name="delivery"
                value="PICKUP"
                checked={deliveryMethod === 'PICKUP'}
                onChange={() => setDeliveryMethod('PICKUP')}
                className="w-4 h-4 mr-3"
              />
              <div className="flex items-center gap-3 flex-1">
                <Package className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Pickup at Store</p>
                  <p className="text-sm text-gray-600">FREE</p>
                </div>
              </div>
            </label>
            <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
              <input
                type="radio"
                name="delivery"
                value="DELIVERY"
                checked={deliveryMethod === 'DELIVERY'}
                onChange={() => setDeliveryMethod('DELIVERY')}
                className="w-4 h-4 mr-3"
              />
              <div className="flex items-center gap-3 flex-1">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Delivery</p>
                  <p className="text-sm text-gray-600">Rp {baseShipping.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {deliveryMethod === 'DELIVERY' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-light">Delivery Address</h2>
            <div className="space-y-3">
              <input
                id="address"
                type="text"
                placeholder="Full address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  id="city"
                  type="text"
                  placeholder="City"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  id="postal"
                  type="text"
                  placeholder="Postal code"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
        )}

        {/* Voucher */}
        <div className="space-y-4">
          <h2 className="text-2xl font-light">Promo Code</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter voucher code (e.g., WELCOME10)"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <Button
              onClick={handleApplyVoucher}
              variant="outline"
              className="rounded-lg border-black text-black hover:bg-black hover:text-white"
            >
              Apply
            </Button>
          </div>
          {appliedVoucher && (
            <p className="text-green-600 text-sm font-medium">
              Voucher applied: {appliedVoucher.code}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        <CartSummary
          subtotal={initialSubtotal}
          tax={initialTax}
          shipping={shipping}
          discount={discount}
          total={total}
          onCheckout={handleCheckout}
          isLoading={isPending}
        />
        <div className="text-sm text-gray-500 text-center">
          Payment processing will be available in the next phase. Order will be created as WAITING_PAYMENT.
        </div>
      </div>
    </div>
  )
}
