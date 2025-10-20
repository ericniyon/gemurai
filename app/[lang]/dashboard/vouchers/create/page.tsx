"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  User, 
  DollarSign, 
  Calendar,
  Plus,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Users
} from "lucide-react"
import { toast } from "sonner"

interface DCC {
  id: string
  name: string
  email: string
}

interface VoucherTemplate {
  id: string
  name: string
  value: number
  description: string
}

export default function CreateVoucherPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // State declarations
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dccs, setDCCs] = useState<DCC[]>([])
  const [selectedDCC, setSelectedDCC] = useState("")
  const [voucherValue, setVoucherValue] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [expiryMonths, setExpiryMonths] = useState("1")

  const [customExpiry, setCustomExpiry] = useState("")
  const [useCustomExpiry, setUseCustomExpiry] = useState(false)
  const [dccSearchTerm, setDccSearchTerm] = useState("")

  // Predefined voucher templates
  const voucherTemplates: VoucherTemplate[] = [
    { id: "small", name: "Small Voucher", value: 5000, description: "RWF 5,000 - Basic voucher" },
    { id: "medium", name: "Medium Voucher", value: 10000, description: "RWF 10,000 - Standard voucher" },
    { id: "large", name: "Large Voucher", value: 25000, description: "RWF 25,000 - Premium voucher" },
    { id: "custom", name: "Custom Amount", value: 0, description: "Enter your own amount" }
  ]

  // Fetch DCCs when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchDCCs = async () => {
        try {
          setLoading(true)
          const token = localStorage.getItem("Gemurai_token")
          console.log("[CREATE_VOUCHER] Token available:", !!token)
          console.log("[CREATE_VOUCHER] User authenticated:", isAuthenticated)
          console.log("[CREATE_VOUCHER] User role:", user?.role)
          
          const res = await fetch("/api/v1/users/dccs", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          })
          const data = await res.json()
          console.log("[CREATE_VOUCHER] API response:", data)
          
          if (data.success) {
            setDCCs(data.data)
            console.log("[CREATE_VOUCHER] DCCs loaded:", data.data.length)
          } else {
            toast.error(data.message || "Failed to load DCCs")
          }
        } catch (e: any) {
          console.error("[CREATE_VOUCHER] Error:", e)
          toast.error("Failed to load DCCs")
        } finally {
          setLoading(false)
        }
      }

      fetchDCCs()
    }
  }, [isAuthenticated, user?.role])

  const handleTemplateSelect = (templateId: string) => {
    const template = voucherTemplates.find(t => t.id === templateId)
    if (template && templateId !== "custom") {
      setVoucherValue(template.value.toString())
    } else if (templateId === "custom") {
      setVoucherValue("")
    }
  }

  const handleCreateVouchers = async () => {
    if (!selectedDCC) {
      toast.error("Please select a DCC")
      return
    }
    if (!voucherValue || parseFloat(voucherValue) <= 0) {
      toast.error("Please enter a valid voucher value")
      return
    }
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    try {
      setCreating(true)
      const token = localStorage.getItem("Gemurai_token")
      
      const expiryDate = useCustomExpiry && customExpiry 
        ? new Date(customExpiry)
        : new Date(Date.now() + parseInt(expiryMonths) * 30 * 24 * 60 * 60 * 1000)

      const res = await fetch("/api/v1/vouchers/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dccId: selectedDCC,
          value: parseFloat(voucherValue),
          quantity: parseInt(quantity),
          expiresAt: expiryDate.toISOString(),
          description: `Voucher created by ${user?.name}`
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(`Successfully created ${quantity} voucher(s) for ${dccs.find(d => d.id === selectedDCC)?.name}`)
        // Reset form
        setSelectedDCC("")
        setVoucherValue("")
        setQuantity("1")
        setExpiryMonths("1")
        setCustomExpiry("")
        setUseCustomExpiry(false)
      } else {
        toast.error(data.message || "Failed to create vouchers")
      }
    } catch (e: any) {
      toast.error("Failed to create vouchers")
    } finally {
      setCreating(false)
    }
  }

  const totalValue = parseFloat(voucherValue || "0") * parseInt(quantity || "1")
  const selectedDCCData = dccs.find(d => d.id === selectedDCC)
  
  // Filter DCCs based on search term
  const filteredDCCs = dccs.filter(dcc => 
    dcc.name.toLowerCase().includes(dccSearchTerm.toLowerCase()) ||
    dcc.email.toLowerCase().includes(dccSearchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Create Vouchers
            </h1>
            <p className="text-gray-600 text-lg">
              Create new vouchers for DCCs with custom values and expiry dates
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* DCC Selection */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Select DCC
              </CardTitle>
              <CardDescription>
                Choose the DCC who will receive the vouchers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dcc-select">DCC</Label>
                <Select value={selectedDCC} onValueChange={setSelectedDCC}>
                  <SelectTrigger className="w-full !bg-white !border-gray-300 border-2 rounded-xl">
                    <SelectValue placeholder="Select a DCC" />
                  </SelectTrigger>
                  <SelectContent className="!bg-white border border-gray-300">
                    <div className="p-2">
                      <Input
                        placeholder="Search DCCs..."
                        value={dccSearchTerm}
                        onChange={(e) => setDccSearchTerm(e.target.value)}
                        className="!bg-white border border-gray-300 mb-2"
                      />
                    </div>
                    {filteredDCCs.map(dcc => (
                      <SelectItem key={dcc.id} value={dcc.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{dcc.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {filteredDCCs.length === 0 && (
                      <div className="p-2 text-center text-gray-500 text-sm">
                        No DCCs found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDCCData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">{selectedDCCData.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voucher Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Voucher Details
              </CardTitle>
              <CardDescription>
                Configure the voucher value, quantity, and expiry settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voucher Templates */}
              <div className="space-y-3">
                <Label>Quick Templates</Label>
                <div className="grid grid-cols-2 gap-3">
                  {voucherTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`h-auto p-4 flex flex-col items-start gap-2 ${
                        (template.id === "custom" && !voucherTemplates.some(t => t.value === parseFloat(voucherValue || "0"))) ||
                        (template.value === parseFloat(voucherValue || "0"))
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{template.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voucher-value">Voucher Value (RWF)</Label>
                  <Input
                    id="voucher-value"
                    type="number"
                    placeholder="Enter amount"
                    value={voucherValue}
                    onChange={(e) => setVoucherValue(e.target.value)}
                    className="!bg-white border border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="!bg-white border border-gray-300"
                  />
                </div>
              </div>

              {/* Expiry Settings */}
              <div className="space-y-4">
                <Label>Expiry Settings</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant={!useCustomExpiry ? "default" : "outline"}
                    onClick={() => setUseCustomExpiry(false)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Months from now
                  </Button>
                  <Button
                    variant={useCustomExpiry ? "default" : "outline"}
                    onClick={() => setUseCustomExpiry(true)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Custom date
                  </Button>
                </div>

                {!useCustomExpiry ? (
                  <Select value={expiryMonths} onValueChange={setExpiryMonths}>
                    <SelectTrigger className="w-full !bg-white !border-gray-300 border-2 rounded-xl">
                      <SelectValue placeholder="Select expiry period" />
                    </SelectTrigger>
                    <SelectContent className="!bg-white border border-gray-300">
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="2">2 months</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="4">4 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="date"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="!bg-white border border-gray-300"
                  />
                )}
              </div>


            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Voucher Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDCCData && (
                <div className="p-3 bg-white rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600">Recipient</p>
                  <p className="font-medium text-gray-900">{selectedDCCData.name}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Voucher Value:</span>
                  <span className="font-medium">RWF {parseFloat(voucherValue || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expiry:</span>
                  <span className="font-medium">
                    {useCustomExpiry && customExpiry 
                      ? new Date(customExpiry).toLocaleDateString()
                      : `${expiryMonths} month${parseInt(expiryMonths) > 1 ? 's' : ''} from now`
                    }
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Value:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      RWF {totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateVouchers}
                disabled={!selectedDCC || !voucherValue || creating}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Vouchers
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Vouchers are immediately available to the selected DCC</p>
              <p>• Expiry dates cannot be changed after creation</p>
              <p>• Multiple vouchers can be created at once</p>
              <p>• All vouchers will have the same value and expiry</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
