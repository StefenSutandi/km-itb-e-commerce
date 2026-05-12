'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartSummary } from '@/components/cart-summary'
import { Truck, Package } from 'lucide-react'

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('DELIVERY')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null)

  const subtotal = 500000
  const tax = 50000
  const shipping = deliveryMethod === 'DELIVERY' ? 50000 : 0
  let discount = 0

  if (appliedVoucher) {
    discount = appliedVoucher.discount
  }

  const total = subtotal + tax + shipping - discount

  const handleApplyVoucher = () => {
    if (voucherCode === 'WELCOME10') {
      setAppliedVoucher({ code: voucherCode, discount: 50000 })
    } else {
      alert('Voucher code not found')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-light">Checkout</h1>

            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-2xl font-light">Contact Information</h2>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
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
                      <p className="text-sm text-gray-600">Rp 50,000</p>
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
                    type="text"
                    placeholder="Full address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
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
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              discount={discount}
              total={total}
              onCheckout={() => {
                // TODO: Call order creation API
                alert('Order created! Redirecting to payment...')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
