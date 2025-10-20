import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthUser } from '@/lib/token'
import { verifyAuthToken } from "@/lib/token"

const TOKEN_KEY = "Gemurai_token"
const USER_KEY = "Gemurai_user"
const VERIFICATION_INTERVAL = 5 * 60 * 1000 // 5 minutes
const VERIFICATION_CACHE_TIME = 4.5 * 60 * 1000 // 4.5 minutes (slightly less than interval)

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  rolePermissions?: string[]
  databasePermissions?: string[]
  avatar: string | null
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  lastVerified: number | null
  verificationFailures: number // Add counter for verification failures
  setIsAuthenticated: (value: boolean) => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsLoading: (value: boolean) => void
  setIsInitialized: (value: boolean) => void
  setLastVerified: (value: number | null) => void
  setVerificationFailures: (value: number) => void
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  verifyAuth: () => Promise<void>
  refreshUser: () => Promise<void>
  initializeFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: true,
      isInitialized: false,
      lastVerified: null,
      verificationFailures: 0, // Initialize failure counter

      // Actions
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem(TOKEN_KEY, token)
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
        set({ token })
      },
      setIsLoading: (value) => set({ isLoading: value }),
      setIsInitialized: (value) => set({ isInitialized: value }),
      setLastVerified: (value) => set({ lastVerified: value }),
      setVerificationFailures: (value) => set({ verificationFailures: value }),
      
      // Initialize from storage
      initializeFromStorage: async () => {
        try {
          // Try to get token from localStorage first
          let token = localStorage.getItem(TOKEN_KEY)
          
          // If not in localStorage, try cookies
          if (!token) {
            token = document.cookie
              .split("; ")
              .find((row) => row.startsWith("Gemurai_token="))
              ?.split("=")[1]
          }

          if (token) {
            try {
              const userData = await verifyAuthToken(token)
              if (userData) {
                set({
                  isAuthenticated: true,
                  user: userData,
                  token,
                  lastVerified: Date.now(),
                })
              }
            } catch (error) {
              console.error("Auth initialization error:", error)
              
              // Check if it's an infrastructure error
              const errorMessage = error instanceof Error ? error.message : String(error)
              const isInfrastructureError = errorMessage.includes('connect') || 
                                         errorMessage.includes('network') || 
                                         errorMessage.includes('database') ||
                                         errorMessage.includes('timeout') ||
                                         errorMessage.includes('ECONNREFUSED')
              
              if (isInfrastructureError) {
                console.warn("Infrastructure error during auth initialization, keeping token for retry:", errorMessage)
                // Keep the token and mark as authenticated, will retry verification later
                set({
                  isAuthenticated: true,
                  token,
                  lastVerified: null,
                })
              } else {
                // For actual auth errors, clear the token
                console.warn("Auth error during initialization, clearing token")
                set({
                  isAuthenticated: false,
                  user: null,
                  token: null,
                  lastVerified: null,
                })
              }
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error)
        } finally {
          set({ isLoading: false, isInitialized: true })
        }
      },

      // Login function
      login: async (identifier: string, password: string) => {
        try {
          console.log("🔐 Attempting login for:", identifier)
          
          // Determine if identifier is email or phone
          const isEmail = identifier.includes('@')
          const payload = isEmail ? { email: identifier, password } : { phone: identifier, password }
          
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include',
          })

          console.log("📡 Login response status:", response.status)
          console.log("📡 Login response headers:", Object.fromEntries(response.headers.entries()))

          let data;
          try {
            // Clone the response to avoid reading the body twice
            const responseClone = response.clone()
            data = await response.json()
            console.log("📦 Login response data:", data)
          } catch (parseError) {
            console.error("❌ Failed to parse response JSON:", parseError)
            
            // If we can't parse JSON, try to get the text response from the clone
            try {
              const textResponse = await responseClone.text()
              console.error("📝 Raw response text:", textResponse)
              
              return {
                success: false,
                message: `Server error: ${response.status} - ${response.statusText}. Raw response: ${textResponse.slice(0, 200)}...`
              }
            } catch (textError) {
              console.error("❌ Failed to read response text:", textError)
              return {
                success: false,
                message: `Server error: ${response.status} - ${response.statusText}. Unable to read response body.`
              }
            }
          }

          if (!response.ok) {
            console.error("❌ Login failed with status:", response.status)
            
            // Handle specific error cases
            if (response.status === 500) {
              return {
                success: false,
                message: `Server error (500): ${data.error || data.message || 'Internal server error'}${data.details ? '. Details: ' + data.details : ''}`
              }
            } else if (response.status === 401) {
              return {
                success: false,
                message: data.error || data.message || 'Invalid email or password'
              }
            } else if (response.status >= 400 && response.status < 500) {
              return {
                success: false,
                message: data.error || data.message || `Client error (${response.status})`
              }
            } else {
              return {
                success: false,
                message: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
              }
            }
          }

          if (data.success) {
            console.log("✅ Login successful for:", identifier)
            set({
              isAuthenticated: true,
              user: data.user,
              lastVerified: Date.now(),
            })
            // Use setToken to properly store the token
            get().setToken(data.token)
            return { success: true }
          }

          return {
            success: false,
            message: data.error || data.message || 'Login failed'
          }
        } catch (error) {
          console.error("💥 Login network/fetch error:", error)
          
          // Check if it's a network error
          if (error instanceof TypeError && error.message.includes('fetch')) {
            console.log("🌐 Detected network error, trying fallback endpoint...")
            
            // Try fallback endpoint
            try {
              const fallbackResponse = await fetch('/api/v1/auth/login-fallback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include',
              })

              const fallbackData = await fallbackResponse.json()
              console.log("🔄 Fallback response:", fallbackData)

              if (fallbackResponse.ok && fallbackData.success) {
                console.log("✅ Fallback login successful for:", identifier)
                set({
                  isAuthenticated: true,
                  user: fallbackData.user,
                  lastVerified: Date.now(),
                })
                // Use setToken to properly store the token
                get().setToken(fallbackData.token)
                return { success: true }
              }

              return {
                success: false,
                message: fallbackData.error || fallbackData.message || 'Login failed (fallback)'
              }
            } catch (fallbackError) {
              console.error("💥 Fallback also failed:", fallbackError)
              return {
                success: false,
                message: `Network error: Cannot connect to server. Please check your internet connection and try again. (${error.message})`
              }
            }
          }

          // For other types of errors
          return {
            success: false,
            message: error instanceof Error ? `Error: ${error.message}` : 'An unexpected error occurred during login'
          }
        }
      },

      // Verify auth status
      verifyAuth: async () => {
        const { token, verificationFailures } = get()
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          const userData = await verifyAuthToken(token)
          if (userData) {
            set({
              isAuthenticated: true,
              user: userData,
              lastVerified: Date.now(),
              verificationFailures: 0, // Reset failure counter on success
            })
          } else {
            // Increment failure counter
            const newFailureCount = verificationFailures + 1
            set({ verificationFailures: newFailureCount })
            
            // Only log out after 3 consecutive failures
            if (newFailureCount >= 3) {
              console.warn("Multiple verification failures, logging out user")
              set({
                isAuthenticated: false,
                user: null,
                token: null,
                lastVerified: null,
                verificationFailures: 0,
              })
            } else {
              console.warn(`Verification failed (attempt ${newFailureCount}/3)`)
            }
          }
        } catch (error) {
          console.error("Auth verification error:", error)
          
          // Check if it's a database/network error vs actual auth error
          const errorMessage = error instanceof Error ? error.message : String(error)
          const isInfrastructureError = errorMessage.includes('connect') || 
                                     errorMessage.includes('network') || 
                                     errorMessage.includes('database') ||
                                     errorMessage.includes('timeout') ||
                                     errorMessage.includes('ECONNREFUSED')
          
          if (isInfrastructureError) {
            console.warn("Infrastructure error during auth verification, keeping user session:", errorMessage)
            // Don't increment failure counter for infrastructure errors
            // Keep the user logged in and try again later
            return
          }
          
          // Increment failure counter only for actual auth errors
          const newFailureCount = verificationFailures + 1
          set({ verificationFailures: newFailureCount })
          
          // Only log out after 3 consecutive failures
          if (newFailureCount >= 3) {
            console.warn("Multiple verification failures, logging out user")
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              lastVerified: null,
              verificationFailures: 0,
            })
          } else {
            console.warn(`Verification error (attempt ${newFailureCount}/3):`, error)
          }
        }
      },

      // Refresh user data (force refresh from server)
      refreshUser: async () => {
        const { token } = get()
        if (!token) {
          console.warn("No token available for user refresh")
          return
        }

        try {
          console.log("🔄 Refreshing user data from server...")
          const userData = await verifyAuthToken(token)
          if (userData) {
            set({
              isAuthenticated: true,
              user: userData,
              lastVerified: Date.now(),
            })
            console.log("✅ User data refreshed successfully:", userData)
          } else {
            console.warn("No user data returned from server, but keeping current session")
            // Don't immediately log out if no user data is returned
            // This could be a temporary issue, so keep the current session
            return
          }
        } catch (error) {
          console.error("❌ Error refreshing user data:", error)
          
          // Check if it's a JWT signature verification error
          const errorMessage = error instanceof Error ? error.message : String(error)
          const isJWTSignatureError = errorMessage.includes('JWSSignatureVerificationFailed') ||
                                    errorMessage.includes('signature verification failed')
          
          if (isJWTSignatureError) {
            console.warn("JWT signature verification failed - attempting to regenerate token...")
            
            // Try to regenerate the token using the current user data
            const { user } = get()
            if (user) {
              try {
                const { generateAuthToken } = await import('@/lib/token')
                const newToken = await generateAuthToken(user)
                set({
                  token: newToken,
                  lastVerified: Date.now(),
                })
                console.log("✅ Token regenerated successfully")
                return
              } catch (regenerateError) {
                console.error("Failed to regenerate token:", regenerateError)
                // Fall through to keep current session
              }
            }
            
            console.warn("JWT signature verification failed - keeping current session")
            // Don't log out for JWT signature errors, keep current session
            // This prevents unnecessary logouts due to token corruption
            return
          }
          
          // Check if it's an infrastructure error
          const isInfrastructureError = errorMessage.includes('connect') || 
                                     errorMessage.includes('network') || 
                                     errorMessage.includes('database') ||
                                     errorMessage.includes('timeout') ||
                                     errorMessage.includes('ECONNREFUSED')
          
          if (isInfrastructureError) {
            console.warn("Infrastructure error during user refresh, keeping current session:", errorMessage)
            // Don't log out for infrastructure errors, keep current session
            return
          }
          
          // Only log out for actual auth errors (not JWT signature or infrastructure errors)
          console.warn("Auth error during user refresh, logging out user")
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            lastVerified: null,
          })
        }
      },

      // Logout function
      logout: () => {
        // Clear the auth cookie
        document.cookie = "Gemurai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          lastVerified: null,
        })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)