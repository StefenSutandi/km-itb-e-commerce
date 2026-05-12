import {
  Order,
  Product,
  ProductVariant,
  PaymentTransaction,
  Voucher,
  User,
} from '@/lib/types'
import { IOrderRepository } from '@/lib/services/order.service'
import { IProductRepository } from '@/lib/services/order.service'
import { IVoucherRepository } from '@/lib/services/order.service'
import { IPaymentRepository } from '@/lib/services/payment.service'

/**
 * In-Memory Mock Repository for development/testing
 * This can be swapped with DatabaseRepository for production
 * when integrated with Prisma/PostgreSQL
 */
export class MockRepository
  implements IOrderRepository, IProductRepository, IVoucherRepository, IPaymentRepository
{
  private orders: Map<string, Order> = new Map()
  private ordersByUser: Map<string, string[]> = new Map()
  private products: Map<string, Product> = new Map()
  private variants: Map<string, ProductVariant> = new Map()
  private payments: Map<string, PaymentTransaction> = new Map()
  private paymentsByOrder: Map<string, string> = new Map()
  private paymentsByExternal: Map<string, string> = new Map()
  private vouchers: Map<string, Voucher> = new Map()

  constructor() {
    this.initializeMockData()
  }

  // ============================================================================
  // ORDER REPOSITORY
  // ============================================================================

  async create(order: Order): Promise<Order> {
    this.orders.set(order.id, order)

    if (!this.ordersByUser.has(order.userId)) {
      this.ordersByUser.set(order.userId, [])
    }
    this.ordersByUser.get(order.userId)!.push(order.id)

    return order
  }

  async getById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null
  }

  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order
      }
    }
    return null
  }

  async getByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<Order[]> {
    const orderIds = this.ordersByUser.get(userId) || []
    const orders = orderIds.map((id) => this.orders.get(id)!).filter(Boolean)

    // Sort by created date descending
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return orders.slice(offset, offset + limit)
  }

  async getAll(limit: number = 50, offset: number = 0): Promise<Order[]> {
    const orders = Array.from(this.orders.values())
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return orders.slice(offset, offset + limit)
  }

  async update(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id)
    if (!order) {
      throw new Error(`Order not found: ${id}`)
    }

    const updated = { ...order, ...updates }
    this.orders.set(id, updated)
    return updated
  }

  async updateStatus(id: string, status: any): Promise<Order> {
    const order = this.orders.get(id)
    if (!order) {
      throw new Error(`Order not found: ${id}`)
    }

    order.status = status
    order.updatedAt = new Date()
    this.orders.set(id, order)
    return order
  }

  async delete(id: string): Promise<boolean> {
    const order = this.orders.get(id)
    if (!order) {
      return false
    }

    this.orders.delete(id)
    const userOrders = this.ordersByUser.get(order.userId)
    if (userOrders) {
      const index = userOrders.indexOf(id)
      if (index > -1) {
        userOrders.splice(index, 1)
      }
    }
    return true
  }

  // ============================================================================
  // PRODUCT REPOSITORY
  // ============================================================================

  async getById(id: string): Promise<Product | null> {
    return this.products.get(id) || null
  }

  async getVariantById(variantId: string): Promise<ProductVariant | null> {
    return this.variants.get(variantId) || null
  }

  // ============================================================================
  // VOUCHER REPOSITORY
  // ============================================================================

  async getByCode(code: string): Promise<Voucher | null> {
    for (const voucher of this.vouchers.values()) {
      if (voucher.code === code.toUpperCase()) {
        return voucher
      }
    }
    return null
  }

  async incrementUsage(voucherId: string): Promise<void> {
    const voucher = this.vouchers.get(voucherId)
    if (voucher) {
      voucher.currentUsage += 1
      this.vouchers.set(voucherId, voucher)
    }
  }

  // ============================================================================
  // PAYMENT REPOSITORY
  // ============================================================================

  async create(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    this.payments.set(transaction.id, transaction)
    this.paymentsByOrder.set(transaction.orderId, transaction.id)

    if (transaction.externalReference) {
      this.paymentsByExternal.set(transaction.externalReference, transaction.id)
    }

    return transaction
  }

  async getById(id: string): Promise<PaymentTransaction | null> {
    return this.payments.get(id) || null
  }

  async getByOrderId(orderId: string): Promise<PaymentTransaction | null> {
    const paymentId = this.paymentsByOrder.get(orderId)
    return paymentId ? this.payments.get(paymentId) || null : null
  }

  async getByExternalId(externalId: string): Promise<PaymentTransaction | null> {
    const paymentId = this.paymentsByExternal.get(externalId)
    return paymentId ? this.payments.get(paymentId) || null : null
  }

  async update(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction> {
    const payment = this.payments.get(id)
    if (!payment) {
      throw new Error(`Payment not found: ${id}`)
    }

    const updated = { ...payment, ...updates }
    this.payments.set(id, updated)
    return updated
  }

  // ============================================================================
  // MOCK DATA INITIALIZATION
  // ============================================================================

  private initializeMockData(): void {
    // Create mock products
    const products: Product[] = [
      {
        id: 'prod-1',
        name: 'KM ITB Official Hoodie',
        description: 'Premium quality hoodie with KM ITB embroidery',
        slug: 'km-itb-hoodie',
        category: 'Apparel',
        basePrice: 350000,
        image: '/products/hoodie.jpg',
        isFeatured: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        variants: [],
      },
      {
        id: 'prod-2',
        name: 'KM ITB T-Shirt',
        description: 'Comfortable cotton t-shirt with KM ITB logo',
        slug: 'km-itb-tshirt',
        category: 'Apparel',
        basePrice: 150000,
        image: '/products/tshirt.jpg',
        isFeatured: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        variants: [],
      },
      {
        id: 'prod-3',
        name: 'KM ITB Cap',
        description: 'Adjustable cap with embroidered logo',
        slug: 'km-itb-cap',
        category: 'Accessories',
        basePrice: 100000,
        image: '/products/cap.jpg',
        isFeatured: false,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        variants: [],
      },
    ]

    products.forEach((product) => this.products.set(product.id, product))

    // Create mock variants
    const variants: ProductVariant[] = [
      {
        id: 'var-1',
        productId: 'prod-1',
        name: 'Size M - Black',
        sku: 'HOODIE-M-BLK',
        price: 350000,
        stock: 25,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var-2',
        productId: 'prod-1',
        name: 'Size L - Black',
        sku: 'HOODIE-L-BLK',
        price: 350000,
        stock: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var-3',
        productId: 'prod-1',
        name: 'Size M - White',
        sku: 'HOODIE-M-WHT',
        price: 350000,
        stock: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var-4',
        productId: 'prod-2',
        name: 'Size S',
        sku: 'TSHIRT-S',
        price: 150000,
        stock: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var-5',
        productId: 'prod-2',
        name: 'Size M',
        sku: 'TSHIRT-M',
        price: 150000,
        stock: 60,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var-6',
        productId: 'prod-3',
        name: 'One Size',
        sku: 'CAP-OS',
        price: 100000,
        stock: 40,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    variants.forEach((variant) => this.variants.set(variant.id, variant))

    // Create mock vouchers
    const vouchers: Voucher[] = [
      {
        id: 'voucher-1',
        code: 'WELCOME10',
        description: '10% off first purchase',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxUsage: 100,
        currentUsage: 25,
        minPurchaseAmount: 100000,
        isActive: true,
        expiresAt: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'voucher-2',
        code: 'SAVE50K',
        description: 'Save 50,000 IDR',
        discountType: 'FIXED',
        discountValue: 50000,
        maxUsage: 50,
        currentUsage: 10,
        minPurchaseAmount: 300000,
        maxDiscountAmount: 50000,
        isActive: true,
        expiresAt: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vouchers.forEach((voucher) => this.vouchers.set(voucher.id, voucher))
  }
}

/**
 * Global mock repository instance
 * In production with real DB, this would be replaced with DatabaseRepository
 */
let mockRepoInstance: MockRepository | null = null

export function getMockRepository(): MockRepository {
  if (!mockRepoInstance) {
    mockRepoInstance = new MockRepository()
  }
  return mockRepoInstance
}
