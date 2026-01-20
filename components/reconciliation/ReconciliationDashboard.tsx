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
import { toast } from "sonner"
import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"
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
      const response = await fetch("/api/v1/mcc/reconciliation/run", {
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
        toast.error(result.error || "Failed to run reconciliation")
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run Reconciliation</CardTitle>
          <CardDescription>
            Automatically reconcile collections, payments, and inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={reconciliationType}
              onValueChange={(value: "COLLECTION" | "INVENTORY") =>
                setReconciliationType(value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COLLECTION">Collection vs Payment</SelectItem>
                <SelectItem value="INVENTORY">Inventory Reconciliation</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={runReconciliation} disabled={isRunning}>
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

          {lastResult && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Last Reconciliation Result</span>
                <Badge
                  variant={lastResult.result.discrepancy === 0 ? "default" : "destructive"}
                >
                  {lastResult.result.discrepancy === 0 ? "Balanced" : "Discrepancy"}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Expected:</span>{" "}
                  <span className="font-medium">{lastResult.result.totalExpected.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Actual:</span>{" "}
                  <span className="font-medium">{lastResult.result.totalActual.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Discrepancy:</span>{" "}
                  <span className="font-medium">{lastResult.result.discrepancy.toFixed(2)}</span>
                </div>
              </div>
              {lastResult.result.discrepancies.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-600">
                    {lastResult.result.discrepancies.length} discrepancies found
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No reconciliation records found
              </p>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{record.type} Reconciliation</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.reconciliationDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          record.status === "RESOLVED"
                            ? "default"
                            : record.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                      {record.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveReconciliation(record.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Expected:</span>{" "}
                      <span className="font-medium">{record.totalExpected.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Actual:</span>{" "}
                      <span className="font-medium">{record.totalActual.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Discrepancy:</span>{" "}
                      <span
                        className={`font-medium ${
                          record.discrepancy === 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {record.discrepancy.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
