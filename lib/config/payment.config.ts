/**
 * Payment Configuration
 * Loads environment variables for payment gateway integration
 */

export const PAYMENT_CONFIG = {
  // Midtrans Configuration
  MIDTRANS: {
    // Server Key - KEEP SECRET, never expose in client code
    SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',

    // Client Key - Safe to expose in client code
    CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',

    // Midtrans environment: 'sandbox' or 'production'
    ENVIRONMENT: (process.env.MIDTRANS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',

    // Snap API URLs
    SNAP_API_URL: {
      sandbox: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
      production: 'https://app.midtrans.com/snap/v1/transactions',
    },

    // Status API URLs
    STATUS_API_URL: {
      sandbox: 'https://api.sandbox.midtrans.com/v2',
      production: 'https://api.midtrans.com/v2',
    },

    // Snap redirect URLs
    SNAP_URL: {
      sandbox: 'https://app.sandbox.midtrans.com/snap/v1',
      production: 'https://app.midtrans.com/snap/v1',
    },

    // Webhook notification endpoint
    WEBHOOK_URL: process.env.MIDTRANS_WEBHOOK_URL || '/api/payments/midtrans/webhook',
  },

  // Payment Settings
  PAYMENT: {
    // Supported payment methods
    ENABLED_METHODS: [
      'credit_card',
      'bank_transfer',
      'cstore', // Convenience Store
      'e_wallet',
    ],

    // Order-related settings
    ORDER: {
      // Pending payment timeout in minutes
      PAYMENT_TIMEOUT_MINUTES: 24 * 60, // 24 hours

      // Auto-cancel unpaid orders after this time
      AUTO_CANCEL_MINUTES: 24 * 60, // 24 hours

      // Retry payment attempts
      MAX_RETRY_ATTEMPTS: 3,
    },

    // Shipping settings
    SHIPPING: {
      // Shipping cost in IDR
      DELIVERY_COST: 50000,
      PICKUP_COST: 0,

      // Free shipping threshold
      FREE_SHIPPING_MIN: 500000,
    },

    // Tax settings
    TAX_RATE: 0.1, // 10% tax

    // Discount/Voucher settings
    VOUCHER: {
      // Max discount per transaction
      MAX_DISCOUNT: 500000,

      // Min purchase amount for voucher
      MIN_PURCHASE: 50000,
    },
  },

  // Webhook Configuration
  WEBHOOK: {
    // Timeout for webhook processing
    TIMEOUT_MS: 30000,

    // Max webhook retries
    MAX_RETRIES: 3,

    // Webhook signature verification enabled
    VERIFY_SIGNATURE: true,

    // Webhook events to process
    HANDLED_EVENTS: [
      'capture',
      'settlement',
      'pending',
      'deny',
      'cancel',
      'expire',
      'failure',
    ],
  },

  // Feature Flags
  FEATURES: {
    // Enable mock payment for testing
    MOCK_PAYMENT: process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true',

    // Enable real Midtrans integration
    REAL_PAYMENT: process.env.NEXT_PUBLIC_REAL_PAYMENT === 'true',

    // Auto-process orders on successful payment
    AUTO_PROCESS_ORDERS: process.env.AUTO_PROCESS_ORDERS === 'true',

    // Send payment confirmation emails
    SEND_CONFIRMATION_EMAILS: process.env.SEND_CONFIRMATION_EMAILS !== 'false',

    // Send admin notifications
    SEND_ADMIN_NOTIFICATIONS: process.env.SEND_ADMIN_NOTIFICATIONS === 'true',
  },

  // Email Configuration (for payment notifications)
  EMAIL: {
    // TODO: Move to separate email config
    FROM_ADDRESS: process.env.EMAIL_FROM || 'noreply@km-itb.ac.id',
    REPLY_TO: process.env.EMAIL_REPLY_TO || 'support@km-itb.ac.id',
  },

  // Admin Settings
  ADMIN: {
    // Email addresses to notify on payment failures
    NOTIFICATION_EMAILS: (process.env.ADMIN_NOTIFICATION_EMAILS || '').split(',').filter(Boolean),

    // Enable order auto-processing
    AUTO_PROCESS: process.env.AUTO_PROCESS_ORDERS === 'true',
  },
}

/**
 * Validate payment configuration
 * Throws error if required environment variables are missing
 */
export function validatePaymentConfig(): void {
  const errors: string[] = []

  if (!PAYMENT_CONFIG.MIDTRANS.SERVER_KEY) {
    errors.push('MIDTRANS_SERVER_KEY is not set')
  }

  if (!PAYMENT_CONFIG.MIDTRANS.CLIENT_KEY) {
    errors.push('NEXT_PUBLIC_MIDTRANS_CLIENT_KEY is not set')
  }

  // TODO: Add more validation for production environment
  // if (process.env.NODE_ENV === 'production') {
  //   if (PAYMENT_CONFIG.MIDTRANS.ENVIRONMENT !== 'production') {
  //     errors.push('MIDTRANS_ENVIRONMENT must be "production" in production')
  //   }
  // }

  if (errors.length > 0) {
    console.warn('[v0] Payment configuration warnings:', errors)
  }
}

/**
 * Get current environment configuration
 */
export function getPaymentEnvironment() {
  return PAYMENT_CONFIG.MIDTRANS.ENVIRONMENT
}

/**
 * Get API URL for current environment
 */
export function getMidtransSnapApiUrl(): string {
  const env = PAYMENT_CONFIG.MIDTRANS.ENVIRONMENT
  return PAYMENT_CONFIG.MIDTRANS.SNAP_API_URL[env]
}

export function getMidtransStatusApiUrl(): string {
  const env = PAYMENT_CONFIG.MIDTRANS.ENVIRONMENT
  return PAYMENT_CONFIG.MIDTRANS.STATUS_API_URL[env]
}

export function getMidtransSnapUrl(): string {
  const env = PAYMENT_CONFIG.MIDTRANS.ENVIRONMENT
  return PAYMENT_CONFIG.MIDTRANS.SNAP_URL[env]
}
