import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

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
}

export const paymentRepository = new PaymentRepository()
