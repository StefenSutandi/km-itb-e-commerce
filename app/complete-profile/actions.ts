"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logAuditAction } from "@/lib/audit"
import { redirect } from "next/navigation"

export async function completeProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const waNumber = formData.get("waNumber") as string
  const userType = formData.get("userType") as "MAHASISWA" | "UMUM"
  
  const street = formData.get("street") as string
  const district = formData.get("district") as string
  const city = formData.get("city") as string
  const province = formData.get("province") as string
  const postalCode = formData.get("postalCode") as string
  
  const termsAgreed = formData.get("terms") === "on"
  const privacyAgreed = formData.get("privacy") === "on"
  const disclaimerAgreed = formData.get("disclaimer") === "on"

  if (!name || !waNumber || !userType || !street || !district || !city || !province || !postalCode) {
    throw new Error("Semua kolom harus diisi")
  }

  if (!termsAgreed || !privacyAgreed || !disclaimerAgreed) {
    throw new Error("Anda harus menyetujui semua persyaratan")
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create default address
      await tx.address.create({
        data: {
          userId: session.user.id,
          street,
          district,
          city,
          province,
          postalCode,
          isDefault: true,
        },
      })

      // Update user
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name,
          waNumber,
          userType,
          profileCompleted: true,
        },
      })
    })

    await logAuditAction({
      actorId: session.user.id,
      action: "PROFILE_COMPLETED",
      entityType: "USER",
      entityId: session.user.id,
    })

  } catch (error) {
    console.error("Profile completion error:", error)
    throw new Error("Terjadi kesalahan saat menyimpan profil")
  }

  redirect("/products")
}
