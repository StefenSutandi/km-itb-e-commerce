import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import { UserRole, UserType } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      profileCompleted: boolean
      userType: UserType | null
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    profileCompleted: boolean
    userType: UserType | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        const u = await prisma.user.findUnique({ where: { id: user.id } })
        if (u) {
          token.role = u.role
          token.profileCompleted = u.profileCompleted
          token.userType = u.userType
        }
      }
      
      if (trigger === "update" && session) {
        if (session.profileCompleted !== undefined) token.profileCompleted = session.profileCompleted
        if (session.role !== undefined) token.role = session.role
        if (session.userType !== undefined) token.userType = session.userType
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as UserRole) || "BUYER"
        session.user.profileCompleted = (token.profileCompleted as boolean) || false
        session.user.userType = (token.userType as UserType) || null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
