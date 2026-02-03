"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"
import { RefreshCw, CheckCircle, AlertTriangle, Package, Activity } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function ReconciliationDashboard() {
  const { user } = useAuth()
  const [reconciliationType, setReconciliationType] = useState<"COLLECTION" | "INVENTORY">("COLLECTION")
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    if (user?.mccId) {
      fetchRecords()
    }
  }, [user?.mccId])

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(
        `/api/v1/mcc/reconciliation?mccId=${user?.mccId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setRecords(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching reconciliation records:", error)
    }
  }

  const runReconciliation = async () => {
    if (!user?.mccId) {
      toast.error("MCC ID not found")
      return
    }

    setIsRunning(true)

    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/reconciliation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: user.mccId,
          type: reconciliationType,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setLastResult(result.data)
        toast.success("Reconciliation completed successfully")
        fetchRecords()
      } else {
        const msg = result.details || result.error || "Failed to run reconciliation"
        toast.error(msg)
        console.error("Reconciliation error:", result)
      }
    } catch (error) {
      console.error("Error running reconciliation:", error)
      toast.error("Failed to run reconciliation")
    } finally {
      setIsRunning(false)
    }
  }

  const resolveReconciliation = async (recordId: string) => {
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch(`/api/v1/mcc/reconciliation/${recordId}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        toast.success("Reconciliation resolved")
        fetchRecords()
      }
    } catch (error) {
      console.error("Error resolving reconciliation:", error)
      toast.error("Failed to resolve reconciliation")
    }
  }

  const stats = {
    total: records.length,
    resolved: records.filter((r) => r.status === "RESOLVED").length,
    pending: records.filter((r) => r.status === "PENDING").length,
    withDiscrepancy: records.filter((r) => r.discrepancy !== 0).length,
  }

  const cardConfig: Record<string, { border: string; gradient: string; iconBg: string; labelColor: string; iconColor: string }> = {
    primary: { border: "border-blue-100", gradient: "from-blue-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-blue-50", labelColor: "text-blue-600", iconColor: "text-blue-500" },
    emerald: { border: "border-emerald-100", gradient: "from-emerald-100/50 via-teal-100/30 to-transparent", iconBg: "bg-emerald-50", labelColor: "text-emerald-600", iconColor: "text-emerald-500" },
    amber: { border: "border-amber-100", gradient: "from-amber-100/50 via-orange-100/30 to-transparent", iconBg: "bg-amber-50", labelColor: "text-amber-600", iconColor: "text-amber-500" },
    purple: { border: "border-purple-100", gradient: "from-purple-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-purple-50", labelColor: "text-purple-600", iconColor: "text-purple-500" },
  }

  const statCards = [
    { label: "Total Runs", value: stats.total, config: "primary", icon: RefreshCw },
    { label: "Resolved", value: stats.resolved, config: "emerald", icon: CheckCircle },
    { label: "Pending", value: stats.pending, config: "amber", icon: AlertTriangle },
    { label: "With Discrepancy", value: stats.withDiscrepancy, config: "purple", icon: Activity },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, config, icon: Icon }) => {
          const cfg = cardConfig[config] || cardConfig.primary
          return (
            <Card
              key={label}
              className={`relative overflow-hidden rounded-3xl border ${cfg.border} bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className={`absolute right-0 top-0 h-full w-24 bg-gradient-to-b ${cfg.gradient}`} />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={`text-sm font-semibold uppercase tracking-wide ${cfg.labelColor}`}>
                      {label}
                    </CardTitle>
                    <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
                  </div>
                  <div className={`rounded-2xl ${cfg.iconBg} p-3`}>
                    <Icon className={`h-6 w-6 ${cfg.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      {/* Run Reconciliation */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/40">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <div className="rounded-xl bg-primary/10 p-2">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            Run Reconciliation
          </CardTitle>
          <CardDescription className="text-slate-600">
            Automatically reconcile collections, payments, and inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              value={reconciliationType}
              onValueChange={(value: "COLLECTION" | "INVENTORY") =>
                setReconciliationType(value)
              }
            >
              <SelectTrigger className="w-[220px] h-11 rounded-xl border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COLLECTION">Collection vs Payment</SelectItem>
                <SelectItem value="INVENTORY">Inventory Reconciliation</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={runReconciliation}
              disabled={isRunning}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Reconciliation
                </>
              )}
            </Button>
          </div>

          {lastResult && lastResult.result && (
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Last Reconciliation Result</span>
                <Badge
                  variant={lastResult.result.discrepancy === 0 ? "default" : "destructive"}
                  className={
                    lastResult.result.discrepancy === 0
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                      : "bg-red-500/10 text-red-700 border-red-200"
                  }
                >
                  {lastResult.result.discrepancy === 0 ? "Balanced" : "Discrepancy"}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Expected:</span>{" "}
                  <span className="font-semibold text-slate-900">{(lastResult.result.totalExpected ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-600">Actual:</span>{" "}
                  <span className="font-semibold text-slate-900">{(lastResult.result.totalActual ?? 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-600">Discrepancy:</span>{" "}
                  <span className={`font-semibold ${lastResult.result.discrepancy === 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {(lastResult.result.discrepancy ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
              {lastResult.result.discrepancies?.length > 0 && (
                <p className="text-sm font-medium text-red-600">
                  {lastResult.result.discrepancies.length} discrepancies found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reconciliation History */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Reconciliation History</CardTitle>
          <CardDescription className="text-slate-600">Past reconciliation runs and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-6 mb-4">
                <Package className="h-12 w-12 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">No reconciliation records yet</p>
              <p className="mt-1 text-sm text-slate-500">Run a reconciliation to see history here</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200/80 bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Expected</TableHead>
                    <TableHead className="font-semibold text-slate-700">Actual</TableHead>
                    <TableHead className="font-semibold text-slate-700">Discrepancy</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="border-slate-200/60 hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">{record.type}</TableCell>
                      <TableCell className="text-slate-700">
                        {new Date(record.reconciliationDate).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{(record.totalExpected ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="font-medium">{(record.totalActual ?? 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            record.discrepancy === 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {(record.discrepancy ?? 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            record.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                              : record.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-700 border-amber-200"
                              : "bg-red-500/10 text-red-700 border-red-200"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveReconciliation(record.id)}
                            className="rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
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
  )
}
