"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Calendar,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useWallet } from "@/hooks/use-wallet"
import { formatCurrency } from "@/lib/utils"
import { WalletCard } from "../components/wallet-card"
import { DepositForm } from "../components/deposit-form"
import { TransactionHistory } from "../components/transaction-history"
import { Button } from "@/components/ui/button"

export default function WalletPage() {
  const { user } = useAuth()
  const { wallet, fetchWallet, isLoading } = useWallet()
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  // Initial wallet fetch
  useEffect(() => {
    if (user) {
      fetchWallet()
    }
  }, [user, fetchWallet])

  const handleRefresh = () => {
    fetchWallet()
    toast({
      title: "Refreshing wallet data",
      description: "Your wallet information is being updated...",
    })
  }

  if (isLoading || !wallet) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Wallet className="absolute inset-0 m-auto w-8 h-8 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Loading Wallet</h3>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your wallet information...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wallet Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your earnings, deposits, and withdrawals</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available Balance Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Available Balance
            </CardTitle>
            <div className="p-2 bg-primary rounded-lg">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(wallet.balance)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Min: {formatCurrency(wallet.minimumBalance)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Earnings Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Earnings
            </CardTitle>
            <div className="p-2 bg-primary rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(wallet.totalEarnings || 0)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Deposits: {formatCurrency(wallet.totalDeposits || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Withdrawals Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Total Withdrawals
            </CardTitle>
            <div className="p-2 bg-primary rounded-lg">
              <TrendingDown className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(wallet.totalWithdrawals || 0)}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {wallet.lastWithdrawal
                  ? new Date(wallet.lastWithdrawal).toLocaleDateString()
                  : "No withdrawals yet"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Status Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Wallet Status
            </CardTitle>
            <div className="p-2 bg-primary rounded-lg">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Badge className={`${getStatusColor(wallet.status)} font-semibold`}>
                {wallet.status.toLowerCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span>Current wallet status</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit and Withdrawal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Form */}
        <DepositForm onDepositSuccess={fetchWallet} currentBalance={wallet.balance} />
        
        {/* Withdrawal Form */}
        <WalletCard onWithdrawalSuccess={fetchWallet} />
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Net Earnings</p>
                  <p className="text-xs text-muted-foreground">After withdrawals</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency((wallet.totalEarnings || 0) - (wallet.totalWithdrawals || 0))}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Available for Withdrawal</p>
                  <p className="text-xs text-muted-foreground">Current balance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(Math.max(0, wallet.balance - wallet.minimumBalance))}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Wallet Created</p>
                  <p className="text-xs text-muted-foreground">Account age</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {wallet.createdAt ? new Date(wallet.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Wallet Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Deposit Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Minimum deposit: RWF 1,000</li>
                <li>• Multiple payment methods available</li>
                <li>• Processing time: Instant to 24 hours</li>
                <li>• Reason optional for deposits</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Withdrawal Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Minimum withdrawal: RWF 1,000</li>
                <li>• Maximum withdrawal: Available balance</li>
                <li>• Processing time: 1-3 business days</li>
                <li>• Reason required for all withdrawals</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Security Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Account Security</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Keep your login credentials secure</li>
                <li>• Review transactions regularly</li>
                <li>• Report suspicious activity immediately</li>
                <li>• Enable 2FA if available</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Payment Security</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Only use official payment channels</li>
                <li>• Verify payment details before sending</li>
                <li>• Keep payment receipts for reference</li>
                <li>• Contact support for any issues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionHistory walletId={wallet.id} />
        </div>
        
        {/* Recent Activity Summary */}
        <Card className="border shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">This Month</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Deposits:</span>
                  <span className="font-medium text-green-600">+{formatCurrency(wallet.totalDeposits || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Withdrawals:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(wallet.totalWithdrawals || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net:</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency((wallet.totalDeposits || 0) - (wallet.totalWithdrawals || 0))}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/${params.lang}/dashboard/wallet/transactions`)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  View All Transactions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Download Statement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}