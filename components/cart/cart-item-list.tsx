'use client'

import { useState } from 'react'
import { UICartItem } from '@/lib/ui-types'
import { Trash2 } from 'lucide-react'
import { updateCartQuantityAction, removeCartItemAction } from '@/app/cart/actions'

interface CartItemListProps {
  initialItems: UICartItem[]
}

export function CartItemList({ initialItems }: CartItemListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  // Local state for optimistic UI updates while server action runs
  const [items, setItems] = useState<UICartItem[]>(initialItems)

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setLoadingId(cartItemId)
    
    // Optimistic update
    setItems(current => current.map(item => 
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    ))

    const res = await updateCartQuantityAction(cartItemId, newQuantity)
    if (res?.error) {
      alert(res.error)
      // Revert optimistic update
      setItems(initialItems)
    }
    
    setLoadingId(null)
  }

  const handleRemove = async (cartItemId: string) => {
    setLoadingId(cartItemId)
    
    // Optimistic update
    setItems(current => current.filter(item => item.id !== cartItemId))

    const res = await removeCartItemAction(cartItemId)
    if (res?.error) {
      alert(res.error)
      // Revert optimistic update
      setItems(initialItems)
    }

    setLoadingId(null)
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex gap-4 p-4 border border-gray-200 rounded-lg transition-all ${
            loadingId === item.id ? 'opacity-50' : 'hover:border-gray-300'
          }`}
        >
          <img
            src={item.image || '/images/placeholder.jpg'}
            alt={item.productName}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{item.productName}</h3>
            <p className="text-sm text-gray-600">{item.variantName}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Qty:</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  disabled={loadingId === item.id}
                  onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value, 10))}
                  className="w-16 border border-gray-300 rounded py-1 px-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
                />
              </div>
              <span className="font-semibold">
                Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <button 
            onClick={() => handleRemove(item.id)}
            disabled={loadingId === item.id}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" />
          </button>
        </div>
      ))}
    </div>
  )
}
