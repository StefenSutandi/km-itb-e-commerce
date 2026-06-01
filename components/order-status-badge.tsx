import { UIOrderStatus as OrderStatus, UIPaymentStatus as PaymentStatus } from "@/lib/ui-types"
import { formatOrderStatus, formatPaymentStatus, getOrderStatusColor, getPaymentStatusColor } from '@/lib/format'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(
        status
      )}`}
    >
      {formatOrderStatus(status)}
    </span>
  )
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(
        status
      )}`}
    >
      {formatPaymentStatus(status)}
    </span>
  )
}
