"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Wallet,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronRight,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommissionPeriod {
  id: string
  period: string
  month: string
  year: number
  totalLiters: number
  totalFarmers: number
  successfulRate: number
  conditionalRate: number
  rejectedRate: number
  grossCommission: number
  deductions: number
  netCommission: number
  status: "pending" | "approved" | "paid"
  paymentDate?: string
}

interface FarmerPayout {
  id: string
  farmerName: string
  farmerCode: string
  liters: number
  fatPercent: number
  snfPercent: number
  payout: number
  total: number
}

export default function AgentCommissionsPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [selectedPeriod, setSelectedPeriod] = useState<string>("current")
  const [loading, setLoading] = useState(true)
  const [currentCommission, setCurrentCommission] = useState<CommissionPeriod | null>(null)
  const [commissionHistory, setCommissionHistory] = useState<CommissionPeriod[]>([])
  const [farmerPayouts, setFarmerPayouts] = useState<FarmerPayout[]>([])

  useEffect(() => {
    // Simulate loading commission data
    const loadData = async () => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 500))

      // Current period commission
      setCurrentCommission({
        id: "current",
        period: "1st - 15th",
        month: "April",
        year: 2024,
        totalLiters: 420,
        totalFarmers: 12,
        successfulRate: 57,
        conditionalRate: 6.3,
        rejectedRate: 1.5,
        grossCommission: 29400,
        deductions: 0,
        netCommission: 29400,
        status: "pending",
      })

      // Commission history
      setCommissionHistory([
        {
          id: "prev1",
          period: "16th - 31st",
          month: "March",
          year: 2024,
          totalLiters: 580,
          totalFarmers: 15,
          successfulRate: 62,
          conditionalRate: 5.5,
          rejectedRate: 1.2,
          grossCommission: 38200,
          deductions: 2000,
          netCommission: 36200,
          status: "paid",
          paymentDate: "2024-04-02",
        },
        {
          id: "prev2",
          period: "1st - 15th",
          month: "March",
          year: 2024,
          totalLiters: 510,
          totalFarmers: 14,
          successfulRate: 58,
          conditionalRate: 6.0,
          rejectedRate: 1.8,
          grossCommission: 34500,
          deductions: 1500,
          netCommission: 33000,
          status: "paid",
          paymentDate: "2024-03-18",
        },
      ])

      // Farmer payouts for current period
      setFarmerPayouts([
        { id: "1", farmerName: "John Uwimana", farmerCode: "NYA-001234", liters: 200, fatPercent: 8.5, snfPercent: 8.5, payout: 300, total: 550 },
        { id: "2", farmerName: "Alice Mukamana", farmerCode: "NYA-001235", liters: 110, fatPercent: 8.8, snfPercent: 8.5, payout: 350, total: 460 },
        { id: "3", farmerName: "Peter Mugiransa", farmerCode: "NYA-001236", liters: 70, fatPercent: 6.5, snfPercent: 6.2, payout: 560, total: 560 },
        { id: "4", farmerName: "Joyce Niyosenga", farmerCode: "NYA-001237", liters: 40, fatPercent: 6.2, snfPercent: 6.2, payout: 400, total: 230 },
      ])

      setLoading(false)
    }

    loadData()
  }, [user])

  const statusConfig = {
    pending: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending Approval" },
    approved: { color: "bg-blue-100 text-blue-700", icon: CheckCircle, label: "Approved" },
    paid: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Paid" },
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Commissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your earnings and farmer payouts
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="commissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commissions" className="gap-2">
            <Wallet className="h-4 w-4" />
            Agent Commissions
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Farmers Payouts
          </TabsTrigger>
        </TabsList>

        {/* Agent Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="prev1">March 16-31, 2024</SelectItem>
                <SelectItem value="prev2">March 1-15, 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Commission Card */}
          {currentCommission && (
            <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] text-white border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-blue-200 text-sm">
                      {currentCommission.month} {currentCommission.year} • {currentCommission.period}
                    </p>
                    <p className="text-xs text-blue-300 mt-1">Kamana Mark</p>
                  </div>
                  <Badge className={cn(statusConfig[currentCommission.status].color, "text-xs")}>
                    {statusConfig[currentCommission.status].label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-blue-200 text-sm">Progress to Paid</p>
                    <p className="text-3xl font-bold mt-1">
                      Ksh {currentCommission.netCommission.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-blue-200">
                      <span>Total Collected: {currentCommission.totalLiters} Liters</span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-blue-200 text-xs">Resc ProPoste Rete</p>
                      <p className="text-lg font-semibold">{currentCommission.totalLiters}L</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-xs">635L</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                  <p className="text-sm">Total Commission to De Paid</p>
                  <p className="text-xl font-bold">
                    Ksh {currentCommission.netCommission.toLocaleString()}
                  </p>
                </div>

                <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">
                  APPROVE PAYOUT
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quality Summary */}
          {currentCommission && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Collection Quality Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{currentCommission.successfulRate}%</p>
                    <p className="text-xs text-gray-500">Successful</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{currentCommission.conditionalRate}%</p>
                    <p className="text-xs text-gray-500">Conditional</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{currentCommission.rejectedRate}%</p>
                    <p className="text-xs text-gray-500">Rejected</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Total collected{" "}
                  <span className="font-semibold text-gray-900">{currentCommission.totalLiters} Liters</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Commission History */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissionHistory.map((commission) => {
                  const config = statusConfig[commission.status]
                  const StatusIcon = config.icon
                  return (
                    <div
                      key={commission.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {commission.month} {commission.period}
                        </p>
                        <p className="text-sm text-gray-500">
                          {commission.totalLiters}L • {commission.totalFarmers} farmers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          RWF {commission.netCommission.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{commission.paymentDate}</p>
                      </div>
                      <Badge className={cn("gap-1", config.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farmers Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-4">
                <p className="text-blue-100 text-xs">Total Collection</p>
                <p className="text-2xl font-bold mt-1">930 Liters</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-4">
                <p className="text-emerald-100 text-xs">Total Payout</p>
                <p className="text-2xl font-bold mt-1">RWF 376,913</p>
              </CardContent>
            </Card>
          </div>

          {/* Farmers Table */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Farmer Payouts</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farmers</TableHead>
                      <TableHead className="text-right">Juress</TableHead>
                      <TableHead className="text-right">Fat %</TableHead>
                      <TableHead className="text-right">SNF %</TableHead>
                      <TableHead className="text-right">Payout</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmerPayouts.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{farmer.farmerName}</p>
                            <p className="text-xs text-gray-500">{farmer.farmerCode}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{farmer.liters}L</TableCell>
                        <TableCell className="text-right">{farmer.fatPercent}%</TableCell>
                        <TableCell className="text-right">{farmer.snfPercent}%</TableCell>
                        <TableCell className="text-right">{farmer.payout} Liters</TableCell>
                        <TableCell className="text-right font-semibold">{farmer.total} Liters</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500 text-center">
                  Review farmer commissions and approve for payment
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
