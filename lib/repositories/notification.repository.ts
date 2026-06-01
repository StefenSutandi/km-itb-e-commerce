import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

export class NotificationRepository {
  /**
   * Logs an email notification attempt (either SENT or FAILED).
   */
  async logNotificationAttempt(
    userId: string,
    type: NotificationType,
    recipient: string,
    subject: string,
    status: 'SENT' | 'FAILED',
    metadata?: any
  ) {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          type,
          recipient,
          subject,
          status,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
        }
      })
    } catch (error) {
      console.error('Failed to write to NotificationLog:', error)
      // We swallow this error so it doesn't break the main flow.
    }
  }
}

export const notificationRepository = new NotificationRepository()
