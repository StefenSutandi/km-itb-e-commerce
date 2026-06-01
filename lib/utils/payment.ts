import crypto from 'crypto'
import { UIOrder, UIPaymentStatus, UIOrderStatus } from "@/lib/ui-types"

/**
 * Format amount in IDR with proper decimal places
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generate Midtrans signature for verification
 * Signature = HMAC-SHA512(orderId + statusCode + grossAmount, serverKey)
 *
 * TODO: Use this when implementing signature verification in webhook handler
 */
export function generateMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
): string {
  return crypto
    .createHmac('sha512', serverKey)
    .update(`${orderId}${statusCode}${grossAmount}`)
    .digest('hex')
}

/**
 * Verify Midtrans webhook signature
 * Returns true if signature is valid
 *
 * TODO: Implement in webhook handler
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string,
  serverKey: string,
): boolean {
  const expectedSignature = generateMidtransSignature(orderId, statusCode, grossAmount, serverKey)
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature),
  )
}

/**
 * Map Midtrans transaction status to our UIPaymentStatus enum
 * Midtrans statuses: capture, settlement, pending, deny, cancel, expire, failure
 */
export function mapMidtransStatusToPaymentStatus(midtransStatus: string): UIPaymentStatus {
  const statusMap: Record<string, UIPaymentStatus> = {
    capture: UIPaymentStatus.CAPTURED,
    settlement: UIPaymentStatus.SETTLED,
    pending: UIPaymentStatus.PENDING,
    deny: UIPaymentStatus.FAILED,
    cancel: UIPaymentStatus.CANCELLED,
    expire: UIPaymentStatus.EXPIRED,
    failure: UIPaymentStatus.FAILED,
  }

  return statusMap[midtransStatus] || UIPaymentStatus.PENDING
}

/**
 * Check if payment status indicates successful payment
 */
export function isPaymentSuccessful(status: UIPaymentStatus): boolean {
  return [UIPaymentStatus.CAPTURED, UIPaymentStatus.SETTLED].includes(status)
}

/**
 * Get corresponding UIOrderStatus for UIPaymentStatus
 */
export function getOrderStatusForPaymentStatus(paymentStatus: UIPaymentStatus): UIOrderStatus | null {
  if (isPaymentSuccessful(paymentStatus)) {
    return UIOrderStatus.PAYMENT_RECEIVED
  }

  if ([UIPaymentStatus.FAILED, UIPaymentStatus.EXPIRED, UIPaymentStatus.CANCELLED].includes(paymentStatus)) {
    return UIOrderStatus.CANCELLED
  }

  return null
}

/**
 * TODO: Implement when adding real Midtrans integration
 *
 * Create Midtrans transaction request body
 */
export function buildMidtransTransactionRequest(
  order: UIOrder,
  customerEmail: string,
  customerPhone: string,
  customerName: string,
) {
  // Midtrans API expects:
  // {
  //   transaction_details: {
  //     order_id: "KM-20240512-A3F8E2",
  //     gross_amount: 500000
  //   },
  //   customer_details: {
  //     email: "customer@example.com",
  //     phone: "08123456789",
  //     first_name: "John",
  //     last_name: "Doe"
  //   },
  //   item_details: [
  //     {
  //       id: "hoodie-m-black",
  //       price: 350000,
  //       quantity: 1,
  //       name: "KM ITB Hoodie - Size M Black"
  //     }
  //   ],
  //   callbacks: {
  //     finish: "https://yourapp.com/checkout/success",
  //     error: "https://yourapp.com/checkout/error",
  //     unfinish: "https://yourapp.com/checkout/unfinish"
  //   }
  // }

  const [firstName, ...lastNameParts] = customerName.split(' ')
  const lastName = lastNameParts.join(' ')

  return {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: order.total,
    },
    customer_details: {
      email: customerEmail,
      phone: customerPhone,
      first_name: firstName,
      last_name: lastName || '',
    },
    item_details: order.items.map((item: any) => ({
      id: item.sku,
      price: item.unitPrice,
      quantity: item.quantity,
      name: `${item.productName} - ${item.variantName}`,
    })),
    // TODO: Update these callbacks to actual URLs
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error`,
      unfinish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/unfinish`,
    },
  }
}

/**
 * TODO: Generate Snap Token with Midtrans
 * Requires making HTTPS POST to:
 * https://app.sandbox.midtrans.com/snap/v1/transactions (sandbox)
 * https://app.midtrans.com/snap/v1/transactions (production)
 *
 * Headers:
 * - Authorization: Basic base64(serverKey:)
 * - Content-Type: application/json
 *
 * Returns: { token: "...", redirect_url: "..." }
 */
export async function generateMidtransSnapToken(
  transactionRequest: any,
  serverKey: string,
): Promise<{ token: string; redirectUrl: string }> {
  // TODO: Implement actual API call to Midtrans
  // const auth = Buffer.from(`${serverKey}:`).toString('base64')
  // const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Basic ${auth}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(transactionRequest),
  // })
  // const data = await response.json()
  // return { token: data.token, redirectUrl: data.redirect_url }

  // Mock implementation for now
  return {
    token: `mock-token-${Date.now()}`,
    redirectUrl: `/mock-payment?order=${transactionRequest.transaction_details.order_id}`,
  }
}

/**
 * TODO: Check transaction status with Midtrans
 * Makes GET request to:
 * https://api.sandbox.midtrans.com/v2/{ORDER_ID}/status (sandbox)
 * https://api.midtrans.com/v2/{ORDER_ID}/status (production)
 */
export async function checkMidtransTransactionStatus(
  orderId: string,
  serverKey: string,
): Promise<any> {
  // TODO: Implement actual API call to Midtrans
  // const auth = Buffer.from(`${serverKey}:`).toString('base64')
  // const response = await fetch(
  //   `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
  //   {
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Basic ${auth}`,
  //     },
  //   },
  // )
  // return response.json()

  // Mock implementation
  return {
    transaction_id: orderId,
    status_code: '200',
    transaction_status: 'settlement',
    fraud_status: 'accept',
  }
}

/**
 * Idempotency key for payment operations
 * Prevents duplicate charges if webhook is retried
 */
export function generateIdempotencyKey(orderId: string, transactionId: string): string {
  return `${orderId}-${transactionId}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Check if payment retry is allowed
 * TODO: Implement with database checks to prevent duplicate charges
 */
export async function canRetryPayment(orderId: string, maxRetries: number = 3): Promise<boolean> {
  // TODO: Query database for number of payment attempts
  // const attempts = await db.paymentAttempts.count({ where: { orderId } })
  // return attempts < maxRetries

  return true // Mock implementation
}
