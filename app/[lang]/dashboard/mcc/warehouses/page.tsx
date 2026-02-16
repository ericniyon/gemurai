"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"
import {
  Warehouse,
  Plus,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  Link2,
  Building2,
  Search,
  Package,
  MapPin,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Layers,
  Boxes,
  Briefcase,
  KeyRound,
  ClipboardList,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"

const InventoryRentalsContent = dynamic(
  () =>
    import("../inventory-rentals/page").then((mod) => ({
      default: mod.InventoryRentalsContent,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    ),
  }
)


const WAREHOUSE_TYPES = [
  { value: "COLLECTION_CENTER", label: "Collection Center" },
  { value: "PROCESSING_PLANT", label: "Processing Plant" },
  { value: "COLD_STORAGE", label: "Cold Storage" },
  { value: "DISTRIBUTION_CENTER", label: "Distribution Center" },
]

/** Sentinel value for "Unlink" in Link-to-global-warehouse Select (Radix forbids empty string as SelectItem value) */
const LINK_UNLINK_VALUE = "__unlink__"

interface MccWarehouse {
  id: string
  mccId: string
  name: string
  type: string
  location: string
  capacity: number
  isActive: boolean
  globalWarehouseId: string | null
  warehouse?: { id: string; name: string; code: string } | null
}

interface LocationRecord {
  id: string
  name: string
  code: string
  warehouseId: string
  locationType: string
  isActive: boolean
}

interface StockRecord {
  id: string
  quantity: number
  reservedQuantity: number
  product?: { id: string; name: string; internalReference?: string }
  location?: { id: string; name: string }
}

interface MCCWarehousesPageProps {
  triggerAddWarehouse?: boolean
  onTriggerAddWarehouseConsumed?: () => void
  triggerAddProduct?: boolean
  onTriggerAddProductConsumed?: () => void
  triggerRecordAsset?: boolean
  onTriggerRecordAssetConsumed?: () => void
}

export default function MCCWarehousesPage({
  triggerAddWarehouse,
  onTriggerAddWarehouseConsumed,
  triggerAddProduct,
  onTriggerAddProductConsumed,
  triggerRecordAsset,
  onTriggerRecordAssetConsumed,
}: MCCWarehousesPageProps = {}) {
  const { user } = useAuth()
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const token = useAuthStore((s) => s.token) ?? (typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null)

  const [warehouses, setWarehouses] = useState<MccWarehouse[]>([])
  const [globalWarehouses, setGlobalWarehouses] = useState<{ id: string; name: string; code: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selected, setSelected] = useState<MccWarehouse | null>(null)
  const [form, setForm] = useState({
    name: "",
    type: "COLLECTION_CENTER",
    location: "",
    capacity: "",
    isActive: true,
  })
  const [linkGlobalId, setLinkGlobalId] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterLinked, setFilterLinked] = useState<string>("all")
  const [expandedStockWh, setExpandedStockWh] = useState<string | null>(null)
  const [locationsByWh, setLocationsByWh] = useState<Record<string, LocationRecord[]>>({})
  const [stockByWh, setStockByWh] = useState<Record<string, { list: StockRecord[]; loading: boolean }>>({})
  const [warehouseSection, setWarehouseSection] = useState<string>("warehouses")
  const [openAssetDialogFn, setOpenAssetDialogFn] = useState<(() => void) | null>(null)

  const mccId = user?.mccId

  const registerOpenAssetDialog = useCallback((open: () => void) => {
    setOpenAssetDialogFn(() => open)
  }, [])

  useEffect(() => {
    if (triggerAddWarehouse) {
      setAddErrors({})
      setAddOpen(true)
      onTriggerAddWarehouseConsumed?.()
    }
  }, [triggerAddWarehouse, onTriggerAddWarehouseConsumed])

  const WAREHOUSE_SIDEBAR_ITEMS = [
    { value: "warehouses", label: "All warehouses", icon: Building2 },
    { value: "stock", label: "Stock", icon: Package },
    { value: "products", label: "Products & inventory", icon: Boxes },
    { value: "assets", label: "Assets", icon: Briefcase },
    { value: "rentals", label: "Rentals", icon: KeyRound },
    { value: "requests", label: "Requests", icon: ClipboardList },
  ] as const

  const fetchWarehouses = async () => {
    if (!mccId || !token) return
    try {
      const res = await fetch(`/api/v1/mcc/warehouses?mccId=${mccId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setWarehouses(data.data)
      } else {
        setWarehouses([])
      }
    } catch {
      setWarehouses([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchGlobalWarehouses = async () => {
    if (!mccId || !token) return
    try {
      const res = await fetch(`/api/v1/mcc/global-warehouses?mccId=${mccId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setGlobalWarehouses(data.data)
      } else {
        setGlobalWarehouses([])
      }
    } catch {
      setGlobalWarehouses([])
    }
  }

  useEffect(() => {
    if (user?.mccId && token) {
      fetchWarehouses()
      fetchGlobalWarehouses()
    }
  }, [user?.mccId, token])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchWarehouses()
    fetchGlobalWarehouses()
  }

  const filteredWarehouses = useMemo(() => {
    let list = warehouses
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (wh) =>
          wh.name.toLowerCase().includes(q) ||
          wh.location.toLowerCase().includes(q) ||
          (wh.warehouse?.name?.toLowerCase().includes(q) || wh.warehouse?.code?.toLowerCase().includes(q))
      )
    }
    if (filterType !== "all") list = list.filter((wh) => wh.type === filterType)
    if (filterLinked === "linked") list = list.filter((wh) => wh.globalWarehouseId != null)
    if (filterLinked === "unlinked") list = list.filter((wh) => wh.globalWarehouseId == null)
    return list
  }, [warehouses, search, filterType, filterLinked])

  const stats = useMemo(() => {
    const linked = warehouses.filter((w) => w.globalWarehouseId != null).length
    const active = warehouses.filter((w) => w.isActive).length
    const totalCapacity = warehouses.reduce((sum, w) => sum + Number(w.capacity || 0), 0)
    return { total: warehouses.length, linked, active, totalCapacity }
  }, [warehouses])

  const fetchLocationsForWarehouse = async (globalWarehouseId: string) => {
    try {
      const res = await fetch(`/api/v1/inventory/locations?warehouseId=${globalWarehouseId}`, {
        credentials: "include",
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setLocationsByWh((prev) => ({ ...prev, [globalWarehouseId]: data.data }))
      }
    } catch {
      toast.error("Failed to load locations")
    }
  }

  const fetchStockForWarehouse = async (globalWarehouseId: string) => {
    if (!token) return
    setStockByWh((prev) => ({ ...prev, [globalWarehouseId]: { list: [], loading: true } }))
    try {
      const res = await fetch(
        `/api/v1/inventory/stock?warehouseId=${globalWarehouseId}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      )
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setStockByWh((prev) => ({ ...prev, [globalWarehouseId]: { list: data.data, loading: false } }))
      } else {
        setStockByWh((prev) => ({ ...prev, [globalWarehouseId]: { list: [], loading: false } }))
      }
    } catch {
      setStockByWh((prev) => ({ ...prev, [globalWarehouseId]: { list: [], loading: false } }))
      toast.error("Failed to load stock")
    }
  }

  const validateAddForm = (): Record<string, string> => {
    const err: Record<string, string> = {}
    const name = form.name.trim()
    if (!name) {
      err.name = "Name is required"
    } else if (name.length < 2) {
      err.name = "Name must be at least 2 characters"
    }
    if (!form.type) err.type = "Type is required"
    const location = form.location.trim()
    if (!location) {
      err.location = "Location is required"
    } else if (location.length < 2) {
      err.location = "Location must be at least 2 characters"
    }
    const cap = form.capacity.trim()
    if (!cap) {
      err.capacity = "Capacity is required"
    } else {
      const num = parseFloat(cap)
      if (Number.isNaN(num) || num < 0) {
        err.capacity = "Capacity must be a number ≥ 0"
      }
    }
    return err
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !mccId) return
    const errors = validateAddForm()
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors)
      toast.error("Please fix the errors before submitting")
      return
    }
    setAddErrors({})
    setSubmitting(true)
    try {
      const res = await fetch("/api/v1/mcc/warehouses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          mccId,
          name: form.name.trim(),
          type: form.type,
          location: form.location.trim(),
          capacity: parseFloat(form.capacity) || 0,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Warehouse created")
        setAddOpen(false)
        setAddErrors({})
        setForm({ name: "", type: "COLLECTION_CENTER", location: "", capacity: "", isActive: true })
        fetchWarehouses()
      } else {
        toast.error(data.error || "Failed to create warehouse")
      }
    } catch {
      toast.error("Failed to create warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !selected) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/mcc/warehouses/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim() || selected.name,
          type: form.type || selected.type,
          location: form.location.trim() || selected.location,
          capacity: form.capacity !== "" ? parseFloat(form.capacity) : selected.capacity,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Warehouse updated")
        setEditOpen(false)
        setSelected(null)
        setForm({ name: "", type: "COLLECTION_CENTER", location: "", capacity: "", isActive: true })
        fetchWarehouses()
      } else {
        toast.error(data.error || "Failed to update warehouse")
      }
    } catch {
      toast.error("Failed to update warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (wh: MccWarehouse) => {
    if (!token) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/mcc/warehouses/${wh.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: wh.name,
          type: wh.type,
          location: wh.location,
          capacity: wh.capacity,
          isActive: !wh.isActive,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(wh.isActive ? "Warehouse set inactive" : "Warehouse set active")
        fetchWarehouses()
      } else {
        toast.error(data.error || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLinkSubmit = async () => {
    if (!token || !selected) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/mcc/warehouses/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          globalWarehouseId: linkGlobalId === LINK_UNLINK_VALUE || !linkGlobalId ? null : linkGlobalId,
          name: selected.name,
          type: selected.type,
          location: selected.location,
          capacity: selected.capacity,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(linkGlobalId && linkGlobalId !== LINK_UNLINK_VALUE ? "Linked to global warehouse" : "Unlinked")
        setLinkOpen(false)
        setSelected(null)
        setLinkGlobalId(LINK_UNLINK_VALUE)
        fetchWarehouses()
      } else {
        toast.error(data.error || "Failed to update link")
      }
    } catch {
      toast.error("Failed to update link")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/mcc/warehouses/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Warehouse removed")
        setDeleteId(null)
        fetchWarehouses()
      } else {
        toast.error(data.error || "Failed to delete warehouse")
      }
    } catch {
      toast.error("Failed to delete warehouse")
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (wh: MccWarehouse) => {
    setSelected(wh)
    setForm({
      name: wh.name,
      type: wh.type,
      location: wh.location,
      capacity: String(wh.capacity),
      isActive: wh.isActive,
    })
    setEditOpen(true)
  }

  const openLink = (wh: MccWarehouse) => {
    setSelected(wh)
    setLinkGlobalId(wh.globalWarehouseId || wh.warehouse?.id || LINK_UNLINK_VALUE)
    setLinkOpen(true)
  }

  const linkedWarehouses = useMemo(() => warehouses.filter((w) => w.globalWarehouseId != null), [warehouses])

  if (!user || (user.role !== "MCC_MANAGER" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-gray-600">You do not have access to this page.</p>
      </div>
    )
  }

  if (loading && warehouses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#0099f2]/5">
        <div className="relative z-10 w-full px-4 py-10 sm:px-6 lg:px-10">
          <div className="mb-10 animate-pulse">
            <div className="h-9 w-64 bg-slate-200 rounded-lg mb-2" />
            <div className="h-5 w-96 bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-slate-100/80 border border-slate-200/60 animate-pulse" />
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading warehouses...</span>
          </div>
        </div>
      </div>
    )
  }

  const cardConfig: Record<string, { border: string; gradient: string; iconBg: string; labelColor: string; iconColor: string }> = {
    primary: { border: "border-blue-100", gradient: "from-blue-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-blue-50", labelColor: "text-blue-600", iconColor: "text-blue-500" },
    emerald: { border: "border-emerald-100", gradient: "from-emerald-100/50 via-teal-100/30 to-transparent", iconBg: "bg-emerald-50", labelColor: "text-emerald-600", iconColor: "text-emerald-500" },
    amber: { border: "border-amber-100", gradient: "from-amber-100/50 via-orange-100/30 to-transparent", iconBg: "bg-amber-50", labelColor: "text-amber-600", iconColor: "text-amber-500" },
    purple: { border: "border-purple-100", gradient: "from-purple-100/50 via-indigo-100/30 to-transparent", iconBg: "bg-purple-50", labelColor: "text-purple-600", iconColor: "text-purple-500" },
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="flex flex-1 w-full min-h-0">
        {/* Sidebar — compact, clear hierarchy */}
        <aside className="w-52 shrink-0 border-r border-slate-200/80 bg-white py-5 px-3 shadow-sm">
          <div className="mb-4 px-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Warehouses</h2>
            <p className="mt-0.5 text-sm font-medium text-slate-700">Sites & assets</p>
          </div>
          <nav className="space-y-0.5">
            {WAREHOUSE_SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = warehouseSection === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setWarehouseSection(item.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8 overflow-auto">
          {/* Top bar: context-aware actions */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Warehouse className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {warehouseSection === "warehouses"
                    ? "Warehouses"
                    : warehouseSection === "stock"
                      ? "Stock"
                      : warehouseSection === "products"
                        ? "Products & inventory"
                        : warehouseSection === "assets"
                          ? "Assets"
                          : warehouseSection === "rentals"
                            ? "Rentals"
                            : warehouseSection === "requests"
                              ? "Requests"
                              : "Warehouses"}
                </h1>
                <p className="text-xs text-slate-500">
                  {warehouseSection === "warehouses" && "Manage MCC warehouse locations and link to inventory."}
                  {warehouseSection === "stock" && "View stock at linked global warehouses."}
                  {warehouseSection === "products" && "Products, inventory, and stock quantities."}
                  {warehouseSection === "assets" && "Record and track equipment assets for rentals."}
                  {warehouseSection === "rentals" && "Equipment rentals and returns."}
                  {warehouseSection === "requests" && "Farmer equipment requests."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {warehouseSection === "warehouses" && (
                <>
                  <Button
                    onClick={() => { setAddErrors({}); setAddOpen(true); }}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Add warehouse
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="rounded-lg border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  </Button>
                </>
              )}
              {warehouseSection === "assets" && (
                <Button
                  onClick={() => openAssetDialogFn?.()}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Record asset
                </Button>
              )}
            </div>
          </div>

            {warehouseSection === "warehouses" && (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
                <Card className={cn("relative overflow-hidden rounded-3xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl", cardConfig.primary.border)}>
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                          Total warehouses
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <div className="rounded-2xl bg-blue-50 p-3">
                        <Building2 className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">MCC warehouse locations</p>
                  </CardContent>
                </Card>
                <Card className={cn("relative overflow-hidden rounded-3xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl", cardConfig.emerald.border)}>
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                          Linked to inventory
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{stats.linked}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <Link2 className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Ready for receive flows</p>
                  </CardContent>
                </Card>
                <Card className={cn("relative overflow-hidden rounded-3xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl", cardConfig.amber.border)}>
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-amber-100/50 via-orange-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                          Active
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{stats.active}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-3">
                        <BarChart3 className="h-6 w-6 text-amber-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Visible for collections</p>
                  </CardContent>
                </Card>
                <Card className={cn("relative overflow-hidden rounded-3xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl", cardConfig.purple.border)}>
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-purple-100/50 via-indigo-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                          Total capacity
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                          {stats.totalCapacity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-purple-50 p-3">
                        <Package className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Liters or units</p>
                  </CardContent>
                </Card>
              </section>
            )}

            <Tabs value={warehouseSection} onValueChange={setWarehouseSection} className="space-y-6">
            <TabsContent value="warehouses" className="mt-0">
              <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-5">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Your warehouses ({filteredWarehouses.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Link a warehouse to a global inventory warehouse to use it when recording collections (Receive into warehouse).
                  </p>
                  <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search by name, location, or global code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px] rounded-xl border-gray-200">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {WAREHOUSE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterLinked} onValueChange={setFilterLinked}>
                      <SelectTrigger className="w-[160px] rounded-xl border-gray-200">
                        <SelectValue placeholder="Link status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="linked">Linked</SelectItem>
                        <SelectItem value="unlinked">Not linked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredWarehouses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="rounded-2xl bg-gray-100 p-4">
                        <Warehouse className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="mt-4 font-semibold text-gray-700">
                        {warehouses.length === 0 ? "No warehouses yet" : "No warehouses match your filters"}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {warehouses.length === 0 ? "Add a warehouse to get started." : "Try changing search or filters."}
                      </p>
                      {warehouses.length === 0 && (
                        <Button onClick={() => { setAddErrors({}); setAddOpen(true); }} className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md">
                          <Plus className="mr-2 h-4 w-4" />
                          Add warehouse
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Location</TableHead>
                          <TableHead className="font-semibold">Capacity</TableHead>
                          <TableHead className="font-semibold">Linked global warehouse</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWarehouses.map((wh) => (
                          <TableRow key={wh.id} className="hover:bg-blue-50/30">
                            <TableCell className="font-medium">{wh.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="rounded-lg font-medium">
                                {WAREHOUSE_TYPES.find((t) => t.value === wh.type)?.label || wh.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">{wh.location}</TableCell>
                            <TableCell className="font-medium">{Number(wh.capacity).toLocaleString()}</TableCell>
                            <TableCell>
                              {wh.warehouse ? (
                                <span className="text-sm text-gray-700 font-medium">
                                  {wh.warehouse.name} ({wh.warehouse.code})
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">Not linked</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={wh.isActive}
                                  onCheckedChange={() => handleToggleActive(wh)}
                                  disabled={submitting}
                                />
                                <Badge variant={wh.isActive ? "default" : "secondary"} className="rounded-lg">
                                  {wh.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(wh)} className="text-gray-600 hover:text-blue-600 hover:bg-blue-50" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openLink(wh)} className="text-blue-600 hover:bg-blue-50" title="Link to global warehouse">
                                  <Link2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(wh.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock" className="mt-0">
              <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-5">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Package className="h-5 w-5 text-blue-600" />
                    Stock at linked warehouses
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Expand a warehouse to see locations and stock levels for its linked global inventory warehouse.
                  </p>
                </CardHeader>
              <CardContent className="p-0">
                {linkedWarehouses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Link2 className="h-12 w-12 text-gray-300" />
                    <p className="mt-4 font-medium text-gray-600">No linked warehouses</p>
                    <p className="mt-1 text-sm text-gray-500">Link an MCC warehouse to a global warehouse to see stock and locations here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {linkedWarehouses.map((mccWh) => {
                      const gid = mccWh.globalWarehouseId!
                      const locations = locationsByWh[gid]
                      const stockState = stockByWh[gid]
                      const expanded = expandedStockWh === mccWh.id
                      return (
                        <Collapsible
                          key={mccWh.id}
                          open={expanded}
                          onOpenChange={(open) => {
                            setExpandedStockWh(open ? mccWh.id : null)
                            if (open && !locations) fetchLocationsForWarehouse(gid)
                            if (open && !stockState) fetchStockForWarehouse(gid)
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-blue-50/50 transition-colors rounded-lg"
                            >
                              {expanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
                              )}
                              <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900">{mccWh.name}</p>
                                <p className="text-sm text-gray-500">
                                  → {mccWh.warehouse?.name} ({mccWh.warehouse?.code})
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {expanded && locations ? locations.length : "—"} locations
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  {expanded && stockState && !stockState.loading ? stockState.list.length : "—"} stock lines
                                </span>
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white px-6 pb-6 pt-2">
                              <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Layers className="h-4 w-4" />
                                    Locations
                                  </h4>
                                  {locations === undefined ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading…
                                    </div>
                                  ) : locations.length === 0 ? (
                                    <p className="text-sm text-gray-500">No locations in this warehouse.</p>
                                  ) : (
                                    <ul className="space-y-1 rounded-lg border border-gray-200 bg-white p-3">
                                      {locations.map((loc) => (
                                        <li key={loc.id} className="flex items-center justify-between text-sm">
                                          <span className="font-medium text-gray-900">{loc.name}</span>
                                          <Badge variant="outline" className="rounded">{loc.code}</Badge>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                <div>
                                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Package className="h-4 w-4" />
                                    Stock
                                  </h4>
                                  {!stockState ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading…
                                    </div>
                                  ) : stockState.loading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Loading…
                                    </div>
                                  ) : stockState.list.length === 0 ? (
                                    <p className="text-sm text-gray-500">No stock records.</p>
                                  ) : (
                                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow className="bg-gray-50">
                                            <TableHead className="text-xs">Product</TableHead>
                                            <TableHead className="text-xs">Location</TableHead>
                                            <TableHead className="text-xs text-right">Qty</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {stockState.list.slice(0, 20).map((s: StockRecord) => (
                                            <TableRow key={s.id}>
                                              <TableCell className="text-sm font-medium">
                                                {s.product?.name ?? s.product?.internalReference ?? "—"}
                                              </TableCell>
                                              <TableCell className="text-sm text-gray-600">
                                                {s.location?.name ?? "—"}
                                              </TableCell>
                                              <TableCell className="text-sm text-right">
                                                {(s.quantity ?? 0).toLocaleString()}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      {stockState.list.length > 20 && (
                                        <p className="px-3 py-2 text-xs text-gray-500 border-t">
                                          Showing 20 of {stockState.list.length} lines
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-0" forceMount hidden={warehouseSection !== "products"}>
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <InventoryRentalsContent
                  embedTab="warehouse-hub"
                  triggerOpenAddProduct={triggerAddProduct}
                  onTriggerAddProductConsumed={onTriggerAddProductConsumed}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="assets" className="mt-0" forceMount hidden={warehouseSection !== "assets"}>
            {/* Record asset bar — prominent CTA when on Assets */}
            <div className="mb-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Record equipment assets</h3>
                    <p className="text-xs text-slate-600">
                      Register chillers, milk meters, trackers, and other equipment to track status and issue rentals.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => openAssetDialogFn?.()}
                  className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Record asset
                </Button>
              </div>
            </div>
            <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <InventoryRentalsContent
                  embedTab="assets"
                  registerOpenAssetDialog={registerOpenAssetDialog}
                  triggerOpenRecordAsset={triggerRecordAsset}
                  onTriggerRecordAssetConsumed={onTriggerRecordAssetConsumed}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rentals" className="mt-0">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <InventoryRentalsContent embedTab="rentals" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requests" className="mt-0">
            <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <InventoryRentalsContent embedTab="requests" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </main>
      </div>

      {/* Add warehouse dialog — redesigned */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="rounded-3xl border border-gray-200 p-0 gap-0 sm:max-w-xl overflow-hidden shadow-2xl shadow-blue-900/10 bg-white [&>button]:right-5 [&>button]:top-5 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:border [&>button]:border-gray-200 [&>button]:bg-gray-50 [&>button]:text-gray-700 [&>button]:hover:bg-gray-100 [&>button]:hover:text-gray-900 [&>button]:transition-colors"
          aria-describedby="add-warehouse-description"
        >
          {/* Header — branded, visible */}
          <div className="border-b border-gray-200 bg-gray-50/80 px-6 pt-5 pb-5">
            <div className="space-y-4">
              {/* Brand pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
                  H
                </span>
                <span className="text-xs font-semibold text-gray-900 tracking-tight">HarvestPlus</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">by YDEN</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-100 p-3 shrink-0 ring-1 ring-blue-200">
                  <Warehouse className="h-7 w-7 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <DialogTitle className="text-xl font-bold text-gray-900 border-0 tracking-tight">
                    Add warehouse
                  </DialogTitle>
                  <DialogDescription id="add-warehouse-description" className="text-gray-600 mt-1.5 text-sm leading-relaxed max-w-md">
                    Create a new warehouse for your MCC. You can link it to global inventory later to use when recording collections.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleAdd} className="flex flex-col">
            {/* Form body with sections */}
            <div className="px-6 py-6 space-y-6 bg-white">
              {/* Basic info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Building2 className="h-3.5 w-3.5" />
                  Basic information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-wh-name" className="text-gray-700 font-medium">
                      Name
                    </Label>
                    <Input
                      id="add-wh-name"
                      value={form.name}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, name: e.target.value }))
                        if (addErrors.name) setAddErrors((prev) => ({ ...prev, name: "" }))
                      }}
                      placeholder="e.g. Main store, North site"
                      className={cn(
                        "rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11",
                        addErrors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200"
                      )}
                    />
                    {addErrors.name && <p className="text-xs text-red-600">{addErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-wh-type" className="text-gray-700 font-medium">
                      Type
                    </Label>
                    <SearchableSelect
                      value={form.type}
                      onValueChange={(v) => {
                        setForm((p) => ({ ...p, type: v }))
                        if (addErrors.type) setAddErrors((prev) => ({ ...prev, type: "" }))
                      }}
                      options={WAREHOUSE_TYPES}
                      placeholder="Select type"
                      searchPlaceholder="Search type..."
                      emptyText="No type found."
                      className={cn(
                        "h-11 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50",
                        addErrors.type ? "border-red-500" : "border-gray-200"
                      )}
                    />
                    {addErrors.type && <p className="text-xs text-red-600">{addErrors.type}</p>}
                  </div>
                </div>
              </div>

              {/* Location & capacity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Location & capacity
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-wh-location" className="text-gray-700 font-medium">
                      Location / Address
                    </Label>
                    <Input
                      id="add-wh-location"
                      value={form.location}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, location: e.target.value }))
                        if (addErrors.location) setAddErrors((prev) => ({ ...prev, location: "" }))
                      }}
                      placeholder="Address, district, or area"
                      className={cn(
                        "rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11",
                        addErrors.location ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200"
                      )}
                    />
                    {addErrors.location && <p className="text-xs text-red-600">{addErrors.location}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-wh-capacity" className="text-gray-700 font-medium">
                        Capacity
                      </Label>
                      <Input
                        id="add-wh-capacity"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.capacity}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, capacity: e.target.value }))
                          if (addErrors.capacity) setAddErrors((prev) => ({ ...prev, capacity: "" }))
                        }}
                        placeholder="e.g. 1000"
                        className={cn(
                          "rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11",
                          addErrors.capacity ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200"
                        )}
                      />
                      {addErrors.capacity ? <p className="text-xs text-red-600">{addErrors.capacity}</p> : <p className="text-xs text-gray-500">Liters or units as applicable</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Status</Label>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 min-h-11">
                        <Switch
                          checked={form.isActive}
                          onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                          className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {form.isActive ? "Visible for collections" : "Hidden from flows"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 gap-3 sm:gap-0 sm:flex-row-reverse">
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-lg shadow-blue-500/25 h-11 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create warehouse
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 h-11"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit warehouse dialog — redesigned */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="rounded-3xl border border-gray-200 p-0 gap-0 sm:max-w-xl overflow-hidden shadow-2xl shadow-blue-900/10 bg-white [&>button]:right-5 [&>button]:top-5 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:border [&>button]:border-gray-200 [&>button]:bg-gray-50 [&>button]:text-gray-700 [&>button]:hover:bg-gray-100 [&>button]:hover:text-gray-900 [&>button]:transition-colors"
          aria-describedby="edit-warehouse-description"
        >
          {/* Header — branded, visible */}
          <div className="border-b border-gray-200 bg-gray-50/80 px-6 pt-5 pb-5">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">H</span>
                <span className="text-xs font-semibold text-gray-900 tracking-tight">HarvestPlus</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">by YDEN</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-100 p-3 shrink-0 ring-1 ring-blue-200">
                  <Pencil className="h-7 w-7 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <DialogTitle className="text-xl font-bold text-gray-900 border-0 tracking-tight">
                    Edit warehouse
                  </DialogTitle>
                  <DialogDescription id="edit-warehouse-description" className="text-gray-600 mt-1.5 text-sm leading-relaxed max-w-md">
                    Update warehouse details and status. Changes apply immediately.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleEdit} className="flex flex-col">
            <div className="px-6 py-6 space-y-6 bg-white">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <Building2 className="h-3.5 w-3.5" />
                  Basic information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-wh-name" className="text-gray-700 font-medium">Name</Label>
                    <Input
                      id="edit-wh-name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Main store"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-wh-type" className="text-gray-700 font-medium">Type</Label>
                    <SearchableSelect
                      value={form.type}
                      onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
                      options={WAREHOUSE_TYPES}
                      placeholder="Select type"
                      searchPlaceholder="Search type..."
                      emptyText="No type found."
                      className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Location & capacity
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-wh-location" className="text-gray-700 font-medium">Location / Address</Label>
                    <Input
                      id="edit-wh-location"
                      value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Address, district, or area"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-wh-capacity" className="text-gray-700 font-medium">Capacity</Label>
                      <Input
                        id="edit-wh-capacity"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.capacity}
                        onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                        placeholder="e.g. 1000"
                        className="rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11"
                      />
                      <p className="text-xs text-gray-500">Liters or units</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Status</Label>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 min-h-11">
                        <Switch
                          checked={form.isActive}
                          onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                          className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">{form.isActive ? "Active" : "Inactive"}</span>
                      </div>
                      <p className="text-xs text-gray-500">{form.isActive ? "Visible for collections" : "Hidden from flows"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 gap-3 sm:gap-0 sm:flex-row-reverse">
              <Button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-lg shadow-blue-500/25 h-11 font-semibold">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 h-11">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link to global warehouse dialog — redesigned */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent
          className="rounded-3xl border border-gray-200 p-0 gap-0 sm:max-w-xl overflow-hidden shadow-2xl shadow-blue-900/10 bg-white [&>button]:right-5 [&>button]:top-5 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-full [&>button]:border [&>button]:border-gray-200 [&>button]:bg-gray-50 [&>button]:text-gray-700 [&>button]:hover:bg-gray-100 [&>button]:hover:text-gray-900 [&>button]:transition-colors"
          aria-describedby="link-warehouse-description"
        >
          {/* Header — branded, visible */}
          <div className="border-b border-gray-200 bg-gray-50/80 px-6 pt-5 pb-5">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-gray-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">H</span>
                <span className="text-xs font-semibold text-gray-900 tracking-tight">HarvestPlus</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500">by YDEN</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-100 p-3 shrink-0 ring-1 ring-blue-200">
                  <Link2 className="h-7 w-7 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <DialogTitle className="text-xl font-bold text-gray-900 border-0 tracking-tight">
                    Link to global warehouse
                  </DialogTitle>
                  <DialogDescription id="link-warehouse-description" className="text-gray-600 mt-1.5 text-sm leading-relaxed max-w-md">
                    Link this MCC warehouse to a global inventory warehouse so you can use it when recording collections (Receive into warehouse).
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="px-6 py-6 space-y-5 bg-white">
              {selected && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">MCC warehouse</p>
                  <p className="mt-1 font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-sm text-gray-600">{selected.location}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Global warehouse</Label>
                <SearchableSelect
                  value={linkGlobalId || LINK_UNLINK_VALUE}
                  onValueChange={(v) => setLinkGlobalId(v)}
                  options={[
                    { value: LINK_UNLINK_VALUE, label: "— Unlink —" },
                    ...globalWarehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` })),
                  ]}
                  placeholder="Select warehouse or Unlink"
                  searchPlaceholder="Search warehouse..."
                  emptyText="No warehouse found."
                  className="h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50"
                />
                <p className="text-xs text-gray-500">Choose a global inventory warehouse to link, or Unlink to remove the connection.</p>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 gap-3 sm:gap-0 sm:flex-row-reverse">
              <Button onClick={handleLinkSubmit} disabled={submitting} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-lg shadow-blue-500/25 h-11 font-semibold">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setLinkOpen(false)} className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 h-11">
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl border-gray-200 sm:max-w-sm overflow-hidden shadow-xl">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">Remove warehouse?</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1 text-sm">
                  This cannot be undone. Products and stock linked to this warehouse may be affected.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl border-gray-200">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="rounded-xl">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
