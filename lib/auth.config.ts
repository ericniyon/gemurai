import type { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { generateAuthToken } from "./token"

// Force Node.js runtime
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            permissions: true,
            avatar: true
          }
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar
        }
      }
    }
  ],
  callbacks: {
    async signIn({ user }) {
      if (user) {
        return true
      }
      return false
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role
        token.id = user.id
        token.permissions = user.permissions
        token.avatar = user.avatar
        token.accessToken = await generateAuthToken({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          avatar: user.avatar
        })
      }

      // Update token if session is updated
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.permissions = token.permissions as string[]
        session.user.avatar = token.avatar as string | null
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after login
      return `${baseUrl}/dashboard`
    }
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 // 7 days
      }
    }
  },
  events: {
    async signOut({ token }) {
      if (token) {
        // Clear any custom tokens or session data
        await prisma.session.deleteMany({
          where: {
            userId: token.id as string
          }
        })
      }
    }
  }
}