import { PaymentTransaction, UIPaymentStatus, UIOrder } from "@/lib/ui-types"

export interface IPaymentRepository {
  createPayment(transaction: PaymentTransaction): Promise<PaymentTransaction>
  getPaymentById(id: string): Promise<PaymentTransaction | null>
  getByOrderId(orderId: string): Promise<PaymentTransaction | null>
  getByExternalId(externalId: string): Promise<PaymentTransaction | null>
  updatePayment(id: string, transaction: Partial<PaymentTransaction>): Promise<PaymentTransaction>
}

export interface IMidtransGateway {
  createTransaction(
    order: UIOrder,
    customerEmail: string,
    customerPhone: string,
    customerName: string,
  ): Promise<{
    transactionId: string
    orderId: string
    redirectUrl: string
    token: string
  }>
  verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): boolean
  getTransactionStatus(orderId: string): Promise<any>
}

export class PaymentService {
  constructor(
    private paymentRepo: IPaymentRepository,
    private midtransGateway: IMidtransGateway,
  ) {}

  /**
   * Create payment transaction via Midtrans
   * @param order UIOrder object
   * @param customerEmail Customer email
   * @param customerPhone Customer phone
   * @param customerName Customer name
   * @returns Payment transaction with redirect URL
   */
  async createMidtransTransaction(
    order: UIOrder,
    customerEmail: string,
    customerPhone: string,
    customerName: string,
  ): Promise<{
    payment: PaymentTransaction
    redirectUrl: string
    token: string
  }> {
    // TODO: Validate order exists and is in WAITING_PAYMENT status

    // Create transaction via Midtrans gateway
    const midtransResponse = await this.midtransGateway.createTransaction(
      order,
      customerEmail,
      customerPhone,
      customerName,
    )

    // Create payment record in database
    const paymentTransaction: PaymentTransaction = {
      id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      orderId: order.id,
      status: UIPaymentStatus.PENDING,
      amount: order.total,
      currency: 'IDR',
      method: 'MIDTRANS',
      externalTransactionId: midtransResponse.transactionId,
      externalReference: midtransResponse.orderId,
      metadata: {
        midtransToken: midtransResponse.token,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const savedPayment = await this.paymentRepo.createPayment(paymentTransaction)

    return {
      payment: savedPayment,
      redirectUrl: midtransResponse.redirectUrl,
      token: midtransResponse.token,
    }
  }

  /**
   * Handle Midtrans webhook callback
   * @param orderId Midtrans UIOrder ID
   * @param transactionStatus Midtrans transaction status
   * @param grossAmount Gross amount in string
   * @param signature Midtrans signature
   * @returns Updated payment transaction
   */
  async handleMidtransWebhook(
    orderId: string,
    transactionStatus: string,
    grossAmount: string,
    signature: string,
  ): Promise<PaymentTransaction> {
    // TODO: Verify Midtrans signature
    // const isValid = this.midtransGateway.verifySignature(
    //   orderId,
    //   transactionStatus,
    //   grossAmount,
    //   process.env.MIDTRANS_SERVER_KEY!,
    // )
    // if (!isValid) {
    //   throw new Error('Invalid Midtrans signature')
    // }

    // Get payment by external reference
    const payment = await this.paymentRepo.getByExternalId(orderId)
    if (!payment) {
      throw new Error(`Payment not found for Midtrans order: ${orderId}`)
    }

    // TODO: Map Midtrans status to our UIPaymentStatus
    // Midtrans statuses: capture, settlement, pending, deny, cancel, expire, failure
    const statusMap: Record<string, UIPaymentStatus> = {
      capture: UIPaymentStatus.CAPTURED,
      settlement: UIPaymentStatus.SETTLED,
      pending: UIPaymentStatus.PENDING,
      deny: UIPaymentStatus.FAILED,
      cancel: UIPaymentStatus.CANCELLED,
      expire: UIPaymentStatus.EXPIRED,
      failure: UIPaymentStatus.FAILED,
    }

    const newStatus = statusMap[transactionStatus] || UIPaymentStatus.PENDING

    // TODO: Implement idempotency - check if this webhook was already processed
    // This prevents duplicate processing if webhook is retried

    const updatedPayment = await this.paymentRepo.updatePayment(payment.id, {
      status: newStatus,
      updatedAt: new Date(),
      completedAt: [UIPaymentStatus.SETTLED, UIPaymentStatus.CAPTURED].includes(newStatus)
        ? new Date()
        : undefined,
    })

    // TODO: Update order status if payment is successful
    // if ([UIPaymentStatus.SETTLED, UIPaymentStatus.CAPTURED].includes(newStatus)) {
    //   await orderService.updateOrderStatus(
    //     payment.orderId,
    //     UIOrderStatus.PAYMENT_RECEIVED,
    //   )
    // }

    return updatedPayment
  }

  /**
   * Get payment transaction by ID
   */
  async getPayment(paymentId: string): Promise<PaymentTransaction | null> {
    return this.paymentRepo.getPaymentById(paymentId)
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentTransaction | null> {
    return this.paymentRepo.getByOrderId(orderId)
  }

  /**
   * Check payment status with Midtrans
   * @param orderId Midtrans UIOrder ID
   */
  async checkMidtransStatus(orderId: string): Promise<any> {
    return this.midtransGateway.getTransactionStatus(orderId)
  }

  /**
   * Handle manual payment marking (admin)
   * @param paymentId Payment transaction ID
   * @param newStatus New payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    newStatus: UIPaymentStatus,
  ): Promise<PaymentTransaction> {
    const payment = await this.paymentRepo.getPaymentById(paymentId)
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`)
    }

    // TODO: Log this admin action for audit trail
    return this.paymentRepo.updatePayment(paymentId, {
      status: newStatus,
      updatedAt: new Date(),
      completedAt: [UIPaymentStatus.SETTLED, UIPaymentStatus.CAPTURED].includes(newStatus)
        ? new Date()
        : undefined,
    })
  }
}

/**
 * Mock Midtrans Gateway for development/testing
 */
export class MockMidtransGateway implements IMidtransGateway {
  async createTransaction(
    order: any,
    customerEmail: string,
    customerPhone: string,
    customerName: string,
  ): Promise<{
    transactionId: string
    orderId: string
    redirectUrl: string
    token: string
  }> {
    const transactionId = `mock-txn-${Date.now()}`
    const midtransOrderId = `${order.orderNumber}-${Math.random().toString(36).slice(2, 9)}`

    return {
      transactionId,
      orderId: midtransOrderId,
      redirectUrl: `/mock-payment?orderId=${midtransOrderId}&amount=${order.total}`,
      token: `mock-token-${transactionId}`,
    }
  }

  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
  ): boolean {
    // TODO: Implement HMAC SHA512 signature verification
    // The signature is: base64(HMAC-SHA512(orderId + statusCode + grossAmount, serverKey))
    return true
  }

  async getTransactionStatus(orderId: string): Promise<any> {
    // TODO: Call Midtrans API to check transaction status
    return {
      transaction_id: orderId,
      status_code: '200',
      transaction_status: 'settlement',
      fraud_status: 'accept',
    }
  }
}
