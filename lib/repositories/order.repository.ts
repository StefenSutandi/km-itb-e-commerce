import { prisma } from "@/lib/prisma"
import { ProductStatus, DeliveryMethod, PaymentStatus } from "@prisma/client"

export interface CreateOrderInput {
  deliveryMethod: DeliveryMethod
  shippingName?: string
  shippingPhone?: string
  shippingStreet?: string
  shippingDistrict?: string
  shippingCity?: string
  shippingProvince?: string
  shippingPostal?: string
  voucherCode?: string // not fully implemented yet
}

export class OrderRepository {
  /**
   * Creates an order from the user's cart in a transaction.
   * Validates stock and status, but does not decrement stock yet (Phase 3).
   */
  async createOrderFromCart(userId: string, input: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Cart
      const cart = await tx.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true }
              }
            }
          }
        }
      })

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty")
      }

      // 2. Validate Items & Calculate Subtotal
      let subtotal = 0

      for (const item of cart.items) {
        const variant = item.variant
        const product = variant.product

        if (product.status === ProductStatus.ARCHIVED || product.status === ProductStatus.DRAFT) {
          throw new Error(`Product ${product.name} is no longer available`)
        }

        if (item.quantity > variant.stock) {
          throw new Error(`Insufficient stock for ${product.name} - ${variant.name}`)
        }

        subtotal += Number(variant.price) * item.quantity
      }

      // 3. Calculate Fees
      // 2% platform buyer fee
      const buyerFee = Math.round(subtotal * 0.02)
      // Delivery fee logic
      const deliveryFee = input.deliveryMethod === DeliveryMethod.DELIVERY ? 50000 : 0
      const discount = 0 // Phase 2 placeholder

      const total = subtotal + buyerFee + deliveryFee - discount

      // Generate Order Number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // 4. Create Order and OrderItems
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'WAITING_PAYMENT',
          subtotal,
          buyerFee,
          deliveryFee,
          discount,
          total,
          deliveryMethod: input.deliveryMethod,
          shippingName: input.shippingName,
          shippingPhone: input.shippingPhone,
          shippingStreet: input.shippingStreet,
          shippingDistrict: input.shippingDistrict,
          shippingCity: input.shippingCity,
          shippingProvince: input.shippingProvince,
          shippingPostal: input.shippingPostal,
          
          items: {
            create: cart.items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
              subtotal: Number(item.variant.price) * item.quantity,
              productName: item.variant.product.name,
              productSlug: item.variant.product.slug,
              variantName: item.variant.name,
              variantSku: item.variant.sku
            }))
          },
          // Create PaymentTransaction placeholder
          payments: {
            create: {
              status: PaymentStatus.WAITING,
              amount: total,
              paymentType: 'MIDTRANS_PLACEHOLDER'
            }
          }
        }
      })

      // 5. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })

      return order
    })
  }

  async getOrderByIdForUser(userId: string, orderId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: true,
        payments: true
      }
    })
  }

  async getOrdersForUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true
      }
    })
  }
}

export const orderRepository = new OrderRepository()
