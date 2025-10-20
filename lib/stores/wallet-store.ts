import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const WALLET_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
const WALLET_CACHE_TIME = 4.5 * 60 * 1000 // 4.5 minutes

interface WalletData {
  id: string
  balance: number
  minimumBalance: number
  status: string
  lastWithdrawal: string | null
}

interface WalletState {
  wallet: WalletData | null
  isLoading: boolean
  lastFetched: number | null
  error: string | null
  fetchWallet: () => Promise<void>
  clearWallet: () => void
}

const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      isLoading: false,
      lastFetched: null,
      error: null,

      fetchWallet: async () => {
        const state = get()
        const now = Date.now()

        // Return cached data if still fresh
        if (
          state.lastFetched && 
          now - state.lastFetched < WALLET_CACHE_TIME &&
          state.wallet
        ) {
          return
        }

        try {
          set({ isLoading: true, error: null })

          const token = localStorage.getItem("Gemurai_token")
          if (!token) {
            set({ 
              wallet: null, 
              error: "No auth token found",
              lastFetched: now,
              isLoading: false 
            })
            return
          }

          const response = await fetch("/api/wallet", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error("Failed to fetch wallet data")
          }

          const data = await response.json()
          
          if (!data.success || !data.data) {
            throw new Error(data.message || "Invalid wallet data received")
          }
          
          set({ 
            wallet: data.data, 
            lastFetched: now,
            error: null,
            isLoading: false 
          })
        } catch (error) {
          console.error("Failed to fetch wallet:", error)
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch wallet",
            isLoading: false
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
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        lastFetched: state.lastFetched
      })
    }
  )
)