"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  Download,
  User,
  DollarSign,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface DCCBalance {
  id: string
  name: string
  email: string
  totalVouchers: number
  activeVouchers: number
  totalValue: number
  remainingBalance: number
  usedBalance: number
  usagePercentage: number
  lastActivity?: string
}

export default function DCCBalancesPage() {
  const { user, isAuthenticated } = useAuth()
  const [dccBalances, setDccBalances] = useState<DCCBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchDCCBalances()
    }
  }, [isAuthenticated])

  const fetchDCCBalances = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("Gemurai_token")
      const res = await fetch("/api/v1/vouchers/dcc-balances", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      const data = await res.json()
      
      if (data.success) {
        setDccBalances(data.data)
      } else {
        setError(data.message || "Failed to load DCC balances")
      }
    } catch (e: any) {
      setError(e.message || "Failed to load DCC balances")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredDCCs = dccBalances.filter(dcc =>
    dcc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dcc.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalStats = {
    totalDCCs: dccBalances.length,
    totalVouchers: dccBalances.reduce((sum, dcc) => sum + dcc.totalVouchers, 0),
    totalValue: dccBalances.reduce((sum, dcc) => sum + dcc.totalValue, 0),
    totalRemaining: dccBalances.reduce((sum, dcc) => sum + dcc.remainingBalance, 0),
    totalUsed: dccBalances.reduce((sum, dcc) => sum + dcc.usedBalance, 0)
  }

  const exportData = () => {
    const csvContent = [
      ["DCC Name", "Email", "Total Vouchers", "Active Vouchers", "Total Value", "Remaining Balance", "Used Balance", "Usage %"],
      ...filteredDCCs.map(dcc => [
        dcc.name,
        dcc.email,
        dcc.totalVouchers.toString(),
        dcc.activeVouchers.toString(),
        formatCurrency(dcc.totalValue),
        formatCurrency(dcc.remainingBalance),
        formatCurrency(dcc.usedBalance),
        `${dcc.usagePercentage}%`
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dcc-balances-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("DCC balances exported successfully!")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            DCC Voucher Balances
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor and manage voucher balances across all DCCs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchDCCBalances}
            disabled={refreshing}
            className="h-12 px-4 border-2 border-gray-200 rounded-xl"
          >
            {refreshing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button
            onClick={exportData}
            className="h-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total DCCs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {totalStats.totalDCCs}
                </p>
                <p className="text-xs text-gray-500">Active DCC accounts</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Vouchers</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {totalStats.totalVouchers}
                </p>
                <p className="text-xs text-gray-500">Across all DCCs</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {formatCurrency(totalStats.totalValue)}
                </p>
                <p className="text-xs text-gray-500">Combined value</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {formatCurrency(totalStats.totalRemaining)}
                </p>
                <p className="text-xs text-gray-500">Available balance</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Used</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {formatCurrency(totalStats.totalUsed)}
                </p>
                <p className="text-xs text-gray-500">Spent so far</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search DCCs by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* DCC Balances List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            DCC Balances ({filteredDCCs.length})
          </h2>
          {searchTerm && (
            <p className="text-sm text-gray-600">
              Showing results for "{searchTerm}"
            </p>
          )}
        </div>

        {filteredDCCs.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-12 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No DCCs found" : "No DCC balances available"}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "DCC balances will appear here once vouchers are created"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDCCs.map((dcc) => (
            <Card key={dcc.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{dcc.name}</h3>
                        <p className="text-gray-600">{dcc.email}</p>
                      </div>
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dcc.usagePercentage > 80 
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : dcc.usagePercentage > 50
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {dcc.usagePercentage}% Used
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Vouchers</p>
                        <p className="text-lg font-bold text-gray-900">{dcc.totalVouchers}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Active</p>
                        <p className="text-lg font-bold text-green-600">{dcc.activeVouchers}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(dcc.totalValue)}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(dcc.remainingBalance)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Usage Progress</span>
                        <span className="font-medium">
                          {formatCurrency(dcc.usedBalance)} / {formatCurrency(dcc.totalValue)}
                        </span>
                      </div>
                      <Progress value={dcc.usagePercentage} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
