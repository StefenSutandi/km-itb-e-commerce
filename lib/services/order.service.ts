import {
  UIOrder,
  UIOrderStatus,
  UICreateOrderRequest,
  UIDeliveryMethod,
  UIOrderItem,
  UICartItem,
} from "@/lib/ui-types"

export interface IOrderRepository {
  createOrder(order: UIOrder): Promise<UIOrder>
  getOrderById(id: string): Promise<UIOrder | null>
  getByOrderNumber(orderNumber: string): Promise<UIOrder | null>
  getByUserId(userId: string, limit?: number, offset?: number): Promise<UIOrder[]>
  getAll(limit?: number, offset?: number): Promise<UIOrder[]>
  updateOrder(id: string, order: Partial<UIOrder>): Promise<UIOrder>
  updateStatus(id: string, status: UIOrderStatus): Promise<UIOrder>
  delete(id: string): Promise<boolean>
}

export interface IProductRepository {
  getProductById(id: string): Promise<any | null>
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
    items: UICartItem[],
    deliveryMethod: UIDeliveryMethod,
    voucherCode?: string,
  ): Promise<{
    orderItems: UIOrderItem[]
    subtotal: number
    tax: number
    shippingCost: number
    discountAmount: number
    total: number
  }> {
    // Fetch product and variant data
    const orderItems: UIOrderItem[] = []
    let subtotal = 0

    for (const item of items) {
      const product = await this.productRepo.getProductById(item.productId)
      const variant = await this.productRepo.getVariantById(item.variantId)

      if (!product || !variant) {
        throw new Error(
          `UIProduct or variant not found: ${item.productId}, ${item.variantId}`,
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
    const shippingCost = deliveryMethod === UIDeliveryMethod.PICKUP ? 0 : 50000 // 50k IDR for delivery

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
  async createOrder(req: UICreateOrderRequest): Promise<UIOrder> {
    const {
      userId,
      items,
      deliveryMethod,
      voucherCode,
      notes,
      shippingAddress,
    } = req

    const checkout = await this.calculateCheckout(items, deliveryMethod, voucherCode)

    const order: UIOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      orderNumber: this.generateOrderNumber(),
      userId,
      status: UIOrderStatus.WAITING_PAYMENT,
      deliveryMethod,
      items: checkout.orderItems,
      subtotal: checkout.subtotal,
      taxAmount: checkout.tax,
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

    return this.orderRepo.createOrder(order)
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<UIOrder | null> {
    return this.orderRepo.getOrderById(orderId)
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<UIOrder[]> {
    return this.orderRepo.getByUserId(userId, limit, offset)
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(limit: number = 50, offset: number = 0): Promise<UIOrder[]> {
    return this.orderRepo.getAll(limit, offset)
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: UIOrderStatus): Promise<UIOrder> {
    const order = await this.orderRepo.getOrderById(orderId)
    if (!order) {
      throw new Error(`UIOrder not found: ${orderId}`)
    }

    // Validate status transitions
    this.validateStatusTransition(order.status as UIOrderStatus, status)

    const updateData: Partial<UIOrder> = {
      status,
      updatedAt: new Date(),
    }

    if (status === UIOrderStatus.DELIVERED) {
      updateData.completedAt = new Date()
    }

    return this.orderRepo.updateOrder(orderId, updateData)
  }

  /**
   * Validate order status transitions
   */
  private validateStatusTransition(
    currentStatus: UIOrderStatus,
    newStatus: UIOrderStatus,
  ): void {
    const validTransitions: Record<UIOrderStatus, UIOrderStatus[]> = {
      [UIOrderStatus.WAITING_PAYMENT]: [
        UIOrderStatus.PAYMENT_RECEIVED,
        UIOrderStatus.CANCELLED,
      ],
      [UIOrderStatus.PAYMENT_RECEIVED]: [
        UIOrderStatus.PROCESSING,
        UIOrderStatus.CANCELLED,
      ],
      [UIOrderStatus.PROCESSING]: [UIOrderStatus.SHIPPED, UIOrderStatus.CANCELLED],
      [UIOrderStatus.SHIPPED]: [UIOrderStatus.DELIVERED, UIOrderStatus.CANCELLED],
      [UIOrderStatus.DELIVERED]: [UIOrderStatus.REFUNDED],
      [UIOrderStatus.CANCELLED]: [],
      [UIOrderStatus.REFUNDED]: [],
    }

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} → ${newStatus}`,
      )
    }
  }
}
