'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { updateOrderStatusAction, updateShippingReceiptAction } from '@/app/admin/orders/actions'
import { formatOrderStatus } from '@/lib/format'
import { OrderStatus } from '@prisma/client'

export function AdminOrderManager({ 
  orderId, 
  currentStatus, 
  deliveryMethod,
  shippingReceipt 
}: { 
  orderId: string
  currentStatus: OrderStatus
  deliveryMethod: string
  shippingReceipt?: string | null
}) {
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [receiptInput, setReceiptInput] = useState(shippingReceipt || '')
  const [isUpdatingReceipt, setIsUpdatingReceipt] = useState(false)

  // Status transitions
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    WAITING_PAYMENT: ['CANCELLED'],
    MANUAL_REVIEW: ['PAYMENT_RECEIVED', 'CANCELLED'],
    PAYMENT_RECEIVED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: deliveryMethod === 'PICKUP' 
      ? ['READY_FOR_PICKUP', 'CANCELLED'] 
      : ['READY_TO_SHIP', 'CANCELLED'],
    READY_FOR_PICKUP: ['COMPLETED'],
    READY_TO_SHIP: [], // Requires shipping receipt to proceed
    SHIPPED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: []
  }

  const validNextStates = allowedTransitions[currentStatus] || []
  
  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) return
    setIsUpdating(true)
    
    const res = await updateOrderStatusAction(orderId, selectedStatus)
    setIsUpdating(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setShowStatusModal(false)
    }
  }

  const handleUpdateReceipt = async () => {
    if (!receiptInput.trim()) return
    setIsUpdatingReceipt(true)
    
    const res = await updateShippingReceiptAction(orderId, receiptInput.trim())
    setIsUpdatingReceipt(false)
    if (res?.error) {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setSelectedStatus(currentStatus)
            setShowStatusModal(true)
          }}
          disabled={validNextStates.length === 0}
          className="rounded-full bg-black hover:bg-gray-900 text-white"
        >
          Update Status
        </Button>
      </div>

      {deliveryMethod === 'DELIVERY' && (currentStatus === 'READY_TO_SHIP' || currentStatus === 'SHIPPED') && (
        <Card className="p-4 border-gray-200 bg-blue-50/50">
          <h3 className="text-sm font-semibold mb-2">Shipping Receipt Number</h3>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={receiptInput}
              onChange={(e) => setReceiptInput(e.target.value)}
              placeholder="Input resi..." 
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <Button 
              onClick={handleUpdateReceipt}
              disabled={isUpdatingReceipt || !receiptInput.trim() || receiptInput === shippingReceipt}
              size="sm"
            >
              {isUpdatingReceipt ? 'Saving...' : 'Save Receipt'}
            </Button>
          </div>
          {currentStatus === 'READY_TO_SHIP' && (
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Saving receipt will automatically mark order as SHIPPED
            </p>
          )}
        </Card>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Update Order Status</h2>
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg opacity-60 bg-gray-50">
                <input
                  type="radio"
                  readOnly
                  checked={selectedStatus === currentStatus}
                  className="w-4 h-4 mr-3"
                />
                <span className="font-medium text-gray-500">
                  {formatOrderStatus(currentStatus as any)} (Current)
                </span>
              </label>

              {validNextStates.map((status) => (
                <label
                  key={status}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-4 h-4 mr-3"
                  />
                  <span className="font-medium">{formatOrderStatus(status as any)}</span>
                </label>
              ))}
            </div>

            {selectedStatus !== currentStatus && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Confirm status change</p>
                  <p>
                    {formatOrderStatus(currentStatus as any)} → {formatOrderStatus(selectedStatus as any)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowStatusModal(false)}
                variant="outline"
                className="flex-1 rounded-full"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={selectedStatus === currentStatus || isUpdating}
                className="flex-1 rounded-full bg-black hover:bg-gray-900 text-white"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
