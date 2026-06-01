'use server'

import { auth } from '@/auth'
import { adminOrderRepository } from '@/lib/repositories/admin-order.repository'
import { OrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    await adminOrderRepository.updateAdminOrderStatus(orderId, status, session.user.id)

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Update status error:', error)
    return { error: error.message || 'Failed to update order status' }
  }
}

export async function updateShippingReceiptAction(orderId: string, receiptNumber: string) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPERADMIN'].includes(session.user.role)) {
      return { error: 'Unauthorized' }
    }

    if (!receiptNumber || receiptNumber.trim() === '') {
      return { error: 'Receipt number is required' }
    }

    await adminOrderRepository.updateShippingReceipt(orderId, receiptNumber, session.user.id)

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Update receipt error:', error)
    return { error: error.message || 'Failed to update shipping receipt' }
  }
}
