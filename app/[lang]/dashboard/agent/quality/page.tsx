"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Droplets,
  Thermometer,
  Beaker,
  Activity,
  Loader2,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface QualityTest {
  id: string
  farmerId: string
  farmerName: string
  farmerCode: string
  quantity: number
  collectionDate: string
  collectionTime: string
  status: "pending" | "pass" | "conditional" | "rejected"
  lactometerReading?: number
  fatContent?: number
  temperature?: number
  notes?: string
}

export default function AgentQualityPage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [tests, setTests] = useState<QualityTest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState<QualityTest | null>(null)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Quality test form state
  const [lactometerReading, setLactometerReading] = useState("")
  const [fatContent, setFatContent] = useState("")
  const [temperature, setTemperature] = useState("")

  useEffect(() => {
    // Simulate loading quality tests
    const loadTests = async () => {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 500))

      setTests([
        {
          id: "1",
          farmerId: "f1",
          farmerName: "John Uwimana",
          farmerCode: "NYA-001234",
          quantity: 50,
          collectionDate: new Date().toISOString().slice(0, 10),
          collectionTime: "08:30",
          status: "pending",
        },
        {
          id: "2",
          farmerId: "f2",
          farmerName: "Alice Mukamana",
          farmerCode: "NYA-001235",
          quantity: 110,
          collectionDate: new Date().toISOString().slice(0, 10),
          collectionTime: "08:15",
          status: "pass",
          lactometerReading: 30,
          fatContent: 3.9,
          temperature: 4.2,
        },
        {
          id: "3",
          farmerId: "f3",
          farmerName: "Peter Mugiransa",
          farmerCode: "NYA-001236",
          quantity: 70,
          collectionDate: new Date().toISOString().slice(0, 10),
          collectionTime: "07:45",
          status: "conditional",
          lactometerReading: 28,
          fatContent: 3.5,
          temperature: 6.5,
        },
        {
          id: "4",
          farmerId: "f4",
          farmerName: "Joyce Niyosenga",
          farmerCode: "NYA-001237",
          quantity: 40,
          collectionDate: new Date().toISOString().slice(0, 10),
          collectionTime: "07:30",
          status: "pending",
        },
      ])

      setLoading(false)
    }

    loadTests()
  }, [user])

  const pendingTests = tests.filter((t) => t.status === "pending")
  const completedTests = tests.filter((t) => t.status !== "pending")

  const passedCount = tests.filter((t) => t.status === "pass").length
  const conditionalCount = tests.filter((t) => t.status === "conditional").length
  const rejectedCount = tests.filter((t) => t.status === "rejected").length

  const openTestDialog = (test: QualityTest) => {
    setSelectedTest(test)
    setLactometerReading(test.lactometerReading?.toString() || "")
    setFatContent(test.fatContent?.toString() || "")
    setTemperature(test.temperature?.toString() || "")
    setIsTestDialogOpen(true)
  }

  const evaluateQuality = () => {
    const lactometer = parseFloat(lactometerReading)
    const fat = parseFloat(fatContent)
    const temp = parseFloat(temperature)

    // Simple quality rules
    if (lactometer >= 28 && lactometer <= 32 && fat >= 3.5 && temp <= 5) {
      return "pass"
    }
    if (lactometer < 26 || fat < 3.0 || temp > 10) {
      return "rejected"
    }
    return "conditional"
  }

  const handleSaveTest = (finalStatus?: "pass" | "conditional" | "rejected") => {
    if (!selectedTest) return

    const status = finalStatus || evaluateQuality()

    setTests((prev) =>
      prev.map((t) =>
        t.id === selectedTest.id
          ? {
              ...t,
              status,
              lactometerReading: parseFloat(lactometerReading) || undefined,
              fatContent: parseFloat(fatContent) || undefined,
              temperature: parseFloat(temperature) || undefined,
            }
          : t
      )
    )

    setIsTestDialogOpen(false)
    toast.success(
      status === "pass"
        ? "Quality test passed"
        : status === "conditional"
        ? "Marked as conditional"
        : "Collection rejected"
    )
  }

  const statusConfig = {
    pending: { color: "bg-amber-100 text-amber-700", icon: AlertCircle, label: "Pending" },
    pass: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Pass" },
    conditional: { color: "bg-blue-100 text-blue-700", icon: AlertCircle, label: "Conditional" },
    rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" },
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quality Check</h1>
        <p className="text-gray-500 text-sm mt-1">
          Test milk quality for collected samples
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingTests.length}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passedCount}</p>
            <p className="text-xs text-gray-500">Passed</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{conditionalCount}</p>
            <p className="text-xs text-gray-500">Conditional</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
            <p className="text-xs text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Tests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingTests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedTests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : pendingTests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">All quality tests completed!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  statusConfig={statusConfig}
                  onTest={() => openTestDialog(test)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedTests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No completed tests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  statusConfig={statusConfig}
                  onTest={() => openTestDialog(test)}
                  showResults
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quality Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                Quality Check
              </DialogTitle>
            <DialogDescription className="sr-only">Record lactometer and fat content for this sample.</DialogDescription>
          </DialogHeader>
          </div>

          {selectedTest && (
            <div className="px-6 py-6 bg-gradient-to-b from-slate-50/80 to-white space-y-4">
              {/* Farmer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedTest.farmerName}</p>
                    <p className="text-sm text-gray-500">
                      {selectedTest.farmerCode} • {selectedTest.quantity}L
                    </p>
                  </div>
                </div>
              </div>

              {/* Lactometer Reading */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-purple-500" />
                  Lactometer Reading
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 30"
                    value={lactometerReading}
                    onChange={(e) => setLactometerReading(e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant="outline">Normal: 28-32</Badge>
                </div>
              </div>

              {/* Fat Content */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Fat Content (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 3.8"
                    value={fatContent}
                    onChange={(e) => setFatContent(e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant="outline">Min: 3.5%</Badge>
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  Temperature (°C)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="flex-1"
                  />
                  <Badge variant="outline">Max: 5°C</Badge>
                </div>
              </div>

              {/* Auto-calculated result preview */}
              {lactometerReading && fatContent && temperature && (
                <div className={cn(
                  "rounded-xl p-4 border",
                  evaluateQuality() === "pass" && "bg-green-50 border-green-200",
                  evaluateQuality() === "conditional" && "bg-blue-50 border-blue-200",
                  evaluateQuality() === "rejected" && "bg-red-50 border-red-200"
                )}>
                  <p className="text-sm font-medium">
                    Calculated Result:{" "}
                    <span className={cn(
                      "uppercase font-bold",
                      evaluateQuality() === "pass" && "text-green-700",
                      evaluateQuality() === "conditional" && "text-blue-700",
                      evaluateQuality() === "rejected" && "text-red-700"
                    )}>
                      {evaluateQuality()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-row flex-wrap gap-2 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)} className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100">
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => handleSaveTest("rejected")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                variant="outline"
                className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => handleSaveTest("conditional")}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Conditional
              </Button>
              <Button
                className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleSaveTest("pass")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Pass
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TestCard({
  test,
  statusConfig,
  onTest,
  showResults,
}: {
  test: QualityTest
  statusConfig: Record<string, { color: string; icon: any; label: string }>
  onTest: () => void
  showResults?: boolean
}) {
  const config = statusConfig[test.status]
  const StatusIcon = config.icon

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-blue-600">
              {test.farmerName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{test.farmerName}</p>
            <p className="text-sm text-gray-500">{test.farmerCode}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">{test.quantity}L</p>
            <p className="text-xs text-gray-500">{test.collectionTime}</p>
          </div>
          <Badge className={cn("gap-1", config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          <Button size="sm" onClick={onTest}>
            {test.status === "pending" ? "Test" : "View"}
          </Button>
        </div>

        {showResults && test.status !== "pending" && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-gray-500">Lactometer</p>
              <p className="font-semibold">{test.lactometerReading || "-"}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Fat %</p>
              <p className="font-semibold">{test.fatContent || "-"}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Temp</p>
              <p className="font-semibold">{test.temperature || "-"}°C</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
