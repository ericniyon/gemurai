"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useWallet } from "@/hooks/use-wallet"

interface WalletBalanceProps {
  variant?: "nav" | "card"
  lang: string
}

export function WalletBalance({ variant = "nav", lang }: WalletBalanceProps) {
  const { isAuthenticated, user } = useAuth()
  const { wallet, fetchWallet } = useWallet()

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isAuthenticated && user) {
      // Initial fetch
      fetchWallet()
      
      // Set up interval for periodic updates
      intervalId = setInterval(fetchWallet, 5 * 60 * 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isAuthenticated, user, fetchWallet])

  if (variant === "nav") {
    return (
      <Link href={`/${lang}/dashboard/wallet`}>
        <div className="dashboard-topbar__wallet-card">
          <div className="dashboard-topbar__wallet-badge">
            <Wallet className="dashboard-topbar__wallet-badge-icon" />
          </div>
          <div className="dashboard-topbar__wallet-meta">
            <span className="dashboard-topbar__wallet-label">Available Balance</span>
            <span className="dashboard-topbar__wallet-value">
              {wallet ? formatCurrency(wallet.balance) : "Loading..."}
            </span>
          </div>
          <div className="dashboard-topbar__wallet-cta">View</div>
        </div>
      </Link>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-muted-foreground">Available Balance</div>
        <div className="text-2xl font-bold">
          {wallet ? formatCurrency(wallet.balance) : "Loading..."}
        </div>
      </div>
      <Wallet className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}