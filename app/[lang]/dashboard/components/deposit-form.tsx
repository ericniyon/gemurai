"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  DollarSign, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote,
  AlertCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DepositFormProps {
  onDepositSuccess?: () => void
  currentBalance: number
}

export function DepositForm({ onDepositSuccess, currentBalance }: DepositFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositReason, setDepositReason] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "bank_transfer" | "cash">("mobile_money")

  const handleDepositRequest = async () => {
    try {
      setIsSubmitting(true)
      const amount = parseFloat(depositAmount)

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid deposit amount",
          variant: "destructive"
        })
        return
      }

      if (amount < 1000) {
        toast({
          title: "Minimum deposit required",
          description: "Minimum deposit amount is RWF 1,000",
          variant: "destructive"
        })
        return
      }

      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        throw new Error("No auth token found")
      }

      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          reason: depositReason,
          paymentMethod
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast({
        title: "Success",
        description: "Deposit request submitted successfully",
      })

      // Reset form
      setShowDepositForm(false)
      setDepositAmount("")
      setDepositReason("")
      setPaymentMethod("mobile_money")

      // Refresh data
      onDepositSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit deposit request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "mobile_money":
        return <CreditCard className="w-4 h-4" />
      case "bank_transfer":
        return <Banknote className="w-4 h-4" />
      case "cash":
        return <DollarSign className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "mobile_money":
        return "Mobile Money"
      case "bank_transfer":
        return "Bank Transfer"
      case "cash":
        return "Cash"
      default:
        return "Mobile Money"
    }
  }

  return (
    <Card className="border shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">
            Deposit Money
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Add funds to your wallet</p>
        </div>
        <div className="p-3 bg-primary rounded-lg">
          <TrendingUp className="h-6 w-6 text-primary-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-border">
          <div className="text-2xl font-bold text-foreground mb-1">
            {formatCurrency(currentBalance)}
          </div>
          <div className="text-sm text-muted-foreground">Current Balance</div>
        </div>

        {/* Deposit Guidelines */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Deposit Guidelines</p>
            <p className="text-xs text-blue-700">
              Minimum deposit: RWF 1,000 • Processing time: Instant to 24 hours
            </p>
          </div>
        </div>

        {/* Deposit Form Toggle */}
        <Button
          onClick={() => setShowDepositForm(!showDepositForm)}
          variant="outline"
          className="w-full h-12 text-base font-medium border-2 hover:border-primary hover:bg-accent transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            {showDepositForm ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
            Make a Deposit
          </div>
        </Button>

        {/* Deposit Form */}
        {showDepositForm && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-border">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Payment Method
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "mobile_money", label: "Mobile Money", icon: CreditCard },
                  { value: "bank_transfer", label: "Bank Transfer", icon: Banknote },
                  { value: "cash", label: "Cash", icon: DollarSign }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      paymentMethod === method.value
                        ? "border-primary bg-white text-primary shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <method.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{method.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="deposit-amount" className="text-sm font-medium text-foreground">
                Amount (RWF)
              </Label>
              <div className="relative">
                <Input
                  id="deposit-amount"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount (min: RWF 1,000)"
                  min="1000"
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
                Minimum deposit: RWF 1,000
              </p>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="deposit-reason" className="text-sm font-medium text-foreground">
                Reason for deposit (optional)
              </Label>
              <Textarea
                id="deposit-reason"
                value={depositReason}
                onChange={(e) => setDepositReason(e.target.value)}
                placeholder="Please provide a reason for your deposit..."
                rows={3}
                className="resize-none bg-white"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleDepositRequest}
              disabled={isSubmitting || !depositAmount || parseFloat(depositAmount) < 1000}
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
                  Submit Deposit Request
                </>
              )}
            </Button>

            {/* Payment Instructions */}
            <div className="p-3 bg-white rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Payment Instructions for {getPaymentMethodLabel(paymentMethod)}
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
                {paymentMethod === "mobile_money" && (
                  <>
                    <p>• Use MTN Mobile Money or Airtel Money</p>
                    <p>• Send money to: +250 788 123 456</p>
                    <p>• Include your name as reference</p>
                  </>
                )}
                {paymentMethod === "bank_transfer" && (
                  <>
                    <p>• Bank: Bank of Kigali</p>
                    <p>• Account: 1234567890</p>
                    <p>• Reference: Your name</p>
                  </>
                )}
                {paymentMethod === "cash" && (
                  <>
                    <p>• Visit our office during business hours</p>
                    <p>• Bring valid ID for verification</p>
                    <p>• Receipt will be provided</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
