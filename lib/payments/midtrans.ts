/**
 * Midtrans Helper
 * Server-only module to interface with Midtrans API securely.
 */

export interface MidtransItemDetail {
  id: string
  price: number
  quantity: number
  name: string
}

export interface MidtransCustomerDetail {
  first_name: string
  email: string
  phone: string
  billing_address?: {
    first_name: string
    email: string
    phone: string
    address: string
    city: string
    postal_code: string
    country_code: string
  }
}

export interface MidtransTransactionPayload {
  transaction_details: {
    order_id: string
    gross_amount: number
  }
  item_details: MidtransItemDetail[]
  customer_details: MidtransCustomerDetail
}

export interface MidtransTransactionResponse {
  token: string
  redirect_url: string
  error_messages?: string[]
}

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || ''
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'

const getBaseUrl = () => {
  return IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1'
}

export async function createSnapTransaction(
  payload: MidtransTransactionPayload
): Promise<MidtransTransactionResponse> {
  if (!SERVER_KEY) {
    throw new Error('MIDTRANS_SERVER_KEY is not configured on the server')
  }

  const url = `${getBaseUrl()}/transactions`
  const encodedAuth = Buffer.from(`${SERVER_KEY}:`).toString('base64')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedAuth}`
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`Midtrans API Error: ${data.error_messages?.join(', ') || 'Unknown error'}`)
  }

  return data
}

import * as crypto from 'crypto'

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  incomingSignature: string
): boolean {
  if (!orderId || !statusCode || !grossAmount || !serverKey || !incomingSignature) {
    return false
  }

  const payload = orderId + statusCode + grossAmount + serverKey
  const generatedSignature = crypto
    .createHash('sha512')
    .update(payload)
    .digest('hex')

  return generatedSignature === incomingSignature
}
