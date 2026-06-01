import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    redirect("/")
  }
  return user
}

export async function requireSuperAdmin() {
  const user = await requireUser()
  if (user.role !== "SUPERADMIN") {
    redirect("/")
  }
  return user
}

export async function isProfileComplete() {
  const user = await getCurrentUser()
  if (!user) return false
  return user.profileCompleted
}
