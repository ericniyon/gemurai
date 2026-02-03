"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn, formatCurrency } from "@/lib/utils"
import {
  CreditCard,
  Search,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  Plus,
  Building2,
  Phone,
  MapPin,
  ClipboardList,
  Pill,
  Package,
  Calculator,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Farmer {
  id: string
  name: string
  phone: string
  farmerCode: string | null
}

interface PaymentSummary {
  farmer: Farmer
  account: {
    balance: number
  }
  deductions: {
    medicine: {
      total: number
      count: number
      details: Array<{
        saleId: string
        invoiceNo: string | null
        totalAmount: number
        saleAt: string
        items: Array<{
          productName: string
          quantity: number
          unitPrice: number
        }>
      }>
    }
    assets: {
      total: number
      count: number
      details: Array<{
        rentalId: string
        assetName: string
        assetType: string | null
        daysRented: number
        feePerDay: number
        totalFee: number
        rentStart: string
      }>
    }
    total: number
  }
  payment: {
    netAmount: number
  }
}

interface PaymentRecord {
  id: string
  farmerId: string
  amount: number
  method: string | null
  reference: string | null
  paidAt: string
  farmer: Farmer
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [selectedFarmer, setSelectedFarmer] = useState<string>("")
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    reference: "",
    notes: "",
  })

  // Pre-fill amount with net payment when opening dialog
  useEffect(() => {
    if (paymentDialogOpen && paymentSummary && paymentSummary.payment.netAmount > 0) {
      setPaymentForm((prev) => ({
        ...prev,
        amount: String(paymentSummary.payment.netAmount),
      }))
    } else if (paymentDialogOpen) {
      setPaymentForm((prev) => ({ ...prev, amount: "" }))
    }
  }, [paymentDialogOpen, paymentSummary])

  // Fetch farmers
  const fetchFarmers = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/farmers", window.location.origin)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Ensure farmers array has the correct structure
        const farmersList = (data.data || []).map((farmer: any) => ({
          id: farmer.id,
          name: farmer.name || "Unknown",
          phone: farmer.phone || "",
          farmerCode: farmer.farmerCode || null,
        }))
        setFarmers(farmersList)
      } else {
        const error = await response.json().catch(() => ({ error: "Failed to fetch farmers" }))
        toast.error(error.error || "Failed to fetch farmers")
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
      toast.error("Error fetching farmers")
    }
  }

  // Fetch payment summary for selected farmer
  const fetchPaymentSummary = async (farmerId: string) => {
    try {
      setSummaryLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/payments/generic", window.location.origin)
      url.searchParams.set("farmerId", farmerId)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentSummary(data.data)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to fetch payment summary")
      }
    } catch (error) {
      console.error("Error fetching payment summary:", error)
      toast.error("Error fetching payment summary")
    } finally {
      setSummaryLoading(false)
    }
  }

  // Fetch payment history
  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const url = new URL("/api/v1/mcc/payments/generic", window.location.origin)
      if (user?.mccId) {
        url.searchParams.set("mccId", user.mccId)
      }
      // Don't set farmerId here - we want all payments

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Use payments directly from generic payments table
        setPayments(data.data || [])
      } else {
        toast.error("Failed to fetch payments")
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Error fetching payments")
    } finally {
      setLoading(false)
    }
  }

  // Process payment
  const handleProcessPayment = async () => {
    if (!selectedFarmer) {
      toast.error("Please select a farmer")
      return
    }

    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid payment amount")
      return
    }

    try {
      setProcessing(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch("/api/v1/mcc/payments/generic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerId: selectedFarmer,
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          reference: paymentForm.reference || null,
          notes: paymentForm.notes || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || "Payment processed successfully")
        setPaymentDialogOpen(false)
        setPaymentForm({
          amount: "",
          method: "cash",
          reference: "",
          notes: "",
        })
        // Refresh data
        await fetchPaymentSummary(selectedFarmer)
        await fetchPayments()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to process payment")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      toast.error("Error processing payment")
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchFarmers()
      fetchPayments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (selectedFarmer) {
      fetchPaymentSummary(selectedFarmer)
    } else {
      setPaymentSummary(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFarmer])

  const filteredFarmers = farmers.filter((farmer) =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.phone.includes(searchQuery) ||
    (farmer.farmerCode && farmer.farmerCode.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading && payments.length === 0 && farmers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-sm sm:text-base font-semibold text-gray-700">Loading Payments...</h2>
        </div>
      </div>
    )
  }

  const pageTitle = "Payments"
  const pageSubtitle = "Process farmer payments and deduct all outstanding deductions"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full px-0 py-10">
          <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  MCC Manager • Payments
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{pageTitle}</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{pageSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchFarmers()
                    fetchPayments()
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </header>
        
        <div className="w-full px-2 sm:px-3 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Farmers</CardTitle>
                <div className="rounded-full bg-blue-100 p-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-gray-900">{farmers.length}</div>
                <p className="text-xs text-gray-500 mt-1">Registered farmers</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-2xl border border-green-100 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50/50 to-emerald-50/30">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Payments</CardTitle>
                <div className="rounded-full bg-green-100 p-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-gray-900">{payments.length}</div>
                <p className="text-xs text-gray-500 mt-1">Payment transactions</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-2xl border border-purple-100 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50/50 to-pink-50/30">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Amount</CardTitle>
                <div className="rounded-full bg-purple-100 p-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(
                    payments.reduce((sum, p) => sum + p.amount, 0)
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total processed</p>
              </CardContent>
            </Card>
          </div>

          {/* Farmer Selection and Payment Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Farmer Selection */}
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Select Farmer</CardTitle>
                <CardDescription className="text-sm text-gray-600">Choose a farmer to view payment summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Search Farmers</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select Farmer</Label>
              <Select
                value={selectedFarmer}
                onValueChange={setSelectedFarmer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a farmer" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFarmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name} ({farmer.farmerCode || farmer.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
                {selectedFarmer && (
                  <Button
                    onClick={() => setPaymentDialogOpen(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-white to-green-50/50 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Payment Summary</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {selectedFarmer
                    ? "Outstanding deductions and account balance"
                    : "Select a farmer to view summary"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
            {summaryLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : paymentSummary ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Balance</span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(paymentSummary.account.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medicine Deductions</span>
                    <Badge variant="destructive">
                      {formatCurrency(paymentSummary.deductions.medicine.total)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Asset Rental Deductions</span>
                    <Badge variant="destructive">
                      {formatCurrency(paymentSummary.deductions.assets.total)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Total Deductions</span>
                    <Badge variant="destructive" className="text-base">
                      {formatCurrency(paymentSummary.deductions.total)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Net Payment</span>
                    <Badge
                      variant={paymentSummary.payment.netAmount >= 0 ? "default" : "destructive"}
                      className="text-base"
                    >
                      {formatCurrency(paymentSummary.payment.netAmount)}
                    </Badge>
                  </div>
                </div>

                {/* Deduction Details */}
                {paymentSummary.deductions.medicine.count > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Medicine Purchases ({paymentSummary.deductions.medicine.count})
                    </h4>
                    <div className="space-y-1 text-xs">
                      {paymentSummary.deductions.medicine.details.map((sale) => (
                        <div
                          key={sale.saleId}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span>
                            {sale.invoiceNo || "N/A"} - {formatCurrency(sale.totalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paymentSummary.deductions.assets.count > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Asset Rentals ({paymentSummary.deductions.assets.count})
                    </h4>
                    <div className="space-y-1 text-xs">
                      {paymentSummary.deductions.assets.details.map((rental) => (
                        <div
                          key={rental.rentalId}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span>
                            {rental.assetName} ({rental.daysRented} days) -{" "}
                            {formatCurrency(rental.totalFee)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No farmer selected
              </div>
            )}
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-white to-purple-50/50 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">Payment History</CardTitle>
              <CardDescription className="text-sm text-gray-600">Recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-200 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Farmer</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Method</TableHead>
                    <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                      <TableCell className="text-sm text-gray-600">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900">{payment.farmer.name}</div>
                          <div className="text-xs text-gray-500">
                            {payment.farmer.farmerCode || payment.farmer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">
                          {payment.method?.toUpperCase() || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.reference || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border border-gray-200 bg-white shadow-2xl">
              <DialogHeader className="space-y-1 pb-4 border-b border-gray-100">
                <DialogTitle className="text-xl font-semibold text-gray-900">Process Payment</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Process payment for {paymentSummary?.farmer.name || "selected farmer"}. All
                  deductions will be automatically applied.
                </DialogDescription>
              </DialogHeader>
          <div className="space-y-4 py-4">
              {paymentSummary && (
                <div className="space-y-2 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Account Balance:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(paymentSummary.account.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Deductions:</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(paymentSummary.deductions.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-blue-200 pt-2">
                    <span className="font-medium text-gray-700">Net Amount:</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(paymentSummary.payment.netAmount)}
                    </span>
                  </div>
                </div>
              )}
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter payment amount"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) =>
                  setPaymentForm({ ...paymentForm, method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Payment reference number"
                value={paymentForm.reference}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, reference: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional notes"
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, notes: e.target.value })
                }
              />
            </div>
          </div>
              <DialogFooter className="pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(false)}
                  disabled={processing}
                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessPayment} 
                  disabled={processing}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Process Payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

