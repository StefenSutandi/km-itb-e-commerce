import { prisma } from "@/lib/prisma"

export async function logAuditAction({
  actorId,
  action,
  entityType,
  entityId,
  metadata = null,
}: {
  actorId: string
  action: string
  entityType: string
  entityId: string
  metadata?: any
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    })
  } catch (error) {
    console.error("Failed to log audit action:", error)
  }
}
