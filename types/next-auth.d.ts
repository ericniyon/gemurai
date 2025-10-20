import { DefaultSession } from "next-auth"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      permissions: string[]
    }
    accessToken: string
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    permissions: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: string
    permissions: string[]
    accessToken: string
  }
}