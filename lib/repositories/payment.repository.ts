import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'
import { sendManualReviewEmail, sendPaymentSuccessEmail } from '@/lib/notifications/email'

export class PaymentRepository {
  /**
   * Updates an existing PaymentTransaction with Midtrans Snap data
   * and sets the status to PENDING.
   */
  async updatePaymentWithSnapData(
    orderId: string,
    midtransId: string,
    snapToken: string,
    snapRedirectUrl: string,
    rawResponse: any
  ) {
    // Find the existing placeholder payment
    const payment = await prisma.paymentTransaction.findFirst({
      where: { orderId }
    })

    if (!payment) {
      throw new Error('Payment transaction not found for this order')
    }

    return prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        midtransId,
        snapToken,
        snapRedirectUrl,
        status: PaymentStatus.PENDING,
        paymentType: 'MIDTRANS_SNAP',
        rawResponse
      }
    })
  }

  async getPaymentByOrderId(orderId: string) {
    return prisma.paymentTransaction.findFirst({
      where: { orderId }
    })
  }

  async getPaymentByMidtransOrderId(midtransId: string) {
    return prisma.paymentTransaction.findUnique({
      where: { midtransId }
    })
  }

  /**
   * Idempotent webhook handler to process Midtrans notifications.
   */
  async handleMidtransNotification(notification: any) {
    const { order_id, transaction_status, fraud_status } = notification

    const payment = await this.getPaymentByMidtransOrderId(order_id)
    if (!payment) {
      return { status: 'ignored', reason: 'payment not found' }
    }

    // If already SUCCESS, return early (idempotent)
    if (payment.status === PaymentStatus.SUCCESS) {
      return { status: 'idempotent', reason: 'already success' }
    }

    let newPaymentStatus: PaymentStatus = payment.status

    // Status Mapping
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newPaymentStatus = PaymentStatus.SUCCESS
      }
    } else if (transaction_status === 'settlement') {
      newPaymentStatus = PaymentStatus.SUCCESS
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newPaymentStatus = transaction_status === 'expire' ? PaymentStatus.EXPIRED : (transaction_status === 'cancel' ? PaymentStatus.CANCELLED : PaymentStatus.FAILED)
    } else if (transaction_status === 'pending') {
      newPaymentStatus = PaymentStatus.PENDING
    }

    // If the status isn't changing to SUCCESS or FAILED/EXPIRED, just update the payment status and rawResponse
    if (newPaymentStatus === PaymentStatus.PENDING || newPaymentStatus === payment.status) {
      await prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          rawResponse: notification
        }
      })
      return { status: 'updated', paymentStatus: newPaymentStatus }
    }

    // Transaction for SUCCESS or terminal failures
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
        include: { items: true, user: true }
      })

      if (!order) throw new Error('Order not found')

      if (newPaymentStatus === PaymentStatus.SUCCESS) {
        // Stock re-check
        let hasInsufficientStock = false
        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId }
          })
          if (!variant || variant.stock < item.quantity) {
            hasInsufficientStock = true
            break
          }
        }

        if (hasInsufficientStock) {
          // Insufficient Stock -> Payment Success, but Order Manual Review
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'MANUAL_REVIEW' }
          })
          
          sendManualReviewEmail(order, order.user.email || '', order.userId)
        } else {
          // Sufficient Stock -> Decrement stock & mark Order Payment Received
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } }
            })
          }
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'PAYMENT_RECEIVED' }
          })

          sendPaymentSuccessEmail(order, order.user.email || '', order.userId)
        }
      } else {
        // Terminal Failure (EXPIRED, CANCELLED, FAILED)
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' }
        })
      }

      // Update payment
      await tx.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          paidAt: newPaymentStatus === PaymentStatus.SUCCESS ? new Date() : null,
          rawResponse: notification
        }
      })
    })

    return { status: 'updated', paymentStatus: newPaymentStatus }
  }
}

export const paymentRepository = new PaymentRepository()
