import { createContext } from "react"
import type { AuthUser } from "@/lib/auth"

export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  setToken: () => {},
  login: async () => ({ success: false, message: "Not implemented" }),
  logout: async () => {},
}) 