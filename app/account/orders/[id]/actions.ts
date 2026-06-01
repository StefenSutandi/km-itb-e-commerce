'use server'

import { auth } from '@/auth'
import { orderRepository } from '@/lib/repositories/order.repository'
import { paymentRepository } from '@/lib/repositories/payment.repository'
import { createSnapTransaction, MidtransTransactionPayload, MidtransItemDetail } from '@/lib/payments/midtrans'

export async function createMidtransTransactionAction(orderId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    const order = await orderRepository.getOrderByIdForUser(session.user.id, orderId)
    
    if (!order) {
      return { error: 'Order not found or does not belong to you' }
    }

    if (order.status !== 'WAITING_PAYMENT') {
      return { error: 'Order is not in WAITING_PAYMENT status' }
    }

    const firstPayment = order.payments?.[0]
    if (!firstPayment || (firstPayment.status !== 'WAITING' && firstPayment.status !== 'PENDING')) {
      return { error: 'Payment cannot be initialized' }
    }

    // If we already have a snap redirect URL generated, just return it so they can resume
    if (firstPayment.snapRedirectUrl) {
      return { redirectUrl: firstPayment.snapRedirectUrl }
    }

    // Build Midtrans Order ID: KM-{internalOrderId}-{timestamp}
    const midtransId = `KM-${order.id.slice(0, 8)}-${Date.now()}`

    // Map OrderItems
    const item_details: MidtransItemDetail[] = order.items.map(item => ({
      id: item.id,
      price: Number(item.price),
      quantity: item.quantity,
      name: `${item.productName} - ${item.variantName}`.slice(0, 50) // Midtrans limit
    }))

    // Add Platform Fee as an item
    if (Number(order.buyerFee) > 0) {
      item_details.push({
        id: 'FEE-PLATFORM',
        price: Number(order.buyerFee),
        quantity: 1,
        name: 'Platform Fee (2%)'
      })
    }

    // Add Delivery Fee as an item
    if (Number(order.deliveryFee) > 0) {
      item_details.push({
        id: 'FEE-DELIVERY',
        price: Number(order.deliveryFee),
        quantity: 1,
        name: 'Delivery Fee'
      })
    }

    // Build Payload
    const payload: MidtransTransactionPayload = {
      transaction_details: {
        order_id: midtransId,
        gross_amount: Number(order.total)
      },
      item_details,
      customer_details: {
        first_name: order.shippingName || session.user.name || 'Buyer',
        email: session.user.email || 'guest@example.com',
        phone: order.shippingPhone || '000000000000'
      }
    }

    // Call Midtrans API
    const response = await createSnapTransaction(payload)

    // Update DB
    await paymentRepository.updatePaymentWithSnapData(
      order.id,
      midtransId,
      response.token,
      response.redirect_url,
      response
    )

    return { redirectUrl: response.redirect_url }
  } catch (error: any) {
    console.error('Midtrans API error:', error)
    return { error: error.message || 'Failed to create payment transaction' }
  }
}
