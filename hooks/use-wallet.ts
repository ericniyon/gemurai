"use client"

import { create } from 'zustand'

const WALLET_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
const WALLET_CACHE_TIME = 4.5 * 60 * 1000 // 4.5 minutes

interface WalletData {
  id: string
  balance: number
  minimumBalance: number
  status: string
  lastWithdrawal: string | null
  totalDeposits?: number
  totalWithdrawals?: number
  totalEarnings?: number
}

interface WalletState {
  wallet: WalletData | null
  isLoading: boolean
  lastFetched: number | null
  error: string | null
  fetchWallet: () => Promise<void>
  clearWallet: () => void
}

interface WalletResponse {
  success: boolean
  data?: WalletData
  error?: string
}

const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  isLoading: false,
  lastFetched: null,
  error: null,

  fetchWallet: async (retryCount = 0) => {
    const state = get()
    const now = Date.now()
    const maxRetries = 2

    // Return cached data if still fresh
    if (
      state.lastFetched && 
      now - state.lastFetched < WALLET_CACHE_TIME &&
      state.wallet
    ) {
      return
    }

    // Check for auth token early to prevent unnecessary processing
    const token = localStorage.getItem("Gemurai_token")
    if (!token) {
      set({ 
        wallet: null, 
        error: "Authentication required. Please log in.",
        lastFetched: now,
        isLoading: false 
      })
      return
    }

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof setTimeout === 'undefined') {
      set({ 
        wallet: null, 
        error: "Wallet not available in this environment.",
        lastFetched: now,
        isLoading: false 
      })
      return
    }

    try {
      set({ isLoading: true, error: null })

      // Fetch wallet data with timeout
      const controller = new AbortController()
      let timeoutId: NodeJS.Timeout | null = null
      
      try {
        timeoutId = setTimeout(() => {
          if (!controller.signal.aborted) {
            controller.abort('Request timeout')
          }
        }, 10000) // 10 second timeout

        const [walletResponse, totalsResponse] = await Promise.all([
          fetch("/api/wallet", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }),
          fetch("/api/wallet/transactions/totals", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          })
        ])

        // Clear timeout if requests complete successfully
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // Handle non-200 responses
        if (!walletResponse.ok) {
          let errorMessage = `Failed to fetch wallet data: ${walletResponse.status} ${walletResponse.statusText}`
          
          try {
            const errorData = await walletResponse.json()
            if (errorData?.error) {
              errorMessage = errorData.error
            }
          } catch (parseError) {
            // If JSON parsing fails, use the default error message
            console.warn("Failed to parse error response:", parseError)
          }
          
          throw new Error(errorMessage)
        }

        // Parse and validate responses
        const walletData: WalletResponse = await walletResponse.json()
        let totalsData = null
        
        try {
          if (totalsResponse.ok) {
            totalsData = await totalsResponse.json()
          } else {
            console.warn("Failed to fetch transaction totals:", totalsResponse.status, totalsResponse.statusText)
          }
        } catch (parseError) {
          console.warn("Failed to parse totals response:", parseError)
        }
        
        if (!walletData.success || !walletData.data) {
          throw new Error(walletData.error || "Invalid wallet data received")
        }

        // Combine wallet data with totals
        const combinedData = {
          ...walletData.data,
          ...(totalsData?.success ? totalsData.data : {})
        }

        // Update state with wallet data
        set({ 
          wallet: combinedData, 
          lastFetched: now,
          error: null,
          isLoading: false 
        })
      } catch (fetchError) {
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Wallet fetch error:", error)
      
      // Retry logic for network errors or 5xx server errors
      if (retryCount < maxRetries) {
        const shouldRetry = error instanceof Error && (
          error.name === 'AbortError' || 
          error.message.includes('500') ||
          error.message.includes('502') ||
          error.message.includes('503') ||
          error.message.includes('504')
        )
        
        if (shouldRetry) {
          console.log(`Retrying wallet fetch (attempt ${retryCount + 1}/${maxRetries})`)
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
          return get().fetchWallet(retryCount + 1)
        }
      }
      
      let errorMessage = "Failed to fetch wallet data"
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out. Please try again."
        } else {
          errorMessage = error.message
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      set({ 
        wallet: null,
        error: errorMessage,
        isLoading: false,
        lastFetched: now
      })
    }
  },

  clearWallet: () => {
    set({ 
      wallet: null, 
      lastFetched: null,
      error: null 
    })
  }
}))

export function useWallet() {
  return useWalletStore()
}