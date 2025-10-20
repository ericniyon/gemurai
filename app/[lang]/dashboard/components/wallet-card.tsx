"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Wallet, 
  DollarSign, 
  Calendar,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useWallet } from "@/hooks/use-wallet"

interface WalletCardProps {
  onWithdrawalSuccess?: () => void
}

export function WalletCard({ onWithdrawalSuccess }: WalletCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { wallet, fetchWallet } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalReason, setWithdrawalReason] = useState("")

  const handleWithdrawalRequest = async () => {
    try {
      setIsSubmitting(true)
      const amount = parseFloat(withdrawalAmount)

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid withdrawal amount",
          variant: "destructive"
        })
        return
      }

      if (amount > wallet!.balance - wallet!.minimumBalance) {
        toast({
          title: "Insufficient balance",
          description: `You can only withdraw up to ${formatCurrency(wallet!.balance - wallet!.minimumBalance)}`,
          variant: "destructive"
        })
        return
      }

      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          reason: withdrawalReason
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      })

      // Reset form
      setShowWithdrawalForm(false)
      setWithdrawalAmount("")
      setWithdrawalReason("")

      // Refresh data
      fetchWallet()
      onWithdrawalSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit withdrawal request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!wallet) {
    return (
      <Card className="border shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Withdraw Funds
          </CardTitle>
          <div className="p-2 bg-primary rounded-lg">
            <TrendingDown className="h-5 w-5 text-primary-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                <TrendingDown className="absolute inset-0 m-auto w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Loading wallet data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const availableForWithdrawal = Math.max(0, wallet.balance - wallet.minimumBalance)
  const isWithdrawalDisabled = availableForWithdrawal <= 0

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-foreground">
            Withdraw Funds
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Request money from your wallet</p>
        </div>
        <div className="p-3 bg-primary rounded-lg">
          <TrendingDown className="h-6 w-6 text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available for Withdrawal Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-border">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(availableForWithdrawal)}
          </div>
          <div className="text-sm text-muted-foreground">Available for Withdrawal</div>
          <div className="text-xs text-muted-foreground mt-1">
            Total balance: {formatCurrency(wallet.balance)}
          </div>
        </div>

        {/* Last Withdrawal Info */}
        {wallet.lastWithdrawal && (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Last Withdrawal</p>
              <p className="text-xs text-green-700">
                {new Date(wallet.lastWithdrawal).toLocaleDateString()} at {new Date(wallet.lastWithdrawal).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Warning */}
        {isWithdrawalDisabled && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Minimum Balance Required</p>
              <p className="text-xs text-yellow-700">
                You need to maintain a minimum balance of {formatCurrency(wallet.minimumBalance)} in your wallet
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Form Toggle */}
        <Button
          onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}
          variant="outline"
          className="w-full h-12 text-base font-medium border-2 hover:border-primary hover:bg-accent transition-all duration-200"
          disabled={isWithdrawalDisabled}
        >
          <div className="flex items-center gap-2">
            {showWithdrawalForm ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
            {isWithdrawalDisabled ? "Insufficient Balance" : "Request Withdrawal"}
          </div>
        </Button>

        {/* Withdrawal Form */}
        {showWithdrawalForm && !isWithdrawalDisabled && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-border">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount" className="text-sm font-medium text-foreground">
                Amount (RWF)
              </Label>
              <div className="relative">
                <Input
                  id="withdrawal-amount"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder={`Max: ${formatCurrency(availableForWithdrawal)}`}
                  min="1000"
                  max={availableForWithdrawal}
                  step="100"
                  className="h-12 text-lg font-medium pr-20 bg-white"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs">
                    RWF
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum withdrawal: {formatCurrency(availableForWithdrawal)}
              </p>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="withdrawal-reason" className="text-sm font-medium text-foreground">
                Reason for withdrawal
              </Label>
              <Textarea
                id="withdrawal-reason"
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                placeholder="Please provide a reason for your withdrawal request..."
                rows={3}
                className="resize-none bg-white"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleWithdrawalRequest}
              disabled={isSubmitting || !withdrawalAmount || !withdrawalReason}
              className="w-full h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-5 w-5" />
                  Submit Withdrawal Request
                </>
              )}
            </Button>

            {/* Withdrawal Guidelines */}
            <div className="p-3 bg-white rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Withdrawal Guidelines</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Minimum withdrawal: RWF 1,000</p>
                <p>• Processing time: 1-3 business days</p>
                <p>• Reason is required for all withdrawals</p>
                <p>• You'll receive confirmation via email/SMS</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}