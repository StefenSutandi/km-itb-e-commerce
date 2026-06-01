import { NextResponse } from 'next/server'
import { verifyMidtransSignature } from '@/lib/payments/midtrans'
import { paymentRepository } from '@/lib/repositories/payment.repository'

export async function POST(req: Request) {
  try {
    const notification = await req.json()

    // 1. Extract signature parameters
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key
    } = notification

    const serverKey = process.env.MIDTRANS_SERVER_KEY

    if (!serverKey) {
      console.error('Webhook Error: MIDTRANS_SERVER_KEY is missing')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    // 2. Verify signature
    const isValidSignature = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      serverKey,
      signature_key
    )

    if (!isValidSignature) {
      console.error(`Webhook Error: Invalid signature for order ${order_id}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 3. Process the notification safely
    const result = await paymentRepository.handleMidtransNotification(notification)

    console.log(`Webhook Processed [${order_id}]:`, result)

    // 4. Always return 200 OK to Midtrans so they don't retry unnecessarily
    return NextResponse.json({ success: true, ...result }, { status: 200 })

  } catch (error: any) {
    console.error('Webhook Error processing payload:', error)
    // Always return 200 OK even if something internal fails, or maybe 500 so they retry?
    // Midtrans retries on 500. So if it's a real crash, let them retry.
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
