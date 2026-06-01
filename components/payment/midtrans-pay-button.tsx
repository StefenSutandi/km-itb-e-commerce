'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createMidtransTransactionAction } from '@/app/account/orders/[id]/actions'

interface MidtransPayButtonProps {
  orderId: string
  existingRedirectUrl?: string | null
}

export function MidtransPayButton({ orderId, existingRedirectUrl }: MidtransPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (existingRedirectUrl) {
        window.location.href = existingRedirectUrl
        return
      }

      const res = await createMidtransTransactionAction(orderId)

      if (res?.error) {
        setError(res.error)
        setIsLoading(false)
      } else if (res?.redirectUrl) {
        window.location.href = res.redirectUrl
      } else {
        setError('Failed to get payment URL')
        setIsLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handlePay} 
        disabled={isLoading}
        className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-medium"
      >
        {isLoading ? 'Processing...' : 'Bayar Sekarang'}
      </Button>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}
