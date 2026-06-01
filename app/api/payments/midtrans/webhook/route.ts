import { NextRequest, NextResponse } from 'next/server'
import { UIApiResponse, PaymentTransaction, UIOrderStatus } from '@/lib/ui-types'
import { PaymentService, MockMidtransGateway } from '@/lib/services/payment.service'
import { OrderService } from '@/lib/services/order.service'
import { getMockRepository } from '@/lib/repositories/mock.repository'

/**
 * POST /api/payments/midtrans/webhook
 * Handle Midtrans webhook callbacks for payment status updates
 *
 * Midtrans sends webhook with:
 * {
 *   transaction_time: "2024-05-12 10:30:00"
 *   transaction_status: "settlement" | "capture" | "deny" | "cancel" | "expire" | "failure" | "pending"
 *   transaction_id: "1234567890"
 *   status_message: "Success, transaction is accepted"
 *   status_code: "200"
 *   signature_key: "..." // HMAC SHA512 signature
 *   order_id: "KM-20240512-A3F8E2-..." // Our order ID from Midtrans
 *   gross_amount: "100000.00"
 *   currency: "IDR"
 *   payment_type: "credit_card" | "transfer_bank" | "cstore" | etc.
 *   fraud_status: "accept" | "deny"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      transaction_id,
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
      fraud_status,
    } = body

    console.log('[v0] Received Midtrans webhook:', {
      transaction_id,
      order_id,
      transaction_status,
      status_code,
    })

    // TODO: Verify Midtrans signature to prevent spoofing
    // Signature verification: HMAC-SHA512(orderId + statusCode + grossAmount, serverKey)
    // const serverKey = process.env.MIDTRANS_SERVER_KEY!
    // const expectedSignature = crypto
    //   .createHmac('sha512', serverKey)
    //   .update(`${order_id}${status_code}${gross_amount}`)
    //   .digest('hex')
    // if (signature_key !== expectedSignature) {
    //   console.error('[v0] Invalid Midtrans signature')
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: { code: 'INVALID_SIGNATURE' },
    //     },
    //     { status: 401 },
    //   )
    // }

    // Initialize services
    const mockRepo = getMockRepository() as any
    const paymentService = new PaymentService(mockRepo, new MockMidtransGateway())
    const orderService = new OrderService(mockRepo, mockRepo, mockRepo)

    // TODO: Handle idempotency - check if webhook was already processed
    // Look up payment by external transaction ID to avoid double processing
    // const existingPayment = await db.paymentTransactions.findUnique({
    //   where: { externalTransactionId: transaction_id }
    // })
    // If already processed, just return success to acknowledge receipt

    // Handle payment status update
    const payment = await paymentService.handleMidtransWebhook(
      order_id,
      transaction_status,
      gross_amount,
      signature_key,
    )

    console.log('[v0] Payment updated:', {
      paymentId: payment.id,
      status: payment.status,
    })

    // TODO: Update order status if payment successful
    // Check if payment is captured/settled
    // if (['captured', 'settlement'].includes(transaction_status)) {
    //   // Get the payment to find the order ID
    //   const payment = await paymentService.getPayment(...)
    //   // Update order status to PAYMENT_RECEIVED
    //   await orderService.updateOrderStatus(
    //     payment.orderId,
    //     UIOrderStatus.PAYMENT_RECEIVED,
    //   )
    //   console.log('[v0] Order status updated to PAYMENT_RECEIVED:', payment.orderId)
    //
    //   // TODO: Send confirmation email to customer
    //   // TODO: Send notification to admin
    //   // TODO: Trigger order processing (if auto-processing)
    // }

    // TODO: Handle fraud detection
    // if (fraud_status === 'deny') {
    //   await orderService.updateOrderStatus(
    //     payment.orderId,
    //     UIOrderStatus.CANCELLED,
    //   )
    //   // TODO: Send fraud alert email
    // }

    // TODO: Handle payment denial/expiry
    // if (['deny', 'expire', 'failure'].includes(transaction_status)) {
    //   await orderService.updateOrderStatus(
    //     payment.orderId,
    //     UIOrderStatus.CANCELLED,
    //   )
    //   // TODO: Send failure notification email
    // }

    const response: UIApiResponse<PaymentTransaction> = {
      success: true,
      data: payment,
      timestamp: new Date(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('[v0] Webhook processing error:', error)

    // Always return 200 OK to Midtrans even if we encountered an error
    // This prevents Midtrans from retrying the webhook
    const response: UIApiResponse<null> = {
      success: false,
      error: {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      timestamp: new Date(),
    }

    return NextResponse.json(response, { status: 200 })
  }
}

/**
 * Optional: GET endpoint for testing webhook configuration
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Midtrans webhook endpoint is active',
      endpoint: '/api/payments/midtrans/webhook',
      method: 'POST',
    },
    { status: 200 },
  )
}
