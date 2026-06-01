// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum UIOrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PROCESSING = 'PROCESSING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum UIPaymentStatus {
  WAITING = 'WAITING',
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  SETTLED = 'SETTLED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum UIDeliveryMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum UIAdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UIUser {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
}

export interface UIAdminUser extends UIUser {
  role: UIAdminRole
  permissions: string[]
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface UIProduct {
  id: string
  name: string
  description: string
  slug: string
  category: string
  price: number
  images: string[]
  isFeatured?: boolean
  status?: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
  variants?: UIProductVariant[]
}

export interface UIProductVariant {
  id: string
  productId: string
  name?: string
  color?: string
  size?: string
  sku: string
  stock: number
  price?: number
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface UICartItem {
  id: string
  orderId?: string
  productId: string
  variantId: string
  quantity: number
  addedAt: Date
  // Extracted details for UI rendering without extra fetches
  productName?: string
  variantName?: string
  price?: number
  image?: string
}

export interface UICart {
  userId: string
  items: UICartItem[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface UIOrderItem {
  id: string
  orderId?: string
  productId: string
  variantId: string
  productName?: string
  productImage?: string
  variantName?: string
  sku?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface UIOrder {
  id: string
  orderNumber: string
  userId: string
  status: UIOrderStatus
  paymentStatus?: UIPaymentStatus
  deliveryMethod: UIDeliveryMethod
  items: UIOrderItem[]
  subtotal: number
  taxAmount: number
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
  status: UIPaymentStatus
  amount: number
  currency: string
  method: string // 'MIDTRANS', 'BANK_TRANSFER', etc.
  externalTransactionId?: string // Midtrans Transaction ID
  externalReference?: string // Midtrans UIOrder ID / Reference
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface UIInvoice {
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
  items: UIOrderItem[]
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

export interface UIVoucher {
  id: string
  isActive?: boolean
  status?: string
  code: string
  description?: string
  discountType: 'FIXED' | 'PERCENTAGE'
  discountValue: number
  maxUsage: number
  usageCount: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// REPORT/ANALYTICS TYPES
// ============================================================================

export interface UISalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  pendingPayments: number
  processingOrders: number
}

export interface UIRevenueData {
  date: Date
  revenue: number
  orders: number
}

export interface UITopProduct {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
}

export interface UISalesReport {
  period: {
    startDate: Date
    endDate: Date
  }
  metrics: UISalesMetrics
  revenueByDate: UIRevenueData[]
  topProducts: UITopProduct[]
  ordersByStatus: Record<UIOrderStatus, number>
  ordersByDeliveryMethod: Record<UIDeliveryMethod, number>
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface UICreateOrderRequest {
  userId: string
  items: UICartItem[]
  deliveryMethod: UIDeliveryMethod
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

export interface UICreateOrderResponse {
  success: boolean
  order?: UIOrder
  payment?: PaymentTransaction
  error?: string
}

export interface UICheckoutSummary {
  items: UIOrderItem[]
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

export interface UIApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: Date
}
