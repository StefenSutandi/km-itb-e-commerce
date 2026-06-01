import { notificationRepository } from '@/lib/repositories/notification.repository'
import { NotificationType } from '@prisma/client'

/**
 * Core email sender that uses Resend API via fetch.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (provider !== 'resend' || !apiKey || !from) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`)
    console.log(`[MOCK EMAIL CONTENT] ${text || html}`)
    return true // Mock success
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text
      })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Resend API Error:', res.status, errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send email via Resend API:', error)
    return false
  }
}

// ============================================================================
// Event-Specific Email Handlers
// ============================================================================

export async function sendOrderCreatedEmail(order: any, userEmail: string, userId: string) {
  // Fire and forget (async)
  setImmediate(async () => {
    const subject = `Pesanan Anda Diterima: ${order.orderNumber}`
    const html = `
      <h2>Terima kasih atas pesanan Anda!</h2>
      <p>Pesanan <strong>${order.orderNumber}</strong> telah berhasil dibuat dan menunggu pembayaran.</p>
      <p>Total: Rp${order.total}</p>
      <p>Silakan selesaikan pembayaran untuk melanjutkan proses pesanan.</p>
    `

    const success = await sendEmail({ to: userEmail, subject, html })
    
    await notificationRepository.logNotificationAttempt(
      userId,
      'PAYMENT_WAITING',
      userEmail,
      subject,
      success ? 'SENT' : 'FAILED',
      { orderId: order.id }
    )
  })
}

export async function sendPaymentSuccessEmail(order: any, userEmail: string, userId: string) {
  setImmediate(async () => {
    const subject = `Pembayaran Berhasil: ${order.orderNumber}`
    const html = `
      <h2>Pembayaran Berhasil!</h2>
      <p>Terima kasih, pembayaran untuk pesanan <strong>${order.orderNumber}</strong> sebesar Rp${order.total} telah kami terima.</p>
      <p>Pesanan Anda akan segera kami proses.</p>
    `

    const success = await sendEmail({ to: userEmail, subject, html })
    
    await notificationRepository.logNotificationAttempt(
      userId,
      'PAYMENT_SUCCESS',
      userEmail,
      subject,
      success ? 'SENT' : 'FAILED',
      { orderId: order.id }
    )
  })
}

export async function sendManualReviewEmail(order: any, userEmail: string, userId: string) {
  setImmediate(async () => {
    const subject = `Informasi Pesanan: ${order.orderNumber}`
    const html = `
      <h2>Pembayaran Diterima (Menunggu Pengecekan)</h2>
      <p>Pembayaran untuk pesanan <strong>${order.orderNumber}</strong> telah kami terima.</p>
      <p>Namun, pesanan Anda saat ini memerlukan pengecekan manual oleh tim kami (kemungkinan karena stok tidak mencukupi saat transaksi).</p>
      <p>Tim kami akan segera memproses atau menghubungi Anda lebih lanjut.</p>
    `

    const success = await sendEmail({ to: userEmail, subject, html })
    
    await notificationRepository.logNotificationAttempt(
      userId,
      'MANUAL_REVIEW_REQUIRED',
      userEmail,
      subject,
      success ? 'SENT' : 'FAILED',
      { orderId: order.id }
    )
  })
}

export async function sendOrderStatusUpdatedEmail(order: any, userEmail: string, userId: string, newStatus: string) {
  setImmediate(async () => {
    const subject = `Update Status Pesanan: ${order.orderNumber}`
    const html = `
      <h2>Status Pesanan Diperbarui</h2>
      <p>Status pesanan <strong>${order.orderNumber}</strong> Anda sekarang adalah: <strong>${newStatus}</strong>.</p>
    `

    const success = await sendEmail({ to: userEmail, subject, html })
    
    await notificationRepository.logNotificationAttempt(
      userId,
      'ORDER_STATUS_UPDATED',
      userEmail,
      subject,
      success ? 'SENT' : 'FAILED',
      { orderId: order.id, newStatus }
    )
  })
}

export async function sendShippingReceiptUpdatedEmail(order: any, userEmail: string, userId: string, receiptNumber: string) {
  setImmediate(async () => {
    const subject = `Pesanan Anda Dikirim: ${order.orderNumber}`
    const html = `
      <h2>Pesanan Telah Dikirim!</h2>
      <p>Pesanan <strong>${order.orderNumber}</strong> telah dikirim.</p>
      <p>Nomor Resi: <strong>${receiptNumber}</strong></p>
    `

    const success = await sendEmail({ to: userEmail, subject, html })
    
    await notificationRepository.logNotificationAttempt(
      userId,
      'SHIPPING_RECEIPT_UPDATED',
      userEmail,
      subject,
      success ? 'SENT' : 'FAILED',
      { orderId: order.id, receiptNumber }
    )
  })
}

export async function sendOrderCancelledEmail(order: any, userEmail: string, userId: string) {
  setImmediate(async () => {
    const subject = `Pesanan Dibatalkan: ${order.orderNumber}`
    const html = `
      <h2>Pesanan Dibatalkan</h2>
      <p>Pesanan <strong>${order.orderNumber}</strong> telah dibatalkan.</p>
      <p>Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
    `

    const success = await sendEmail({ to: userEmail, subject, html })
    
    await notificationRepository.logNotificationAttempt(
      userId,
      'ORDER_CANCELLED',
      userEmail,
      subject,
      success ? 'SENT' : 'FAILED',
      { orderId: order.id }
    )
  })
}
