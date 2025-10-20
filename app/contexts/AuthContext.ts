import { createContext } from 'react'
import { AuthUser } from '@/lib/auth'

export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false, message: 'Not implemented' }),
  logout: async () => {},
}) 