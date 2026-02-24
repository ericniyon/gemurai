"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  Plus,
  Trash2,
  Search,
  User,
  Droplets,
  CheckCircle,
  Loader2,
  Send,
  Package,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Farmer {
  id: string
  name: string
  farmerCode: string
  phone?: string
}

interface CollectionEntry {
  id: string
  farmerId: string
  farmerName: string
  farmerCode: string
  quantity: number
  status: "pending" | "added"
}

export default function AgentIntakePage() {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"

  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loadingFarmers, setLoadingFarmers] = useState(true)
  const [collections, setCollections] = useState<CollectionEntry[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  // Add entry form state
  const [selectedFarmerId, setSelectedFarmerId] = useState("")
  const [farmerCodeInput, setFarmerCodeInput] = useState("")
  const [quantityInput, setQuantityInput] = useState("")
  const [lookingUp, setLookingUp] = useState(false)

  // Fetch farmers
  useEffect(() => {
    const fetchFarmers = async () => {
      const token = localStorage.getItem("Gemurai_token")
      if (!token) return

      try {
        const response = await fetch("/api/v1/mcc/farmers", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setFarmers(data.data.map((f: any) => ({
            id: f.id,
            name: f.name,
            farmerCode: f.farmerCode || f.farmer_code || "",
            phone: f.phone,
          })))
        }
      } catch (error) {
        console.error("Error fetching farmers:", error)
      } finally {
        setLoadingFarmers(false)
      }
    }

    fetchFarmers()
  }, [])

  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId)

  const lookupFarmerByCode = useCallback(() => {
    const trimmed = farmerCodeInput.trim()
    if (!trimmed) {
      toast.error("Enter a farmer code")
      return
    }

    setLookingUp(true)
    const match = farmers.find(
      (f) => (f.farmerCode || "").toLowerCase() === trimmed.toLowerCase()
    )

    setTimeout(() => {
      setLookingUp(false)
      if (match) {
        setSelectedFarmerId(match.id)
        toast.success(`Found: ${match.name}`)
      } else {
        toast.error(`No farmer found with code "${trimmed}"`)
        setSelectedFarmerId("")
      }
    }, 300)
  }, [farmerCodeInput, farmers])

  const handleAddEntry = () => {
    if (!selectedFarmerId) {
      toast.error("Please select a farmer")
      return
    }

    const quantity = parseFloat(quantityInput)
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Enter a valid quantity")
      return
    }

    // Check if farmer already in list
    if (collections.some((c) => c.farmerId === selectedFarmerId)) {
      toast.error("This farmer is already in the list")
      return
    }

    const farmer = farmers.find((f) => f.id === selectedFarmerId)
    if (!farmer) return

    setCollections((prev) => [
      ...prev,
      {
        id: `entry-${Date.now()}`,
        farmerId: farmer.id,
        farmerName: farmer.name,
        farmerCode: farmer.farmerCode,
        quantity,
        status: "added",
      },
    ])

    // Reset form
    setSelectedFarmerId("")
    setFarmerCodeInput("")
    setQuantityInput("")
    setIsAddDialogOpen(false)
    toast.success(`Added ${quantity}L from ${farmer.name}`)
  }

  const removeEntry = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity } : c))
    )
  }

  const totalLiters = collections.reduce((sum, c) => sum + c.quantity, 0)

  const handleSubmitBatch = async () => {
    if (collections.length === 0) {
      toast.error("Add at least one collection")
      return
    }

    setIsSubmitting(true)
    const token = localStorage.getItem("Gemurai_token")

    try {
      // Submit each collection
      for (const collection of collections) {
        await fetch("/api/v1/mcc/collections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            farmerId: collection.farmerId,
            agentId: user?.id,
            quantity: collection.quantity,
            collectionDate: new Date().toISOString().slice(0, 10),
            status: "pending",
          }),
        })
      }

      toast.success(`Submitted ${collections.length} collections (${totalLiters}L) to MCC`)
      setCollections([])
      setShowReviewDialog(false)
    } catch (error) {
      toast.error("Failed to submit collections")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Intake</h1>
          <p className="text-gray-500 text-sm mt-1">
            Collect milk from multiple farmers
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Collection
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Collected</p>
              <p className="text-4xl font-bold mt-1">{totalLiters}L</p>
              <p className="text-blue-200 text-sm mt-2">
                {collections.length} farmer{collections.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <Droplets className="h-10 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Collection Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No collections added yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map((collection, index) => (
                <div
                  key={collection.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{collection.farmerName}</p>
                    <p className="text-xs text-gray-500">{collection.farmerCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={collection.quantity}
                      onChange={(e) => updateQuantity(collection.id, parseFloat(e.target.value) || 0)}
                      className="w-20 h-9 text-center"
                    />
                    <span className="text-gray-500">L</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Added
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(collection.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      {collections.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 px-4 lg:px-0 lg:static">
          <Button
            onClick={() => setShowReviewDialog(true)}
            className="w-full lg:w-auto h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            Submit to MCC ({totalLiters}L)
          </Button>
        </div>
      )}

      {/* Add Collection Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <Plus className="h-5 w-5" />
                </div>
                Add Collection
              </DialogTitle>
            <DialogDescription className="sr-only">Enter farmer code or search by name and add milk quantity.</DialogDescription>
          </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-6 bg-gradient-to-b from-slate-50/80 to-white">
            {/* Farmer Code Lookup */}
            <div className="space-y-2">
              <Label>Farmer Code</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. NYA-001234"
                  value={farmerCodeInput}
                  onChange={(e) => setFarmerCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lookupFarmerByCode()}
                />
                <Button
                  variant="outline"
                  onClick={lookupFarmerByCode}
                  disabled={lookingUp}
                >
                  {lookingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Or Search by Name */}
            <div className="space-y-2">
              <Label className="text-gray-500 text-sm">Or search by name:</Label>
              <SearchableSelect
                value={selectedFarmerId}
                onValueChange={(v) => {
                  setSelectedFarmerId(v)
                  const f = farmers.find((x) => x.id === v)
                  if (f) setFarmerCodeInput(f.farmerCode)
                }}
                options={farmers.map((f) => ({
                  value: f.id,
                  label: `${f.name} (${f.farmerCode || "N/A"})`,
                }))}
                placeholder={loadingFarmers ? "Loading..." : "Search farmer..."}
                disabled={loadingFarmers}
              />
            </div>

            {/* Selected Farmer Display */}
            {selectedFarmer && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{selectedFarmer.name}</p>
                    <p className="text-sm text-emerald-700">Code: {selectedFarmer.farmerCode}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label>Quantity (Liters)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="text-lg h-12"
                />
                <span className="text-gray-500 text-lg">L</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 font-medium">
              Cancel
            </Button>
            <Button onClick={handleAddEntry} disabled={!selectedFarmerId || !quantityInput} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review & Submit Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9">
          <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 pt-6 pb-6 text-white">
            <DialogHeader className="relative">
              <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-white tracking-tight">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white border border-white/20 shadow-lg">
                  <Send className="h-5 w-5" />
                </div>
                Review & Submit
              </DialogTitle>
            <DialogDescription className="sr-only">Review collection summary and submit batch to MCC.</DialogDescription>
          </DialogHeader>
          </div>

          <div className="px-6 py-6 bg-gradient-to-b from-slate-50/80 to-white">
            {/* Summary */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{totalLiters}L</p>
                  <p className="text-sm text-blue-700">Total Liters</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{collections.length}</p>
                  <p className="text-sm text-blue-700">Farmers</p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {collections.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{c.farmerName}</p>
                    <p className="text-xs text-gray-500">{c.farmerCode}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{c.quantity}L</p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 px-6 py-5 border-t border-slate-200 bg-white rounded-b-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)} disabled={isSubmitting} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 font-medium">
              Back
            </Button>
            <Button onClick={handleSubmitBatch} disabled={isSubmitting} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit to MCC
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
