"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  DollarSign,
  Users,
  TrendingUp,
  Download,
  CheckCircle,
  Calendar,
  Filter,
  CreditCard,
  Package,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PayoutData {
  farmerId: string
  farmerName: string
  farmerCode: string
  volume: number
  fatPercent?: number
  snfPercent?: number
  unitPrice: number
  totalAmount: number
  deductions: number
  advances: number
  agentAdvance: number
  netPayout: number
  collectionId: string
  collectionDate: string
}

interface AgentCommission {
  agentId: string
  agentName: string
  totalCollected: number
  excellentPercent: number
  conditionalPercent: number
  rejectedPercent: number
  totalCommission: number
  paidCommission: number
  pendingCommission: number
}

export default function PaymentsDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("payouts")
  const [payouts, setPayouts] = useState<PayoutData[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [agentCommissions, setAgentCommissions] = useState<AgentCommission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")

  useEffect(() => {
    if (user) fetchData()
  }, [user?.mccId, selectedBatch, dateFilter])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const params = new URLSearchParams()
      if (user?.mccId) params.set("mccId", user.mccId)
      if (dateFilter) params.set("date", dateFilter)
      if (selectedBatch && selectedBatch !== "all") params.set("batchId", selectedBatch)

      // Fetch collections for payout calculation
      const collectionsUrl = `/api/v1/payments/collections${params.toString() ? `?${params}` : ""}`
      const collectionsRes = await fetch(collectionsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (collectionsRes.ok) {
        const data = await collectionsRes.json()
        setCollections(data.data || [])
        calculatePayouts(data.data || [])
      }

      // Fetch agent commissions
      const commissionsParams = new URLSearchParams()
      if (user?.mccId) commissionsParams.set("mccId", user.mccId)
      const commissionsUrl = `/api/v1/payments/agent-commissions${commissionsParams.toString() ? `?${commissionsParams}` : ""}`
      const commissionsRes = await fetch(commissionsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (commissionsRes.ok) {
        const data = await commissionsRes.json()
        setAgentCommissions(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching payment data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePayouts = (collectionsData: any[]) => {
    const payoutData: PayoutData[] = collectionsData.map((collection) => {
      const totalAmount = collection.totalAmount || 0
      const deductions = collection.totalDeductions || 0
      const advances = collection.advances || 0
      const agentAdvance = collection.agentAdvance || 0
      const netPayout = totalAmount - deductions - advances - agentAdvance

      return {
        farmerId: collection.farmerId,
        farmerName: collection.farmer?.name || "Unknown",
        farmerCode: collection.farmer?.farmerCode || "",
        volume: collection.quantity || 0,
        fatPercent: collection.qualityData?.fatPercent,
        snfPercent: collection.qualityData?.snfPercent,
        unitPrice: collection.pricePerUnit || 0,
        totalAmount,
        deductions,
        advances,
        agentAdvance,
        netPayout,
        collectionId: collection.id,
        collectionDate: collection.collectionDate,
      }
    })

    setPayouts(payoutData)
  }

  const handleApprovePayout = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/payments/approve-payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: selectedBatch !== "all" ? selectedBatch : undefined,
          date: dateFilter || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Payout approved successfully")
        fetchData()
      } else {
        toast.error(result.error || "Failed to approve payout")
      }
    } catch (error) {
      console.error("Error approving payout:", error)
      toast.error("Failed to approve payout")
    }
  }

  const handleExport = () => {
    // Export functionality
    toast.info("Export functionality coming soon")
  }

  const totalPayout = payouts.reduce((sum, p) => sum + p.netPayout, 0)
  const totalVolume = payouts.reduce((sum, p) => sum + p.volume, 0)

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need MCC Manager or Admin access to view the Payments Dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">HarvestPlus by GEMURA - Payments Dashboard</h1>
          <p className="text-gray-600 mt-1">Multi-Commodity Aggregation & Settlement Platform</p>
        </div>

        {/* Tabs */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 px-4 sm:px-6">
                <TabsList className="h-auto bg-transparent p-0 w-full justify-start gap-0.5 sm:gap-1 inline-flex">
                  <TabsTrigger 
                    value="collections"
                    className="group relative data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-4 sm:px-6 py-3.5 font-medium text-sm transition-all duration-200 data-[state=inactive]:text-gray-600"
                  >
                    Collections
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payouts"
                    className="group relative data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-4 sm:px-6 py-3.5 font-medium text-sm transition-all duration-200 data-[state=inactive]:text-gray-600"
                  >
                    Farmers Payouts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="commissions"
                    className="group relative data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-4 sm:px-6 py-3.5 font-medium text-sm transition-all duration-200 data-[state=inactive]:text-gray-600"
                  >
                    Agent Commissions
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Collections Tab */}
              <TabsContent value="collections" className="mt-0 p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Collections</h2>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-40"
                        placeholder="Filter by date"
                      />
                      <Button onClick={handleExport} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Collections Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-2 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{collections.length}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-emerald-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">
                          {collections.reduce((s, c) => s + (c.quantity || 0), 0).toLocaleString()} units
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-900">
                          RWF {collections.reduce((s, c) => s + (c.totalAmount || 0), 0).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Unique Farmers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-900">
                          {new Set(collections.map((c) => c.farmerId)).size}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Collections Table */}
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-blue-900">Collection Records</CardTitle>
                      <CardDescription>All collections for payout calculation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Farmer</TableHead>
                            <TableHead>Commodity</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Net Payout</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collections.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                  <Package className="h-12 w-12 text-gray-300" />
                                  <p className="text-gray-500 font-medium">No collections found</p>
                                  <p className="text-sm text-gray-400">
                                    Collections will appear here once recorded. Try adjusting filters or record new collections.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            collections.map((c) => {
                              const netPayout =
                                (c.totalAmount || 0) -
                                (c.totalDeductions || 0) -
                                (c.advances || 0) -
                                (c.agentAdvance || 0)
                              return (
                                <TableRow key={c.id}>
                                  <TableCell className="font-medium">
                                    {new Date(c.collectionDate).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    {c.farmer?.name || "—"}
                                    {c.farmer?.farmerCode && (
                                      <span className="text-xs text-gray-500 ml-1">({c.farmer.farmerCode})</span>
                                    )}
                                  </TableCell>
                                  <TableCell>{c.commodity?.name || "—"}</TableCell>
                                  <TableCell>{c.agent?.name || "—"}</TableCell>
                                  <TableCell>
                                    {c.quantity?.toLocaleString()} {c.unit || ""}
                                  </TableCell>
                                  <TableCell>RWF {(c.pricePerUnit || 0).toLocaleString()}</TableCell>
                                  <TableCell>RWF {(c.totalAmount || 0).toLocaleString()}</TableCell>
                                  <TableCell className="font-semibold">RWF {netPayout.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={c.status === "PAID" ? "default" : c.status === "APPROVED" ? "secondary" : "outline"}
                                      className={
                                        c.status === "PAID"
                                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                                          : c.status === "APPROVED"
                                          ? "bg-blue-500/10 text-blue-700 border-blue-200"
                                          : "bg-amber-500/10 text-amber-700 border-amber-200"
                                      }
                                    >
                                      {c.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Farmers Payouts Tab */}
              <TabsContent value="payouts" className="mt-0 p-6">
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex items-center gap-4">
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All batches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ALL</SelectItem>
                        <SelectItem value="batch1">KNC A - April 25, 2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-48"
                      placeholder="Filter by date"
                    />
                    <Button onClick={handleExport} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      EXPORT
                    </Button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-2 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{totalVolume.toLocaleString()} L</div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Payout</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-900">RWF {totalPayout.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Farmers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-900">{payouts.length}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payout Table */}
                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-blue-900">Farmers Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Farmers</TableHead>
                            <TableHead>Volume (L)</TableHead>
                            <TableHead>Fat %</TableHead>
                            <TableHead>SNF %</TableHead>
                            <TableHead>Payout</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payouts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                No payout data available
                              </TableCell>
                            </TableRow>
                          ) : (
                            payouts.map((payout) => (
                              <TableRow key={payout.collectionId}>
                                <TableCell className="font-medium">
                                  {payout.farmerName}
                                  {payout.farmerCode && (
                                    <span className="text-xs text-gray-500 ml-2">({payout.farmerCode})</span>
                                  )}
                                </TableCell>
                                <TableCell>{payout.volume.toLocaleString()}</TableCell>
                                <TableCell>{payout.fatPercent?.toFixed(1) || "-"}</TableCell>
                                <TableCell>{payout.snfPercent?.toFixed(1) || "-"}</TableCell>
                                <TableCell>RWF {payout.netPayout.toLocaleString()}</TableCell>
                                <TableCell className="font-bold">RWF {payout.totalAmount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Agent Commissions Tab */}
              <TabsContent value="commissions" className="mt-0 p-6">
                <div className="space-y-6">
                  {agentCommissions.length === 0 ? (
                    <Card className="border-2 border-blue-200">
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-2xl bg-blue-50 p-6 mb-4">
                          <Users className="h-12 w-12 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No agent commission data</h3>
                        <p className="mt-2 max-w-md text-sm text-gray-500">
                          Agent commissions are calculated from Milk &amp; Dairy collections where an agent (Abacunda) was assigned.
                          Record collections with an agent to see commission data here.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                  agentCommissions.map((commission) => (
                    <Card key={commission.agentId} className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-blue-900">
                          Agent Commission: {commission.agentName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Section */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Collected</p>
                              <p className="text-2xl font-bold text-blue-900">{(commission.totalCollected ?? 0).toLocaleString()} units</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                                <span className="text-sm text-gray-700">Excellent:</span>
                                <span className="font-bold text-green-700">{(commission.excellentPercent ?? 0).toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                <span className="text-sm text-gray-700">Conditional:</span>
                                <span className="font-bold text-yellow-700">{(commission.conditionalPercent ?? 0).toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                                <span className="text-sm text-gray-700">Rejected:</span>
                                <span className="font-bold text-red-700">{(commission.rejectedPercent ?? 0).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Section */}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Pending to Pay</p>
                              <p className="text-2xl font-bold text-green-900">RWF {(commission.pendingCommission ?? 0).toLocaleString()}</p>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Collected:</span>
                                <span className="font-medium">{(commission.totalCollected ?? 0).toLocaleString()} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Commission:</span>
                                <span className="font-bold text-blue-900">RWF {(commission.totalCommission ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Paid:</span>
                                <span className="font-medium text-green-700">RWF {(commission.paidCommission ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600">Pending:</span>
                                <span className="font-bold text-orange-700">RWF {(commission.pendingCommission ?? 0).toLocaleString()}</span>
                              </div>
                            </div>
                            <Button
                              onClick={handleApprovePayout}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              APPROVE PAYOUT
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
