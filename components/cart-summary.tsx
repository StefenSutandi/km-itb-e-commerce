import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface CartSummaryProps {
  subtotal: number
  tax: number
  shipping: number
  discount?: number
  total: number
  onCheckout?: string | (() => void)

  isLoading?: boolean
}

export function CartSummary({
  subtotal,
  tax,
  shipping,
  discount = 0,
  total,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
      <h2 className="text-xl font-semibold">Order Summary</h2>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Platform Fee (2%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {typeof onCheckout === 'string' ? (
        <a href={onCheckout} className="block w-full mt-4">
          <Button
            disabled={isLoading || total === 0}
            className="w-full rounded-full bg-black hover:bg-gray-900 text-white font-semibold py-6"
          >
            {isLoading ? 'Processing...' : 'Proceed to Checkout'}
          </Button>
        </a>
      ) : (
        <Button
          onClick={onCheckout}
          disabled={isLoading || total === 0}
          className="w-full rounded-full bg-black hover:bg-gray-900 text-white font-semibold py-6 mt-4"
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      )}
    </div>
  )
}
