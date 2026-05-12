// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum DeliveryMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminUser extends User {
  role: AdminRole
  permissions: string[]
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string
  name: string
  description: string
  slug: string
  category: string
  basePrice: number
  image: string
  thumbnail?: string
  isFeatured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  productId: string
  name: string // e.g., "Size: M", "Color: Black"
  sku: string
  price: number // Variant-specific price
  stock: number
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  id: string
  productId: string
  variantId: string
  quantity: number
  addedAt: Date
}

export interface Cart {
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  productName: string
  productImage: string
  variantName: string
  sku: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  deliveryMethod: DeliveryMethod
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discountAmount: number
  voucherCode?: string
  total: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentTransaction {
  id: string
  orderId: string
  status: PaymentStatus
  amount: number
  currency: string
  method: string // 'MIDTRANS', 'BANK_TRANSFER', etc.
  externalTransactionId?: string // Midtrans Transaction ID
  externalReference?: string // Midtrans Order ID / Reference
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface Invoice {
  id: string
  orderId: string
  invoiceNumber: string
  issueDate: Date
  dueDate: Date
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'
  buyer: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discountAmount: number
  total: number
  notes?: string
  pdfUrl?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// VOUCHER TYPES
// ============================================================================

export interface Voucher {
  id: string
  code: string
  description?: string
  discountType: 'FIXED' | 'PERCENTAGE'
  discountValue: number
  maxUsage: number
  currentUsage: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  isActive: boolean
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// REPORT/ANALYTICS TYPES
// ============================================================================

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  pendingPayments: number
  processingOrders: number
}

export interface RevenueData {
  date: Date
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
}

export interface SalesReport {
  period: {
    startDate: Date
    endDate: Date
  }
  metrics: SalesMetrics
  revenueByDate: RevenueData[]
  topProducts: TopProduct[]
  ordersByStatus: Record<OrderStatus, number>
  ordersByDeliveryMethod: Record<DeliveryMethod, number>
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateOrderRequest {
  userId: string
  items: CartItem[]
  deliveryMethod: DeliveryMethod
  shippingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  voucherCode?: string
  notes?: string
}

export interface CreateOrderResponse {
  success: boolean
  order?: Order
  payment?: PaymentTransaction
  error?: string
}

export interface CheckoutSummary {
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discountAmount: number
  voucherCode?: string
  total: number
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: Date
}
