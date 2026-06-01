import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export class AdminOrderRepository {
  /**
   * Fetches all orders for the admin list view
   */
  async getAdminOrders(searchParams?: {
    status?: OrderStatus
    search?: string
  }) {
    const where: any = {}

    if (searchParams?.status) {
      where.status = searchParams.status
    }

    if (searchParams?.search) {
      const search = searchParams.search
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
  }

  /**
   * Fetches detailed order data for the admin detail view
   */
  async getAdminOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, waNumber: true } },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  /**
   * Updates order status with strict transition rules
   */
  async updateAdminOrderStatus(id: string, newStatus: OrderStatus, adminId: string) {
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) throw new Error('Order not found')

    const currentStatus = order.status

    // State machine logic
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      WAITING_PAYMENT: ['CANCELLED'],
      MANUAL_REVIEW: ['PAYMENT_RECEIVED', 'CANCELLED'],
      PAYMENT_RECEIVED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: order.deliveryMethod === 'PICKUP' 
        ? ['READY_FOR_PICKUP', 'CANCELLED'] 
        : ['READY_TO_SHIP', 'CANCELLED'],
      READY_FOR_PICKUP: ['COMPLETED'],
      READY_TO_SHIP: [], // Must use updateShippingReceipt to transition to SHIPPED
      SHIPPED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: []
    }

    const validNextStates = allowedTransitions[currentStatus] || []
    
    if (!validNextStates.includes(newStatus)) {
      throw new Error(`Invalid transition from ${currentStatus} to ${newStatus}`)
    }

    // Execute update and log audit
    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: newStatus }
      })

      let auditAction = 'ORDER_STATUS_UPDATED'
      if (newStatus === 'CANCELLED') auditAction = 'ORDER_CANCELLED'
      if (currentStatus === 'MANUAL_REVIEW' && newStatus !== 'CANCELLED') auditAction = 'MANUAL_REVIEW_RESOLVED'

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: auditAction,
          entityType: 'ORDER',
          entityId: id,
          metadata: { from: currentStatus, to: newStatus }
        }
      })

      return updatedOrder
    })
  }

  /**
   * Updates shipping receipt and auto-transitions to SHIPPED
   */
  async updateShippingReceipt(id: string, receiptNumber: string, adminId: string) {
    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) throw new Error('Order not found')
    if (order.deliveryMethod !== 'DELIVERY') {
      throw new Error('Order is not for delivery')
    }
    
    // According to PRD, they can update receipt anytime after READY_TO_SHIP, usually transitioning it to SHIPPED
    // If it's READY_TO_SHIP, we auto transition to SHIPPED. If it's already SHIPPED, we just update the receipt.
    let newStatus = order.status
    if (order.status === 'READY_TO_SHIP') {
      newStatus = 'SHIPPED'
    } else if (order.status !== 'SHIPPED') {
      throw new Error('Order must be READY_TO_SHIP or SHIPPED to add receipt')
    }

    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { 
          shippingReceipt: receiptNumber,
          status: newStatus
        }
      })

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: 'SHIPPING_RECEIPT_UPDATED',
          entityType: 'ORDER',
          entityId: id,
          metadata: { receiptNumber, statusChangedTo: newStatus !== order.status ? newStatus : undefined }
        }
      })

      return updatedOrder
    })
  }
}

export const adminOrderRepository = new AdminOrderRepository()
