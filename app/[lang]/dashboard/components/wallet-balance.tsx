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
        <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <div className="hidden sm:block text-left">
              <div className="text-xs text-white/70">Available Balance</div>
              <div className="text-sm font-medium">
                {wallet ? formatCurrency(wallet.balance) : "Loading..."}
              </div>
            </div>
          </div>
        </Button>
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