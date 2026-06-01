'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { orderRepository, CreateOrderInput } from '@/lib/repositories/order.repository'
import { logAuditAction } from '@/lib/audit'
import { DeliveryMethod } from '@prisma/client'

export async function createOrderFromCartAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Please log in to complete your order' }
    }

    const deliveryMethod = formData.get('deliveryMethod') as DeliveryMethod
    if (!deliveryMethod) {
      return { error: 'Delivery method is required' }
    }

    const input: CreateOrderInput = {
      deliveryMethod,
      shippingName: formData.get('shippingName') as string | undefined,
      shippingPhone: formData.get('shippingPhone') as string | undefined,
      shippingStreet: formData.get('shippingStreet') as string | undefined,
      shippingCity: formData.get('shippingCity') as string | undefined,
      shippingPostal: formData.get('shippingPostal') as string | undefined,
    }

    const order = await orderRepository.createOrderFromCart(session.user.id, input)

    await logAuditAction({
      actorId: session.user.id,
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, total: order.total }
    })

    await logAuditAction({
      actorId: session.user.id,
      action: 'CART_CLEARED_AFTER_ORDER',
      entityType: 'Cart',
      entityId: session.user.id
    })

    revalidatePath('/cart')
    revalidatePath('/checkout')
    revalidatePath('/account/orders')

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error('Create order error:', error)
    return { error: error.message || 'Failed to create order' }
  }
}
