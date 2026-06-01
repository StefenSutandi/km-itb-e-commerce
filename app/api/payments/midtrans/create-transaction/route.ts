import { NextRequest, NextResponse } from 'next/server'
import { UIApiResponse, PaymentTransaction } from '@/lib/ui-types'
import { PaymentService, MockMidtransGateway } from '@/lib/services/payment.service'
import { getMockRepository } from '@/lib/repositories/mock.repository'

/**
 * POST /api/payments/midtrans/create-transaction
 * Create a Midtrans transaction for an order
 *
 * Request body:
 * {
 *   orderId: string
 *   customerEmail: string
 *   customerPhone: string
 *   customerName: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Validate MIDTRANS_SERVER_KEY is set
    if (!process.env.MIDTRANS_SERVER_KEY) {
      console.error('[v0] MIDTRANS_SERVER_KEY not set')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MIDTRANS_CONFIG_ERROR',
            message: 'Payment gateway not configured',
          },
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { orderId, customerEmail, customerPhone, customerName } = body

    // TODO: Add request validation with Zod
    // const createTransactionSchema = z.object({
    //   orderId: z.string(),
    //   customerEmail: z.string().email(),
    //   customerPhone: z.string(),
    //   customerName: z.string(),
    // })

    // TODO: Add authentication check
    // const session = await auth()
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 },
    //   )
    // }

    // Initialize services
    const mockRepo = getMockRepository() as any
    const paymentService = new PaymentService(mockRepo, new MockMidtransGateway())

    // Get order from database
    // TODO: Fetch order from real database instead of mock repo
    const order = await mockRepo.getOrderById(orderId)
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: `Order not found: ${orderId}`,
          },
        },
        { status: 404 },
      )
    }

    // Check order is in WAITING_PAYMENT status
    // TODO: Validate order status is WAITING_PAYMENT
    // if (order.status !== UIOrderStatus.WAITING_PAYMENT) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: {
    //         code: 'INVALID_ORDER_STATUS',
    //         message: `Order ${order.orderNumber} is not waiting for payment`,
    //       },
    //     },
    //     { status: 400 },
    //   )
    // }

    // Create Midtrans transaction
    const { payment, redirectUrl, token } = await paymentService.createMidtransTransaction(
      order,
      customerEmail,
      customerPhone,
      customerName,
    )

    // TODO: Store payment transaction in real database
    // const savedPayment = await db.paymentTransactions.create({ data: payment })

    const response: UIApiResponse<{
      payment: PaymentTransaction
      redirectUrl: string
      token: string
    }> = {
      success: true,
      data: {
        payment,
        redirectUrl,
        token,
      },
      timestamp: new Date(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('[v0] Midtrans transaction creation error:', error)

    const response: UIApiResponse<null> = {
      success: false,
      error: {
        code: 'PAYMENT_CREATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create payment transaction',
      },
      timestamp: new Date(),
    }

    return NextResponse.json(response, { status: 400 })
  }
}
