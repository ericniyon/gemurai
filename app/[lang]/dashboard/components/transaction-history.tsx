"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Clock,
  RefreshCw
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL'
  amount: number
  status: string
  description?: string
  createdAt: string
}

interface TransactionHistoryProps {
  walletId: string
}

export function TransactionHistory({ walletId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch(`/api/wallet/transactions?walletId=${walletId}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      if (data.success) {
        setTransactions(data.data || [])
      } else {
        throw new Error(data.error || 'Failed to fetch transactions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (walletId) {
      fetchTransactions()
    }
  }, [walletId])

  const getTransactionIcon = (type: string) => {
    return type === 'DEPOSIT' ? (
      <div className="p-2 bg-primary/10 rounded-lg">
        <TrendingUp className="w-4 h-4 text-primary" />
      </div>
    ) : (
      <div className="p-2 bg-primary/10 rounded-lg">
        <TrendingDown className="w-4 h-4 text-primary" />
      </div>
    )
  }

  const getTransactionColor = (type: string) => {
    return type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (isLoading && transactions.length === 0) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                <Clock className="absolute inset-0 m-auto w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Your latest wallet activity</p>
        </div>
        <Button
          onClick={fetchTransactions}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No transactions yet</h3>
            <p className="text-sm text-muted-foreground">Your transaction history will appear here once you make your first transaction.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const { date, time } = formatDate(transaction.createdAt)
              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-border hover:shadow-sm transition-shadow duration-200"
                >
                  {getTransactionIcon(transaction.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground capitalize">
                        {transaction.type.toLowerCase()}
                      </h4>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {transaction.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{date}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const lang = window.location.pathname.split('/')[1]
                window.location.href = `/${lang}/dashboard/wallet/transactions`
              }}
            >
              View All Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
