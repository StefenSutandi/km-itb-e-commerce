import { UIOrderStatus, UIPaymentStatus } from "./ui-types"

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date to readable format
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Format order status to display text
 */
export function formatOrderStatus(status: UIOrderStatus): string {
  const statusMap: Record<UIOrderStatus, string> = {
    WAITING_PAYMENT: 'Waiting for Payment',
    PAYMENT_RECEIVED: 'Payment Received',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  }
  return statusMap[status] || status
}

/**
 * Format payment status to display text
 */
export function formatPaymentStatus(status: UIPaymentStatus): string {
  const statusMap: Record<UIPaymentStatus, string> = {
    PENDING: 'Pending',
    AUTHORIZED: 'Authorized',
    CAPTURED: 'Captured',
    SETTLED: 'Settled',
    EXPIRED: 'Expired',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  }
  return statusMap[status] || status
}

/**
 * Get color class for order status badge
 */
export function getOrderStatusColor(status: UIOrderStatus): string {
  const colorMap: Record<UIOrderStatus, string> = {
    WAITING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    PAYMENT_RECEIVED: 'bg-blue-100 text-blue-800 border-blue-300',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
    DELIVERED: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

/**
 * Get color class for payment status badge
 */
export function getPaymentStatusColor(status: UIPaymentStatus): string {
  const colorMap: Record<UIPaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    AUTHORIZED: 'bg-blue-100 text-blue-800 border-blue-300',
    CAPTURED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    SETTLED: 'bg-green-100 text-green-800 border-green-300',
    EXPIRED: 'bg-gray-100 text-gray-800 border-gray-300',
    FAILED: 'bg-red-100 text-red-800 border-red-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

/**
 * Format product slug to readable name
 */
export function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `KM-${year}${month}${day}-${random}`
}

/**
 * Truncate text to specific length
 */
export function truncateText(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) {
    return '+' + cleaned
  }
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.slice(1)
  }
  return '+62' + cleaned
}
