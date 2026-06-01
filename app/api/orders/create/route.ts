import { NextRequest, NextResponse } from 'next/server'
import { UIOrder, UIOrderStatus, UIPaymentStatus, UIDeliveryMethod, UIOrderItem, UICreateOrderRequest, UIApiResponse } from "@/lib/ui-types"
import { OrderService } from '@/lib/services/order.service'
import { PaymentService, MockMidtransGateway } from '@/lib/services/payment.service'
import { getMockRepository } from '@/lib/repositories/mock.repository'

/**
 * POST /api/orders/create
 * Create a new order from cart items and initiate payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const req: UICreateOrderRequest = body

    // TODO: Add request validation with Zod
    // const createOrderSchema = z.object({
    //   userId: z.string(),
    //   items: z.array(CartItemSchema),
    //   deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),
    //   voucherCode: z.string().optional(),
    // })

    // TODO: Add authentication check
    // const session = await auth()
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 },
    //   )
    // }

    // Initialize services with mock repository
    const mockRepo = getMockRepository() as any
    const orderService = new OrderService(mockRepo, mockRepo, mockRepo)
    const paymentService = new PaymentService(mockRepo, new MockMidtransGateway())

    // Create order
    const order = await orderService.createOrder(req)

    // TODO: Store order in real database here
    // const savedOrder = await db.orders.create({ data: order })

    const response: UIApiResponse<UIOrder> = {
      success: true,
      data: order,
      timestamp: new Date(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('[v0] Order creation error:', error)

    const response: UIApiResponse<null> = {
      success: false,
      error: {
        code: 'ORDER_CREATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create order',
      },
      timestamp: new Date(),
    }

    return NextResponse.json(response, { status: 400 })
  }
}
