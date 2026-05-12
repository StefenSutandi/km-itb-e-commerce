import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  DeliveryMethod,
  OrderItem,
  CartItem,
} from '@/lib/types'

export interface IOrderRepository {
  create(order: Order): Promise<Order>
  getById(id: string): Promise<Order | null>
  getByOrderNumber(orderNumber: string): Promise<Order | null>
  getByUserId(userId: string, limit?: number, offset?: number): Promise<Order[]>
  getAll(limit?: number, offset?: number): Promise<Order[]>
  update(id: string, order: Partial<Order>): Promise<Order>
  updateStatus(id: string, status: OrderStatus): Promise<Order>
  delete(id: string): Promise<boolean>
}

export interface IProductRepository {
  getById(id: string): Promise<any | null>
  getVariantById(variantId: string): Promise<any | null>
}

export interface IVoucherRepository {
  getByCode(code: string): Promise<any | null>
  incrementUsage(voucherId: string): Promise<void>
}

export class OrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private voucherRepo: IVoucherRepository,
  ) {}

  /**
   * Generate unique order number
   * Format: KM-YYYYMMDD-RANDOMHEX (e.g., KM-20240512-A3F8E2)
   */
  private generateOrderNumber(): string {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
    const randomHex = Math.random().toString(16).slice(2, 8).toUpperCase()
    return `KM-${dateStr}-${randomHex}`
  }

  /**
   * Calculate checkout summary
   */
  async calculateCheckout(
    items: CartItem[],
    deliveryMethod: DeliveryMethod,
    voucherCode?: string,
  ): Promise<{
    orderItems: OrderItem[]
    subtotal: number
    tax: number
    shippingCost: number
    discountAmount: number
    total: number
  }> {
    // Fetch product and variant data
    const orderItems: OrderItem[] = []
    let subtotal = 0

    for (const item of items) {
      const product = await this.productRepo.getById(item.productId)
      const variant = await this.productRepo.getVariantById(item.variantId)

      if (!product || !variant) {
        throw new Error(
          `Product or variant not found: ${item.productId}, ${item.variantId}`,
        )
      }

      const itemSubtotal = variant.price * item.quantity
      subtotal += itemSubtotal

      orderItems.push({
        id: `${item.variantId}-${Date.now()}`,
        productId: item.productId,
        variantId: item.variantId,
        productName: product.name,
        productImage: product.image,
        variantName: variant.name,
        sku: variant.sku,
        quantity: item.quantity,
        unitPrice: variant.price,
        subtotal: itemSubtotal,
      })
    }

    // Calculate tax (10% for now)
    const tax = Math.round(subtotal * 0.1)

    // Calculate shipping cost based on delivery method
    const shippingCost = deliveryMethod === DeliveryMethod.PICKUP ? 0 : 50000 // 50k IDR for delivery

    // Apply voucher if provided
    let discountAmount = 0
    if (voucherCode) {
      const voucher = await this.voucherRepo.getByCode(voucherCode)
      if (voucher && voucher.isActive) {
        if (voucher.discountType === 'FIXED') {
          discountAmount = Math.min(voucher.discountValue, subtotal + tax + shippingCost)
        } else if (voucher.discountType === 'PERCENTAGE') {
          const percentDiscount = Math.round(
            (subtotal + tax + shippingCost) * (voucher.discountValue / 100),
          )
          discountAmount = voucher.maxDiscountAmount
            ? Math.min(percentDiscount, voucher.maxDiscountAmount)
            : percentDiscount
        }
      }
    }

    const total = subtotal + tax + shippingCost - discountAmount

    return {
      orderItems,
      subtotal,
      tax,
      shippingCost,
      discountAmount,
      total,
    }
  }

  /**
   * Create a new order from checkout
   */
  async createOrder(req: CreateOrderRequest): Promise<Order> {
    const {
      userId,
      items,
      deliveryMethod,
      voucherCode,
      notes,
      shippingAddress,
    } = req

    const checkout = await this.calculateCheckout(items, deliveryMethod, voucherCode)

    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      orderNumber: this.generateOrderNumber(),
      userId,
      status: OrderStatus.WAITING_PAYMENT,
      deliveryMethod,
      items: checkout.orderItems,
      subtotal: checkout.subtotal,
      tax: checkout.tax,
      shippingCost: checkout.shippingCost,
      discountAmount: checkout.discountAmount,
      voucherCode,
      total: checkout.total,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Update voucher usage if applied
    if (voucherCode) {
      const voucher = await this.voucherRepo.getByCode(voucherCode)
      if (voucher) {
        await this.voucherRepo.incrementUsage(voucher.id)
      }
    }

    return this.orderRepo.create(order)
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    return this.orderRepo.getById(orderId)
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Order[]> {
    return this.orderRepo.getByUserId(userId, limit, offset)
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(limit: number = 50, offset: number = 0): Promise<Order[]> {
    return this.orderRepo.getAll(limit, offset)
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.getById(orderId)
    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    // Validate status transitions
    this.validateStatusTransition(order.status, status)

    const updateData: Partial<Order> = {
      status,
      updatedAt: new Date(),
    }

    if (status === OrderStatus.DELIVERED) {
      updateData.completedAt = new Date()
    }

    return this.orderRepo.update(orderId, updateData)
  }

  /**
   * Validate order status transitions
   */
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.WAITING_PAYMENT]: [
        OrderStatus.PAYMENT_RECEIVED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PAYMENT_RECEIVED]: [
        OrderStatus.PROCESSING,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} → ${newStatus}`,
      )
    }
  }
}
