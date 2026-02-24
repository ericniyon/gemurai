"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Loader2,
  UserPlus,
  Building2,
  Phone,
  MapPin,
  Check,
  ArrowRight,
  X,
  Filter,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Farmer {
  id: string
  name: string
  farmerCode?: string
  phone?: string
  location?: string
  mccId: string
  mccs?: {
    id: string
    name: string
    code?: string
  }
}

interface CollectionCenter {
  id: string
  name: string
  code?: string | null
  _count?: {
    farmers: number
  }
}

type MCC = CollectionCenter

interface FarmerAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetMcc: MCC | null
  allMccs: MCC[]
  onAssignmentComplete: () => void
}

export function FarmerAssignmentDialog({
  open,
  onOpenChange,
  targetMcc,
  allMccs,
  onAssignmentComplete,
}: FarmerAssignmentDialogProps) {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFarmerIds, setSelectedFarmerIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"available" | "assigned">("available")
  const [selectedSourceMcc, setSelectedSourceMcc] = useState<string>("all")

  useEffect(() => {
    if (open && targetMcc) {
      fetchFarmers()
      setSelectedFarmerIds(new Set())
      setSearchQuery("")
      setViewMode("available")
      setSelectedSourceMcc("all")
    }
  }, [open, targetMcc])

  const fetchFarmers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/farmers/assign", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setFarmers(result.data || [])
      } else {
        toast.error(result.error || "Failed to fetch farmers")
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
      toast.error("Failed to fetch farmers")
    } finally {
      setLoading(false)
    }
  }

  const filteredFarmers = useMemo(() => {
    if (!targetMcc) return []

    let filtered = farmers

    if (viewMode === "assigned") {
      filtered = farmers.filter((f) => f.mccId === targetMcc.id)
    } else {
      filtered = farmers.filter((f) => f.mccId !== targetMcc.id)
      if (selectedSourceMcc !== "all") {
        filtered = filtered.filter((f) => f.mccId === selectedSourceMcc)
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.farmerCode?.toLowerCase().includes(query) ||
          f.phone?.includes(query) ||
          f.location?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [farmers, targetMcc, viewMode, searchQuery, selectedSourceMcc])

  const sourceCollectionCenters = useMemo(() => {
    const ccIds = new Set(farmers.filter((f) => f.mccId !== targetMcc?.id).map((f) => f.mccId))
    return allMccs.filter((m) => ccIds.has(m.id))
  }, [farmers, targetMcc, allMccs])

  const handleToggleFarmer = (farmerId: string) => {
    setSelectedFarmerIds((prev) => {
      const next = new Set(prev)
      if (next.has(farmerId)) {
        next.delete(farmerId)
      } else {
        next.add(farmerId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    const allIds = filteredFarmers.map((f) => f.id)
    setSelectedFarmerIds(new Set(allIds))
  }

  const handleDeselectAll = () => {
    setSelectedFarmerIds(new Set())
  }

  const handleAssign = async () => {
    if (!targetMcc || selectedFarmerIds.size === 0) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("Gemurai_token")
      const response = await fetch("/api/v1/mcc/farmers/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mccId: targetMcc.id,
          farmerIds: Array.from(selectedFarmerIds),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        onAssignmentComplete()
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to assign farmers")
      }
    } catch (error) {
      console.error("Error assigning farmers:", error)
      toast.error("Failed to assign farmers")
    } finally {
      setSubmitting(false)
    }
  }

  const currentMccFarmersCount = farmers.filter((f) => f.mccId === targetMcc?.id).length
  const availableFarmersCount = farmers.filter((f) => f.mccId !== targetMcc?.id).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-white border border-slate-200 shadow-xl rounded-3xl [&>button]:absolute [&>button]:right-5 [&>button]:top-5 [&>button]:text-slate-400 [&>button]:hover:text-slate-700 [&>button]:hover:bg-slate-100 [&>button]:rounded-full [&>button]:z-10 [&>button]:h-9 [&>button]:w-9" aria-describedby="farmer-assign-description">
        <DialogTitle className="sr-only">Assign Farmers</DialogTitle>
        <DialogDescription id="farmer-assign-description" className="sr-only">
          Transfer farmers to {targetMcc?.name}
        </DialogDescription>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assign Farmers</h2>
                <p className="text-blue-200 text-sm mt-0.5">
                  Transfer farmers to <span className="font-semibold text-white">{targetMcc?.name}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="bg-white/10 rounded-lg px-4 py-3">
              <p className="text-blue-200 text-xs">Currently Assigned</p>
              <p className="text-2xl font-bold mt-1">{currentMccFarmersCount}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-3">
              <p className="text-blue-200 text-xs">Available to Transfer</p>
              <p className="text-2xl font-bold mt-1">{availableFarmersCount}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-3">
              <p className="text-blue-200 text-xs">Selected</p>
              <p className="text-2xl font-bold mt-1 text-emerald-300">{selectedFarmerIds.size}</p>
            </div>
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border p-1">
              <button
                onClick={() => setViewMode("available")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  viewMode === "available"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Available ({availableFarmersCount})
                </span>
              </button>
              <button
                onClick={() => setViewMode("assigned")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  viewMode === "assigned"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Assigned ({currentMccFarmersCount})
                </span>
              </button>
            </div>

            {/* Source Collection Center Filter */}
            {viewMode === "available" && sourceCollectionCenters.length > 0 && (
              <select
                value={selectedSourceMcc}
                onChange={(e) => setSelectedSourceMcc(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Collection Centers ({availableFarmersCount})</option>
                {sourceCollectionCenters.map((cc) => {
                  const count = farmers.filter((f) => f.mccId === cc.id).length
                  return (
                    <option key={cc.id} value={cc.id}>
                      {cc.name} ({count})
                    </option>
                  )
                })}
              </select>
            )}

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, code, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={fetchFarmers}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Selection Actions (only in available mode) */}
          {viewMode === "available" && filteredFarmers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="h-8">
                  Select All ({filteredFarmers.length})
                </Button>
                {selectedFarmerIds.size > 0 && (
                  <Button variant="outline" size="sm" onClick={handleDeselectAll} className="h-8">
                    Clear Selection
                  </Button>
                )}
              </div>
              {selectedFarmerIds.size > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
                  <Check className="h-3 w-3 mr-1" />
                  {selectedFarmerIds.size} farmer{selectedFarmerIds.size > 1 ? "s" : ""} selected
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Farmers List */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-500 mt-3">Loading farmers...</p>
              </div>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mt-4">No farmers found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {viewMode === "available"
                    ? "All farmers are already assigned to this Collection Center"
                    : "No farmers assigned to this Collection Center yet"}
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[320px]">
              <div className="px-6 py-4">
                <div className="grid gap-2">
                  {filteredFarmers.map((farmer) => (
                    <FarmerCard
                      key={farmer.id}
                      farmer={farmer}
                      isSelected={selectedFarmerIds.has(farmer.id)}
                      onToggle={() => handleToggleFarmer(farmer.id)}
                      isAssignedView={viewMode === "assigned"}
                      sourceCC={allMccs.find((m) => m.id === farmer.mccId)}
                    />
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          {viewMode === "available" && selectedFarmerIds.size > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {Array.from(selectedFarmerIds)
                    .slice(0, 3)
                    .map((id) => {
                      const farmer = farmers.find((f) => f.id === id)
                      return (
                        <Avatar key={id} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {farmer?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )
                    })}
                  {selectedFarmerIds.size > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      +{selectedFarmerIds.size - 3}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Transfer {selectedFarmerIds.size} farmer{selectedFarmerIds.size > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">to {targetMcc?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={submitting}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 px-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Assign Farmers
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FarmerCard({
  farmer,
  isSelected,
  onToggle,
  isAssignedView,
  sourceCC,
}: {
  farmer: Farmer
  isSelected: boolean
  onToggle: () => void
  isAssignedView?: boolean
  sourceCC?: MCC
}) {
  return (
    <div
      onClick={() => !isAssignedView && onToggle()}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
        isAssignedView
          ? "bg-white border-gray-100 cursor-default"
          : isSelected
          ? "bg-blue-50 border-blue-400 cursor-pointer shadow-sm"
          : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer"
      )}
    >
      {/* Checkbox or Assigned Badge */}
      {!isAssignedView ? (
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-5"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="h-4 w-4 text-emerald-600" />
        </div>
      )}

      {/* Avatar */}
      <Avatar className="h-10 w-10 border-2 border-gray-100">
        <AvatarFallback className={cn(
          "font-semibold",
          isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
        )}>
          {farmer.name?.charAt(0)?.toUpperCase() || "F"}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{farmer.name}</span>
          {farmer.farmerCode && (
            <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
              {farmer.farmerCode}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1">
          {farmer.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              {farmer.phone}
            </span>
          )}
          {farmer.location && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {farmer.location}
            </span>
          )}
        </div>
      </div>

      {/* Source Collection Center (only for available view) */}
      {!isAssignedView && sourceCC && (
        <div className="text-right shrink-0">
          <Badge variant="outline" className="text-xs bg-white">
            <Building2 className="h-3 w-3 mr-1" />
            {sourceCC.name}
          </Badge>
        </div>
      )}
    </div>
  )
}
