"use client"

import "./inventory-rentals.css"
import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  Box,
  Calendar,
  ClipboardList,
  Clock,
  ClipboardCheck,
  Factory,
  Filter,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Truck,
  User,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  Warehouse,
  Building2,
  BarChart3,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

type InventorySummary = {
  totalProducts: number
  totalStock: number
  totalValue: number
  lowStockCount: number
  expiringCount: number
  products: any[]
  lowStockProducts: any[]
  expiringProducts: any[]
}

type AssetRecord = {
  id: string
  serial: string
  name?: string | null
  assetType?: string | null
  status: string
  rentable?: boolean
  currentHolderType?: string | null
  currentHolderId?: string | null
  purchasedAt?: string | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  rentals?: {
    id: string
    rentStart?: string | null
    rentEnd?: string | null
    farmer?: {
      id: string
      name?: string | null
      phone?: string | null
    } | null
  }[]
}

type RentalRecord = {
  id: string
  assetId: string
  farmerId: string
  mccId: string | null
  rentStart: string | null
  rentEnd: string | null
  rentFeePerDay?: number | null
  deposit?: number | null
  returned: boolean
  returnedAt?: string | null
  createdAt?: string | null
  contractDoc?: string | null
  asset?: {
    id: string
    serial: string
    name?: string | null
    assetType?: string | null
    status?: string | null
  } | null
  farmer?: {
    id: string
    name?: string | null
    phone?: string | null
    farmerCode?: string | null
  } | null
  status?: string | null
  requestedAssetType?: string | null
}

type FarmerRecord = {
  id: string
  name?: string | null
  phone?: string | null
  farmerCode?: string | null
}

const assetTypes = [
  { value: "tracker", label: "GPS Tracker" },
  { value: "milk_meter", label: "Milk Meter" },
  { value: "chiller", label: "Chiller" },
  { value: "generator", label: "Generator" },
  { value: "solar", label: "Solar Kit" },
  { value: "pump", label: "Milk Pump" },
  { value: "other", label: "Other Asset" },
]

/** Specification fields per asset type. key = form/API field name; useForCapacityLiters = send value as top-level capacityLiters */
type AssetSpecField = {
  key: string
  label: string
  type: "number" | "text"
  placeholder?: string
  unit?: string
  useForCapacityLiters?: boolean
}
const ASSET_TYPE_SPECS: Record<string, AssetSpecField[]> = {
  tracker: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 0.5" },
    { key: "batteryHours", label: "Battery life", type: "number", unit: "hours", placeholder: "e.g. 24" },
    { key: "accuracyM", label: "GPS accuracy", type: "number", unit: "m", placeholder: "e.g. 5" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 10×5×3 cm" },
  ],
  milk_meter: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 2" },
    { key: "capacityLiters", label: "Capacity", type: "number", unit: "L", placeholder: "e.g. 20", useForCapacityLiters: true },
    { key: "flowRateLitersPerMin", label: "Flow rate", type: "number", unit: "L/min", placeholder: "e.g. 30" },
    { key: "accuracyPercent", label: "Accuracy", type: "number", unit: "±%", placeholder: "e.g. 2" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 30×20×15 cm" },
  ],
  chiller: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 45" },
    { key: "capacityLiters", label: "Cooling capacity", type: "number", unit: "L", placeholder: "e.g. 500", useForCapacityLiters: true },
    { key: "coolingTempMin", label: "Min. temp", type: "number", unit: "°C", placeholder: "e.g. 2" },
    { key: "coolingTempMax", label: "Max. temp", type: "number", unit: "°C", placeholder: "e.g. 6" },
    { key: "powerConsumptionW", label: "Power consumption", type: "number", unit: "W", placeholder: "e.g. 350" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 120×80×90 cm" },
  ],
  generator: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 80" },
    { key: "capacityKw", label: "Rated output", type: "number", unit: "kW", placeholder: "e.g. 5" },
    { key: "fuelType", label: "Fuel type", type: "text", placeholder: "e.g. Diesel, Petrol" },
    { key: "tankCapacityL", label: "Tank capacity", type: "number", unit: "L", placeholder: "e.g. 25" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 80×50×60 cm" },
  ],
  solar: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 15" },
    { key: "capacityW", label: "Panel output", type: "number", unit: "W", placeholder: "e.g. 300" },
    { key: "batteryCapacityAh", label: "Battery capacity", type: "number", unit: "Ah", placeholder: "e.g. 100" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 100×60×5 cm" },
  ],
  pump: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 8" },
    { key: "flowRateLitersPerMin", label: "Flow rate", type: "number", unit: "L/min", placeholder: "e.g. 30" },
    { key: "headHeightM", label: "Max. head height", type: "number", unit: "m", placeholder: "e.g. 10" },
    { key: "powerW", label: "Power", type: "number", unit: "W", placeholder: "e.g. 750" },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 40×25×20 cm" },
  ],
  other: [
    { key: "weightKg", label: "Weight", type: "number", unit: "kg", placeholder: "e.g. 10" },
    { key: "capacityLiters", label: "Capacity (if applicable)", type: "number", unit: "L", placeholder: "e.g. 100", useForCapacityLiters: true },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 50×30×20 cm" },
  ],
}

const conditionOptions = [
  { value: "good", label: "Good Condition" },
  { value: "needs_service", label: "Needs Service" },
  { value: "damaged", label: "Damaged" },
]

const formatDate = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString()
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

const capitalize = (value?: string | null) => {
  if (!value) return "—"
  return value
    .toString()
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

export type InventoryEmbedTab = "warehouse-hub" | "assets" | "rentals" | "requests"

export function InventoryRentalsContent({
  embedTab: embedTabProp,
}: {
  embedTab?: InventoryEmbedTab
} = {}) {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"
  const fromWarehouses = searchParams.get("from") === "warehouses"
  const tabParam = searchParams.get("tab") || "products"
  const effectiveTab: InventoryEmbedTab =
    tabParam === "products"
      ? "warehouse-hub"
      : tabParam === "assets"
        ? "assets"
        : tabParam === "rentals"
          ? "rentals"
          : tabParam === "requests"
            ? "requests"
            : "warehouse-hub"
  const isEmbedMode = !!embedTabProp || fromWarehouses
  const tabToShow = embedTabProp ?? effectiveTab

  useEffect(() => {
    if (!fromWarehouses && !embedTabProp) {
      router.replace(`/${lang}/dashboard/mcc/warehouses`)
    }
  }, [fromWarehouses, embedTabProp, lang, router])

  const [activeTab, setActiveTab] = useState("warehouse-hub")
  const [initializing, setInitializing] = useState(true)
  const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockCount: 0,
    expiringCount: 0,
    products: [],
    lowStockProducts: [],
    expiringProducts: [],
  })

  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [assetMeta, setAssetMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [assetFilters, setAssetFilters] = useState({ status: "all", search: "" })
  const [assetSummary, setAssetSummary] = useState({ total: 0, available: 0, rented: 0, maintenance: 0 })

  const [rentalsLoading, setRentalsLoading] = useState(false)
  const [rentals, setRentals] = useState<RentalRecord[]>([])
  const [rentalMeta, setRentalMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [rentalFilters, setRentalFilters] = useState({ status: "all", search: "" })
  const [rentalSummary, setRentalSummary] = useState({ total: 0, active: 0, returned: 0, overdue: 0, requests: 0 })
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [equipmentRequests, setEquipmentRequests] = useState<RentalRecord[]>([])

  const [farmers, setFarmers] = useState<FarmerRecord[]>([])
  const [availableAssets, setAvailableAssets] = useState<AssetRecord[]>([])

  const [assetDialogOpen, setAssetDialogOpen] = useState(false)
  const [assetSaveLoading, setAssetSaveLoading] = useState(false)
  const [rentalDialogOpen, setRentalDialogOpen] = useState(false)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)

  // Warehouse Hub - Products & Inventory
  const [productsLoading, setProductsLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [stockQuantities, setStockQuantities] = useState<any[]>([])
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [productSearch, setProductSearch] = useState("")
  
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: "",
    costPrice: "",
    unitOfMeasure: "Units",
    warehouseId: "",
    locationId: "",
    reorderPoint: "",
    stock: "0",
  })

  const commonInputClasses =
    "rounded-xl !border !border-[#bfdbfe] bg-white text-sm shadow-sm transition placeholder:text-slate-400 focus:!border-[#60a5fa] focus-visible:!ring-2 focus-visible:!ring-[#cfe0ff] focus-visible:!ring-offset-0 focus-visible:outline-none [&[type='date']]:!border-[#bfdbfe] [&[type='date']]:focus:!border-[#60a5fa] [&[type='number']]:!border-[#bfdbfe] [&[type='number']]:focus:!border-[#60a5fa]"

  const [newAssetForm, setNewAssetForm] = useState({
    serial: "",
    name: "",
    assetType: "",
    purchasedAt: "",
    notes: "",
    rentable: true,
    specValues: {} as Record<string, string>,
  })

  const [newRentalForm, setNewRentalForm] = useState({
    assetId: "",
    farmerId: "",
    rentStart: "",
    rentEnd: "",
    rentFeePerDay: "",
    deposit: "",
    contractDoc: "",
  })

  const [returnForm, setReturnForm] = useState({
    rentalId: "",
    condition: "good",
    notes: "",
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("Gemurai_token") : null
  const mccId = user?.mccId || null

  const fetchInventorySummary = async () => {
    try {
      const response = await fetch("/api/v1/inventory/products", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch inventory products")
      }

      const data = await response.json()
      const products = Array.isArray(data?.data) ? data.data : []

      let totalStock = 0
      let totalValue = 0

      const lowStockProducts: any[] = []
      const expiringProducts: any[] = []

      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      products.forEach((product: any) => {
        const stockQuantities = Array.isArray(product?.stockQuantities) ? product.stockQuantities : []
        const productStock = stockQuantities.reduce((sum: number, entry: any) => sum + (entry?.quantity || 0), 0)
        totalStock += productStock

        const unitPrice = Number(product?.price || 0)
        totalValue += productStock * unitPrice

        const reorderThreshold = Number(product?.reorderThreshold || product?.reorder_threshold || 0)
        if (productStock > 0 && reorderThreshold > 0 && productStock <= reorderThreshold) {
          lowStockProducts.push({
            ...product,
            computedStock: productStock,
            reorderThreshold,
          })
        }

        const expiryDate = product?.expiryDate || product?.expiry_date
        if (expiryDate) {
          const expiry = new Date(expiryDate)
          if (!Number.isNaN(expiry.getTime()) && expiry >= now && expiry <= sevenDaysFromNow) {
            expiringProducts.push({
              ...product,
              computedStock: productStock,
              expiryDate: expiry.toISOString(),
            })
          }
        }
      })

      setInventorySummary({
        totalProducts: products.length,
        totalStock,
        totalValue,
        lowStockCount: lowStockProducts.length,
        expiringCount: expiringProducts.length,
        products,
        lowStockProducts: lowStockProducts.slice(0, 5),
        expiringProducts: expiringProducts.slice(0, 5),
      })
    } catch (error) {
      console.error("Inventory summary error:", error)
      toast.error("Unable to load inventory summary. Showing placeholders.")
      setInventorySummary((prev) => ({
        ...prev,
        products: [],
        lowStockProducts: [],
        expiringProducts: [],
      }))
    }
  }

  const fetchAssetsData = async (options?: { page?: number; status?: string }) => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }

    try {
      setAssetsLoading(true)
      const targetPage = options?.page ?? assetMeta.page ?? 1
      const status = options?.status ?? assetFilters.status

      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
      })

      if (status !== "all") {
        params.append("status", status)
      }

      const response = await fetch(`/api/v1/mcc/assets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.statusText}`)
      }

      const data = await response.json()
      const records = Array.isArray(data?.data) ? (data.data as AssetRecord[]) : []

      setAssets(records)
      setAssetMeta({
        page: data?.meta?.page ?? targetPage,
        totalPages: data?.meta?.totalPages ?? 1,
        total: data?.meta?.total ?? records.length,
      })
    } catch (error) {
      console.error("Assets fetch error:", error)
      toast.error("Unable to load assets.")
      setAssets([])
      setAssetMeta((prev) => ({ ...prev, total: 0 }))
    } finally {
      setAssetsLoading(false)
    }
  }

  const fetchAssetSummary = async () => {
    if (!token) return

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [totalRes, availableRes, rentedRes, maintenanceRes] = await Promise.all([
        fetch("/api/v1/mcc/assets?limit=1&page=1", { headers }),
        fetch("/api/v1/mcc/assets?status=available&limit=1&page=1", { headers }),
        fetch("/api/v1/mcc/assets?status=rented&limit=1&page=1", { headers }),
        fetch("/api/v1/mcc/assets?status=maintenance&limit=1&page=1", { headers }),
      ])

      const totalData = await totalRes.json()
      const availableData = await availableRes.json()
      const rentedData = await rentedRes.json()
      const maintenanceData = await maintenanceRes.json()

      setAssetSummary({
        total: totalData?.meta?.total ?? 0,
        available: availableData?.meta?.total ?? 0,
        rented: rentedData?.meta?.total ?? 0,
        maintenance: maintenanceData?.meta?.total ?? 0,
      })
    } catch (error) {
      console.error("Asset summary error:", error)
      setAssetSummary({ total: 0, available: 0, rented: 0, maintenance: 0 })
    }
  }

  const fetchRentalsData = async (options?: { page?: number; status?: string }) => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }

    try {
      setRentalsLoading(true)
      const targetPage = options?.page ?? rentalMeta.page ?? 1
      const status = options?.status ?? rentalFilters.status

      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
      })

      if (mccId) {
        params.append("mccId", String(mccId))
      }
      if (status === "active") {
        params.append("returned", "false")
      } else if (status === "returned") {
        params.append("returned", "true")
      }

      const response = await fetch(`/api/v1/mcc/rentals?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch rentals: ${response.statusText}`)
      }

      const data = await response.json()
      const records = Array.isArray(data?.data) ? (data.data as RentalRecord[]) : []

      setRentals(records)
      setRentalMeta({
        page: data?.meta?.page ?? targetPage,
        totalPages: data?.meta?.totalPages ?? 1,
        total: data?.meta?.total ?? records.length,
      })
    } catch (error) {
      console.error("Rentals fetch error:", error)
      toast.error("Unable to load rentals.")
      setRentals([])
      setRentalMeta((prev) => ({ ...prev, total: 0 }))
    } finally {
      setRentalsLoading(false)
    }
  }

  const fetchRentalSummary = async () => {
    if (!token) return

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const params = new URLSearchParams({ limit: "1", page: "1" })
      if (mccId) params.append("mccId", String(mccId))

      const [totalRes, activeRes, returnedRes] = await Promise.all([
        fetch(`/api/v1/mcc/rentals?${params.toString()}`, { headers }),
        fetch(`/api/v1/mcc/rentals?${params.toString()}&returned=false`, { headers }),
        fetch(`/api/v1/mcc/rentals?${params.toString()}&returned=true`, { headers }),
      ])

      const totalData = await totalRes.json()
      const activeData = await activeRes.json()
      const returnedData = await returnedRes.json()

      const activeCount = activeData?.meta?.total ?? 0
      const rentalsRecords = Array.isArray(activeData?.data) ? (activeData.data as RentalRecord[]) : []
      const overdueCount = rentalsRecords.filter((rental) => {
        if (!rental?.rentEnd || rental.returned) return false
        const rentEndDate = new Date(rental.rentEnd)
        return !Number.isNaN(rentEndDate.getTime()) && rentEndDate.getTime() < Date.now()
      }).length

      const requestsCount = rentalsRecords.filter(
        (rental) =>
          !rental.returned &&
          (!rental.rentStart || rental.status === "requested" || rental.status === "pending" || rental.requestedAssetType)
      ).length

      setRentalSummary({
        total: totalData?.meta?.total ?? 0,
        active: activeCount,
        returned: returnedData?.meta?.total ?? 0,
        overdue: overdueCount,
        requests: requestsCount,
      })
    } catch (error) {
      console.error("Rental summary error:", error)
      setRentalSummary({ total: 0, active: 0, returned: 0, overdue: 0, requests: 0 })
    }
  }

  const fetchEquipmentRequests = async () => {
    if (!token) return

    try {
      setRequestsLoading(true)
      const params = new URLSearchParams({
        limit: "50",
        page: "1",
      })
      if (mccId) params.append("mccId", String(mccId))

      const response = await fetch(`/api/v1/mcc/rentals?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch equipment requests")
      }

      const data = await response.json()
      const records = Array.isArray(data?.data) ? (data.data as RentalRecord[]) : []

      const pendingRequests = records.filter((rental) => {
        const hasExplicitRequestStatus =
          rental.status === "requested" || rental.status === "pending" || rental.status === "awaiting_approval"
        const hasNoStartDate = !rental.rentStart
        const hasNoFarmer = !rental.farmerId
        const hasPlaceholderAsset =
          !rental.assetId ||
          (rental.asset?.status && rental.asset.status.toLowerCase() === "pending") ||
          rental.asset?.assetType === "REQUESTED"
        return !rental.returned && (hasExplicitRequestStatus || hasNoStartDate || hasNoFarmer || hasPlaceholderAsset)
      })

      setEquipmentRequests(pendingRequests)
      setRentalSummary((prev) => ({
        ...prev,
        requests: pendingRequests.length,
      }))
    } catch (error) {
      console.error("Equipment request fetch error:", error)
      setEquipmentRequests([])
      setRentalSummary((prev) => ({
        ...prev,
        requests: 0,
      }))
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchFarmersAndAvailableAssets = async () => {
    if (!token) return

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const farmersParams = new URLSearchParams({ limit: "100" })
      if (mccId) farmersParams.append("mccId", String(mccId))

      const [farmersRes, assetsRes] = await Promise.all([
        fetch(`/api/v1/mcc/farmers?${farmersParams.toString()}`, { headers }),
        fetch("/api/v1/mcc/assets?status=available&limit=100&page=1", { headers }),
      ])

      if (farmersRes.ok) {
        const farmersData = await farmersRes.json()
        const farmerList = Array.isArray(farmersData?.data) ? farmersData.data : []
        setFarmers(farmerList)
      } else {
        setFarmers([])
      }

      if (assetsRes.ok) {
        const assetsData = await assetsRes.json()
        const rawList = Array.isArray(assetsData?.data) ? assetsData.data : []
        const availableList = rawList.filter((a: AssetRecord) => a.rentable !== false)
        setAvailableAssets(availableList)
      } else {
        setAvailableAssets([])
      }
    } catch (error) {
      console.error("Fetch farmers/assets error:", error)
      setFarmers([])
      setAvailableAssets([])
    }
  }

  // Warehouse Hub - Fetch functions
  const fetchWarehouses = async () => {
    if (!token) return
    try {
      const response = await fetch("/api/v1/inventory/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setWarehouses(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Fetch warehouses error:", error)
    }
  }

  const fetchLocations = async (warehouseId?: string) => {
    if (!token) return
    try {
      const url = warehouseId
        ? `/api/v1/inventory/locations?warehouseId=${warehouseId}`
        : "/api/v1/inventory/locations"
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLocations(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Fetch locations error:", error)
    }
  }

  const fetchProducts = async () => {
    if (!token) return
    try {
      setProductsLoading(true)
      const response = await fetch("/api/v1/inventory/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Fetch products error:", error)
      toast.error("Failed to load products")
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchStockQuantities = async (filters?: { warehouseId?: string; locationId?: string; productId?: string }) => {
    if (!token) return
    try {
      const params = new URLSearchParams()
      if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId)
      if (filters?.locationId) params.append("locationId", filters.locationId)
      if (filters?.productId) params.append("productId", filters.productId)

      const response = await fetch(`/api/v1/inventory/stock?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStockQuantities(Array.isArray(data?.data) ? data.data : [])
      }
    } catch (error) {
      console.error("Fetch stock quantities error:", error)
    }
  }

  const handleCreateProduct = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }

    if (!newProductForm.name.trim()) {
      toast.error("Product name is required")
      return
    }

    try {
      const response = await fetch("/api/v1/inventory/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProductForm.name,
          sku: newProductForm.sku || undefined,
          description: newProductForm.description || undefined,
          category: newProductForm.category || undefined,
          price: newProductForm.price ? parseFloat(newProductForm.price) : 0,
          costPrice: newProductForm.costPrice ? parseFloat(newProductForm.costPrice) : undefined,
          unitOfMeasure: newProductForm.unitOfMeasure,
          warehouseId: newProductForm.warehouseId || undefined,
          locationId: newProductForm.locationId || undefined,
          reorderPoint: newProductForm.reorderPoint ? parseInt(newProductForm.reorderPoint) : undefined,
          stock: newProductForm.stock ? parseInt(newProductForm.stock) : 0,
          inventoryType: "MCC",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to create product")
      }

      toast.success("Product created successfully")
      setProductDialogOpen(false)
      setNewProductForm({
        name: "",
        sku: "",
        description: "",
        category: "",
        price: "",
        costPrice: "",
        unitOfMeasure: "Units",
        warehouseId: "",
        locationId: "",
        reorderPoint: "",
        stock: "0",
      })
      await Promise.all([fetchProducts(), fetchStockQuantities(), fetchInventorySummary()])
    } catch (error) {
      console.error("Create product error:", error)
      toast.error(error instanceof Error ? error.message : "Unable to create product")
    }
  }

  const handleRefreshAll = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }
    setInitializing(true)
    await Promise.all([
      fetchInventorySummary(),
      fetchAssetsData({ page: 1 }),
      fetchAssetSummary(),
      fetchRentalsData({ page: 1 }),
      fetchRentalSummary(),
      fetchEquipmentRequests(),
      fetchFarmersAndAvailableAssets(),
      fetchWarehouses(),
      fetchLocations(),
      fetchProducts(),
      fetchStockQuantities(),
    ])
    setInitializing(false)
  }

  const handleAssetSubmit = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }

    if (!newAssetForm.serial.trim() || !newAssetForm.assetType.trim()) {
      toast.error("Serial number and asset type are required.")
      return
    }

    setAssetSaveLoading(true)
    try {
      const response = await fetch("/api/v1/mcc/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial: newAssetForm.serial.trim(),
          name: newAssetForm.name.trim() || null,
          assetType: newAssetForm.assetType,
          purchasedAt: newAssetForm.purchasedAt ? new Date(newAssetForm.purchasedAt).toISOString() : null,
          notes: newAssetForm.notes.trim() || null,
          rentable: newAssetForm.rentable,
          ...((() => {
            const typeSpecs = ASSET_TYPE_SPECS[newAssetForm.assetType] || []
            let capacityLiters: number | null = null
            const specifications: Record<string, string | number> = {}
            for (const field of typeSpecs) {
              const raw = newAssetForm.specValues[field.key]?.trim()
              if (!raw) continue
              if (field.useForCapacityLiters && field.type === "number") {
                const n = parseFloat(raw)
                if (!Number.isNaN(n)) capacityLiters = n
                continue
              }
              if (field.key === "weightKg") continue
              if (field.type === "number") {
                const n = parseFloat(raw)
                if (!Number.isNaN(n)) specifications[field.key] = n
              } else {
                specifications[field.key === "dimensions" ? "measurements" : field.key] = raw
              }
            }
            const weightRaw = newAssetForm.specValues.weightKg?.trim()
            const weightKg = weightRaw && !Number.isNaN(parseFloat(weightRaw)) ? parseFloat(weightRaw) : null
            return {
              weightKg,
              capacityLiters: capacityLiters ?? null,
              ...(Object.keys(specifications).length > 0 ? { specifications } : {}),
            }
          })()),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to create asset")
      }

      toast.success("Asset added successfully.")
      setAssetDialogOpen(false)
      setNewAssetForm({
        serial: "",
        name: "",
        assetType: "",
        purchasedAt: "",
        notes: "",
        rentable: true,
        specValues: {},
      })
      await Promise.all([fetchAssetsData({ page: 1 }), fetchAssetSummary(), fetchFarmersAndAvailableAssets()])
    } catch (error) {
      console.error("Asset creation error:", error)
      toast.error(error instanceof Error ? error.message : "Unable to create asset.")
    } finally {
      setAssetSaveLoading(false)
    }
  }

  const handleRentalSubmit = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }

    if (!newRentalForm.assetId || !newRentalForm.farmerId) {
      toast.error("Asset and farmer are required.")
      return
    }

    try {
      const response = await fetch("/api/v1/mcc/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetId: newRentalForm.assetId,
          farmerId: newRentalForm.farmerId,
          mccId,
          rentStart: newRentalForm.rentStart || null,
          rentEnd: newRentalForm.rentEnd || null,
          rentFeePerDay: newRentalForm.rentFeePerDay ? Number(newRentalForm.rentFeePerDay) : 0,
          deposit: newRentalForm.deposit ? Number(newRentalForm.deposit) : 0,
          contractDoc: newRentalForm.contractDoc || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to create rental")
      }

      toast.success("Rental issued successfully.")
      setRentalDialogOpen(false)
      setNewRentalForm({
        assetId: "",
        farmerId: "",
        rentStart: "",
        rentEnd: "",
        rentFeePerDay: "",
        deposit: "",
        contractDoc: "",
      })
    await Promise.all([
        fetchAssetsData({ page: 1 }),
        fetchAssetSummary(),
        fetchRentalsData({ page: 1 }),
        fetchRentalSummary(),
      fetchEquipmentRequests(),
        fetchFarmersAndAvailableAssets(),
      ])
    } catch (error) {
      console.error("Rental creation error:", error)
      toast.error(error instanceof Error ? error.message : "Unable to create rental.")
    }
  }

  const handleReturnSubmit = async () => {
    if (!token) {
      toast.error("Authentication token missing. Please login again.")
      return
    }

    if (!returnForm.rentalId) {
      toast.error("Select a rental to return.")
      return
    }

    try {
      const response = await fetch(`/api/v1/mcc/rentals/${returnForm.rentalId}/return`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          condition: returnForm.condition,
          notes: returnForm.notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Failed to return rental")
      }

      toast.success("Rental marked as returned.")
      setReturnDialogOpen(false)
      setReturnForm({
        rentalId: "",
        condition: "good",
        notes: "",
      })
    await Promise.all([
        fetchAssetsData({ page: assetMeta.page }),
        fetchAssetSummary(),
        fetchRentalsData({ page: rentalMeta.page }),
        fetchRentalSummary(),
      fetchEquipmentRequests(),
        fetchFarmersAndAvailableAssets(),
      ])
    } catch (error) {
      console.error("Return rental error:", error)
      toast.error(error instanceof Error ? error.message : "Unable to return rental.")
    }
  }

  useEffect(() => {
    if (!user) return
    handleRefreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (selectedWarehouse) {
      fetchLocations(selectedWarehouse)
    } else {
      fetchLocations()
    }
  }, [selectedWarehouse, token])

  useEffect(() => {
    if (productDialogOpen) {
      fetchWarehouses()
      if (selectedWarehouse) {
        fetchLocations(selectedWarehouse)
      }
    }
  }, [productDialogOpen, selectedWarehouse, token])

  const filteredAssets = useMemo(() => {
    if (!assetFilters.search.trim()) return assets
    const searchValue = assetFilters.search.toLowerCase()
    return assets.filter((asset) => {
      return (
        asset.serial.toLowerCase().includes(searchValue) ||
        (asset.name || "").toLowerCase().includes(searchValue) ||
        (asset.assetType || "").toLowerCase().includes(searchValue)
      )
    })
  }, [assets, assetFilters.search])

  const filteredRentals = useMemo(() => {
    if (!rentalFilters.search.trim()) return rentals
    const searchValue = rentalFilters.search.toLowerCase()
    return rentals.filter((rental) => {
      return (
        rental.asset?.serial?.toLowerCase().includes(searchValue) ||
        rental.asset?.name?.toLowerCase().includes(searchValue) ||
        rental.farmer?.name?.toLowerCase().includes(searchValue) ||
        rental.farmer?.farmerCode?.toLowerCase().includes(searchValue)
      )
    })
  }, [rentals, rentalFilters.search])

  const pageTitle = "Inventory & Rentals"
  const pageSubtitle = "Track milk inventory, equipment assets, and rental contracts in one place"

  const isLoading = initializing || assetsLoading || rentalsLoading

  if (!fromWarehouses && !embedTabProp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-gray-600">Redirecting to Warehouses…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700">You must be signed in to view this page.</h2>
          <p className="text-gray-500">Please log in and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={isEmbedMode ? "space-y-6" : "inventory-rentals-page min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40"}>
      {!isEmbedMode && (
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-purple-400/10 blur-3xl" />
            <div className="absolute bottom-[-160px] left-[-160px] h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-blue-400/5 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto w-full px-0 py-10">
            <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-1.5 shadow-sm ring-1 ring-gray-200">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    MCC Manager • Assets & Inventory
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{pageTitle}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{pageSubtitle}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setAssetDialogOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <Package className="h-4 w-4" />
                    Add Asset
                  </Button>
                  <Button
                    onClick={() => {
                      fetchFarmersAndAvailableAssets()
                      setRentalDialogOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30"
                  >
                    <Truck className="h-4 w-4" />
                    Issue Rental
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefreshAll}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-md disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </header>
          </div>
        </div>
      )}

      <div className={isEmbedMode ? "w-full" : "relative z-10 mx-auto w-full px-0 py-10"}>
        {/* Main Content with Tabs */}
        <Tabs value={isEmbedMode ? tabToShow : activeTab} onValueChange={isEmbedMode ? () => {} : setActiveTab} className="w-full">
          {!isEmbedMode && (
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm mb-6">
              <TabsTrigger value="warehouse-hub" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-sm font-semibold py-2.5">
                <Warehouse className="h-4 w-4 mr-2" />
                Products & inventory
              </TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-sm font-semibold py-2.5">
                <Box className="h-4 w-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="rentals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-sm font-semibold py-2.5">
                <Truck className="h-4 w-4 mr-2" />
                Rentals
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-sm font-semibold py-2.5">
                <ClipboardList className="h-4 w-4 mr-2" />
                Requests
              </TabsTrigger>
            </TabsList>
          )}

            {/* Products & inventory Tab */}
            <TabsContent value="warehouse-hub" className="space-y-6">
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Products & inventory</h2>
              <p className="text-sm text-gray-600">
                      Manage products, inventory, and stock quantities across warehouses and locations
                    </p>
                  </div>
                  <Button
                    onClick={() => setProductDialogOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:from-violet-700 hover:to-purple-700 hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
            </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-blue-600">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                      <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </CardContent>
            </Card>
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-cyan-600">Warehouses</CardTitle>
              </CardHeader>
              <CardContent>
                      <p className="text-3xl font-bold text-gray-900">{warehouses.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-emerald-600">Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">{locations.length}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-violet-600">Stock Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">{stockQuantities.length}</p>
                    </CardContent>
                  </Card>
                    </div>

                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="search">Search Products</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="search"
                            placeholder="Search by name, SKU..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            style={{
                              borderRadius: '0.75rem',
                              border: '1px solid #bfdbfe',
                              backgroundColor: 'white',
                              fontSize: '0.875rem',
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s',
                              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                              width: '100%',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#60a5fa'
                              e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#bfdbfe'
                              e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                          />
                    </div>
                  </div>
                    <div>
                        <Label htmlFor="warehouse-filter">Filter by Warehouse</Label>
                        <Select 
                          value={selectedWarehouse || undefined} 
                          onValueChange={(value) => {
                            setSelectedWarehouse(value)
                            setSelectedLocation("") // Reset location when warehouse changes
                            fetchStockQuantities({ warehouseId: value || undefined })
                          }}
                        >
                          <SelectTrigger 
                            id="warehouse-filter"
                            style={{
                              borderRadius: '0.75rem',
                              border: '1px solid #bfdbfe',
                              backgroundColor: 'white',
                              fontSize: '0.875rem',
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s',
                              padding: '0.5rem 0.75rem',
                              width: '100%',
                            }}
                          >
                            <SelectValue placeholder="All Warehouses" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((wh) => (
                              <SelectItem key={wh.id} value={wh.id}>
                                {wh.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="location-filter">Filter by Location</Label>
                        <Select 
                          value={selectedLocation || undefined} 
                          onValueChange={(value) => {
                            setSelectedLocation(value)
                            fetchStockQuantities({ 
                              warehouseId: selectedWarehouse || undefined,
                              locationId: value || undefined 
                            })
                          }}
                          disabled={!selectedWarehouse}
                        >
                          <SelectTrigger 
                            id="location-filter"
                            style={{
                              borderRadius: '0.75rem',
                              border: '1px solid #bfdbfe',
                              backgroundColor: 'white',
                              fontSize: '0.875rem',
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s',
                              padding: '0.5rem 0.75rem',
                              width: '100%',
                              opacity: !selectedWarehouse ? 0.6 : 1,
                            }}
                          >
                            <SelectValue placeholder={selectedWarehouse ? "All Locations" : "Select warehouse first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {locations
                              .filter((loc) => !selectedWarehouse || loc.warehouseId === selectedWarehouse)
                              .map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                    </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setProductSearch("")
                            setSelectedWarehouse("")
                            setSelectedLocation("")
                            fetchStockQuantities()
                          }}
                          className="w-full"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Filters
                        </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

                {/* Products Table */}
                <Card className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-white to-violet-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Box className="h-5 w-5 text-violet-600" />
                          Products Inventory
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Products stored in warehouses with location tracking • {products.length} total products
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full border-violet-200 bg-white text-xs font-semibold text-violet-600">
                        {products.filter((p) => {
                          if (productSearch) {
                            const search = productSearch.toLowerCase()
                            return (
                              p.name?.toLowerCase().includes(search) ||
                              p.sku?.toLowerCase().includes(search)
                            )
                          }
                          return true
                        }).length} visible
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {productsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-violet-50/70">
                            <TableRow>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Product
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                SKU
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Category
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Price
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Warehouse
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Location
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Stock Qty
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-violet-700">
                                Available
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products
                              .filter((product) => {
                                if (productSearch) {
                                  const search = productSearch.toLowerCase()
                                  return (
                                    product.name?.toLowerCase().includes(search) ||
                                    product.sku?.toLowerCase().includes(search) ||
                                    product.description?.toLowerCase().includes(search)
                                  )
                                }
                                return true
                              })
                              .map((product) => {
                                const stockQty = stockQuantities.find(
                                  (sq) => sq.productId === product.id
                                )
                                const warehouse = warehouses.find(
                                  (wh) => wh.id === stockQty?.warehouseId
                                )
                                const location = locations.find(
                                  (loc) => loc.id === stockQty?.locationId
                                )
                                const totalStock = stockQty?.quantity || 0
                                const availableStock = stockQty?.availableQuantity || 0
                                return (
                                  <TableRow key={product.id} className="hover:bg-violet-50/30 transition-colors">
                                    <TableCell className="whitespace-nowrap py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600">
                                          <Box className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-sm font-semibold text-gray-900">
                                            {product.name || "Unnamed Product"}
                                          </p>
                                          {product.description && (
                                            <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                              {product.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      {product.sku ? (
                                        <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                          {product.sku}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      {product.category ? (
                                        <Badge variant="outline" className="rounded-full border-gray-200 bg-gray-50 text-xs font-medium text-gray-700">
                                          {product.category}
                                        </Badge>
                                      ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      <span className="text-sm font-semibold text-gray-900">
                                        RF {Number(product.price || 0).toLocaleString()}
                                      </span>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      {warehouse ? (
                                        <div className="flex items-center gap-2">
                                          <Warehouse className="h-3.5 w-3.5 text-cyan-500" />
                                          <span className="text-sm text-gray-700">{warehouse.name}</span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      {location ? (
                                        <div className="flex items-center gap-2">
                                          <Package className="h-3.5 w-3.5 text-blue-500" />
                                          <span className="text-sm text-gray-700">{location.name}</span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      <Badge
                                        className={cn(
                                          "rounded-full px-3 py-1 text-xs font-semibold",
                                          totalStock > 0
                                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                                            : "bg-gray-100 text-gray-600 border border-gray-200"
                                        )}
                                      >
                                        {totalStock.toLocaleString()}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap py-4">
                                      <Badge
                                        className={cn(
                                          "rounded-full px-3 py-1 text-xs font-semibold",
                                          availableStock > 0
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            : "bg-rose-50 text-rose-600 border border-rose-200"
                                        )}
                                      >
                                        {availableStock.toLocaleString()}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            {products.filter((p) => {
                              if (productSearch) {
                                const search = productSearch.toLowerCase()
                                return (
                                  p.name?.toLowerCase().includes(search) ||
                                  p.sku?.toLowerCase().includes(search)
                                )
                              }
                              return true
                            }).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-16">
                                  <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                                    <Box className="h-12 w-12 text-gray-300" />
                                    <div>
                                      <p className="text-lg font-semibold text-gray-700">No products found</p>
                                      <p className="text-sm text-gray-500">
                                        {productSearch
                                          ? `No products match "${productSearch}". Try a different search term.`
                                          : "Add products to see them listed here."}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stock Quantities Table */}
                <Card className="mt-6 overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-white to-cyan-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Package className="h-5 w-5 text-cyan-600" />
                          Stock Quantities by Warehouse & Location
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Real-time stock tracking per warehouse and location • {stockQuantities.length} stock entries
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full border-cyan-200 bg-white text-xs font-semibold text-cyan-600">
                        {stockQuantities.length} entries
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-cyan-50/70">
                          <TableRow>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Product
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Warehouse
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Location
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Total Qty
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Reserved
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Available
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              Last Updated
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockQuantities.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-16">
                                <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                                  <Package className="h-12 w-12 text-gray-300" />
                                  <div>
                                    <p className="text-lg font-semibold text-gray-700">No stock quantities found</p>
                                    <p className="text-sm text-gray-500">
                                      Add products to see inventory data tracked by warehouse and location.
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            stockQuantities.map((sq) => {
                              const product = products.find((p) => p.id === sq.productId)
                              const warehouse = warehouses.find((w) => w.id === sq.warehouseId)
                              const location = locations.find((l) => l.id === sq.locationId)
                              const totalQty = sq.quantity || 0
                              const reservedQty = sq.reservedQuantity || 0
                              const availableQty = sq.availableQuantity || 0
                              return (
                                <TableRow key={sq.id} className="hover:bg-cyan-50/30 transition-colors">
                                  <TableCell className="whitespace-nowrap py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600">
                                        <Box className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                          {product?.name || "Unknown Product"}
                                        </p>
                                        {product?.sku && (
                                          <p className="text-xs text-gray-500 font-mono">
                                            {product.sku}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    {warehouse ? (
                                      <div className="flex items-center gap-2">
                                        <Warehouse className="h-3.5 w-3.5 text-cyan-500" />
                                        <span className="text-sm text-gray-700">{warehouse.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    {location ? (
                                      <div className="flex items-center gap-2">
                                        <Package className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-sm text-gray-700">{location.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    <Badge
                                      className={cn(
                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                        totalQty > 0
                                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                                          : "bg-gray-100 text-gray-600 border border-gray-200"
                                      )}
                                    >
                                      {totalQty.toLocaleString()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    <Badge
                                      className={cn(
                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                        reservedQty > 0
                                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                                          : "bg-gray-100 text-gray-600 border border-gray-200"
                                      )}
                                    >
                                      {reservedQty.toLocaleString()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    <Badge
                                      className={cn(
                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                        availableQty > 0
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                          : "bg-rose-50 text-rose-600 border border-rose-200"
                                      )}
                                    >
                                      {availableQty.toLocaleString()}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4 text-xs text-gray-600">
                                    {sq.lastUpdated ? (
                                      <div className="space-y-0.5">
                                        <span className="font-medium text-gray-900">
                                          {new Date(sq.lastUpdated).toLocaleDateString()}
                                        </span>
                                        <div className="text-[10px] text-gray-400">
                                          {new Date(sq.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Add Product Dialog */}
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-blue-100 bg-white shadow-2xl">
                  <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add New Product
                    </DialogTitle>
                    <DialogDescription>
                      Create a new product and assign it to a warehouse and location
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="product-name">Product Name *</Label>
                      <Input
                        id="product-name"
                        value={newProductForm.name}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, name: e.target.value })
                        }
                        placeholder="Enter product name"
                        style={{
                          borderRadius: '0.75rem',
                          border: '1px solid #bfdbfe',
                          backgroundColor: 'white',
                          fontSize: '0.875rem',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s',
                          padding: '0.5rem 0.75rem',
                          width: '100%',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#60a5fa'
                          e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#bfdbfe'
                          e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      />
                        </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="product-sku">SKU</Label>
                        <Input
                          id="product-sku"
                          value={newProductForm.sku}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, sku: e.target.value })
                          }
                          placeholder="Product SKU"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        </div>
                      <div>
                        <Label htmlFor="product-category">Category</Label>
                        <Input
                          id="product-category"
                          value={newProductForm.category}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, category: e.target.value })
                          }
                          placeholder="Product category"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        value={newProductForm.description}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, description: e.target.value })
                        }
                        placeholder="Product description"
                        rows={3}
                        style={{
                          borderRadius: '0.75rem',
                          border: '1px solid #bfdbfe',
                          backgroundColor: 'white',
                          fontSize: '0.875rem',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s',
                          padding: '0.5rem 0.75rem',
                          width: '100%',
                          resize: 'vertical',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#60a5fa'
                          e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#bfdbfe'
                          e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      />
                        </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                        <Label htmlFor="product-price">Price *</Label>
                        <Input
                          id="product-price"
                          type="number"
                          value={newProductForm.price}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, price: e.target.value })
                          }
                          placeholder="0.00"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        </div>
                      <div>
                        <Label htmlFor="product-cost">Cost Price</Label>
                        <Input
                          id="product-cost"
                          type="number"
                          value={newProductForm.costPrice}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, costPrice: e.target.value })
                          }
                          placeholder="0.00"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-unit">Unit of Measure</Label>
                        <Input
                          id="product-unit"
                          value={newProductForm.unitOfMeasure}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, unitOfMeasure: e.target.value })
                          }
                          placeholder="Units"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                    </div>
                      </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-warehouse">Warehouse</Label>
                        <Select
                          value={newProductForm.warehouseId}
                          onValueChange={(value) => {
                            setNewProductForm({ ...newProductForm, warehouseId: value, locationId: "" })
                            fetchLocations(value)
                          }}
                        >
                          <SelectTrigger 
                            id="product-warehouse" 
                            style={{
                              borderRadius: '0.75rem',
                              border: '1px solid #bfdbfe',
                              backgroundColor: 'white',
                              fontSize: '0.875rem',
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s',
                              padding: '0.5rem 0.75rem',
                              width: '100%',
                            }}
                          >
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((wh) => (
                              <SelectItem key={wh.id} value={wh.id}>
                                {wh.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="product-location">Location</Label>
                        <Select
                          value={newProductForm.locationId}
                          onValueChange={(value) =>
                            setNewProductForm({ ...newProductForm, locationId: value })
                          }
                          disabled={!newProductForm.warehouseId}
                        >
                          <SelectTrigger 
                            id="product-location"
                            style={{
                              borderRadius: '0.75rem',
                              border: '1px solid #bfdbfe',
                              backgroundColor: 'white',
                              fontSize: '0.875rem',
                              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s',
                              padding: '0.5rem 0.75rem',
                              width: '100%',
                            }}
                          >
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations
                              .filter((loc) => loc.warehouseId === newProductForm.warehouseId)
                              .map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-reorder">Reorder Point</Label>
                        <Input
                          id="product-reorder"
                          type="number"
                          value={newProductForm.reorderPoint}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, reorderPoint: e.target.value })
                          }
                          placeholder="10"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        </div>
                        <div>
                        <Label htmlFor="product-stock">Initial Stock</Label>
                        <Input
                          id="product-stock"
                          type="number"
                          value={newProductForm.stock}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, stock: e.target.value })
                          }
                          placeholder="0"
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #bfdbfe',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s',
                            padding: '0.5rem 0.75rem',
                            width: '100%',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#60a5fa'
                            e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#bfdbfe'
                            e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        </div>
                      </div>
                    </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProduct} disabled={productsLoading}>
                      {productsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Product
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-6">
              {/* Summary Cards */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Inventory Value
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      RF {inventorySummary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Factory className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    <strong className="font-semibold text-gray-900">{inventorySummary.totalProducts}</strong> products
                  </span>
                  <span>
                    <strong className="font-semibold text-gray-900">{inventorySummary.totalStock.toLocaleString()}</strong> units
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {inventorySummary.lowStockCount} low stock
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-slate-200/60 via-slate-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Equipment Assets
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{assetSummary.total}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <Box className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Available{" "}
                    <strong className="font-semibold text-emerald-600">{assetSummary.available}</strong>
                  </span>
                  <span>
                    Rented{" "}
                    <strong className="font-semibold text-blue-600">{assetSummary.rented}</strong>
                  </span>
                  <span>
                    Maintenance{" "}
                    <strong className="font-semibold text-orange-600">{assetSummary.maintenance}</strong>
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      Active Rentals
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{rentalSummary.active}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <Truck className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Total{" "}
                    <strong className="font-semibold text-gray-900">{rentalSummary.total}</strong>
                  </span>
                  <span>
                    Returned{" "}
                    <strong className="font-semibold text-slate-700">{rentalSummary.returned}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {rentalSummary.overdue} overdue
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {rentalSummary.requests} requests
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-indigo-100/60 via-purple-100/30 to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                      Quick Insights
                    </CardTitle>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{inventorySummary.expiringCount}</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <Clock className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    Expiring soon{" "}
                    <strong className="font-semibold text-indigo-600">{inventorySummary.expiringCount}</strong>
                  </span>
                  <span>
                    Low stock{" "}
                    <strong className="font-semibold text-orange-600">{inventorySummary.lowStockCount}</strong>
                  </span>
                  <span>
                    Updated {formatDateTime(new Date().toISOString())}
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

              {/* Assets Table Section */}
              <section className="mt-12 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Equipment Assets</h2>
                    <p className="text-sm text-gray-600">
                      Manage MCC-owned equipment, monitor usage, and plan maintenance.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search by serial, name, or type..."
                        value={assetFilters.search}
                        onChange={(event) => setAssetFilters((prev) => ({ ...prev, search: event.target.value }))}
                        style={{
                          borderRadius: '0.75rem',
                          border: '1px solid #bfdbfe',
                          backgroundColor: 'white',
                          fontSize: '0.875rem',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s',
                          padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                          width: '100%',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#60a5fa'
                          e.target.style.boxShadow = '0 0 0 2px #cfe0ff'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#bfdbfe'
                          e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                      />
                    </div>
                    <Select
                      value={assetFilters.status}
                      onValueChange={(value) => {
                        setAssetFilters((prev) => ({ ...prev, status: value }))
                        fetchAssetsData({ page: 1, status: value })
                      }}
                    >
                      <SelectTrigger
                        style={{
                          borderRadius: '0.75rem',
                          border: '1px solid #bfdbfe',
                          backgroundColor: 'white',
                          fontSize: '0.875rem',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                          transition: 'all 0.2s',
                          padding: '0.5rem 0.75rem',
                          width: '100%',
                        }}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <span className="inline-flex items-center gap-2 text-sm">
                            <Filter className="h-3.5 w-3.5 text-gray-500" />
                            All statuses
                          </span>
                        </SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Registered Assets</CardTitle>
                        <p className="text-sm text-gray-500">
                          {assetSummary.total} total assets • page {assetMeta.page} of {assetMeta.totalPages}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full border-blue-200 bg-white text-xs font-semibold text-blue-600">
                        {filteredAssets.length} visible
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredAssets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
                        <Package className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-lg font-semibold text-gray-700">No assets found</p>
                          <p className="text-sm text-gray-500">
                            {assetFilters.search
                              ? `No assets match "${assetFilters.search}".`
                              : "Add equipment assets to start tracking rentals and condition."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-blue-50/70">
                            <TableRow>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Asset
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Status
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Current Holder
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Purchased
                              </TableHead>
                              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Notes
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAssets.map((asset) => {
                              const activeRental = asset.rentals?.[0]
                              return (
                                <TableRow key={asset.id} className="hover:bg-gray-50/70">
                                  <TableCell className="whitespace-nowrap py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                                        <Package className="h-5 w-5" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-gray-900">
                                          {asset.name || "Untitled Asset"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Serial <span className="font-mono text-gray-700">{asset.serial}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                          {capitalize(asset.assetType)}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    <Badge
                                      className={cn(
                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                        asset.status === "available" && "bg-emerald-50 text-emerald-600",
                                        asset.status === "rented" && "bg-blue-50 text-blue-600",
                                        asset.status === "maintenance" && "bg-orange-50 text-orange-600",
                                        asset.status !== "available" &&
                                          asset.status !== "rented" &&
                                          asset.status !== "maintenance" &&
                                          "bg-gray-100 text-gray-600",
                                      )}
                                    >
                                      {capitalize(asset.status)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4">
                                    {activeRental?.farmer ? (
                                      <div className="space-y-1 text-xs text-gray-600">
                                        <div className="font-semibold text-gray-900">{activeRental.farmer.name}</div>
                                        <div className="flex items-center gap-1">
                                          <User className="h-3.5 w-3.5 text-gray-400" />
                                          {activeRental.farmer.phone || "No phone"}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                          <Calendar className="h-3.5 w-3.5" />
                                          Since {formatDate(activeRental.rentStart)}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs font-semibold text-emerald-600">Available</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap py-4 text-xs text-gray-600">
                                    {asset.purchasedAt ? formatDate(asset.purchasedAt) : "—"}
                                    {asset.createdAt ? (
                                      <div className="text-[10px] text-gray-400">
                                        Added {formatDate(asset.createdAt)}
                                      </div>
                                    ) : null}
                                  </TableCell>
                                  <TableCell className="max-w-xs py-4">
                                    <p className="text-xs text-gray-600 line-clamp-3">{asset.notes || "—"}</p>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>

                  {assetMeta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/40 px-6 py-4">
                      <p className="text-xs text-gray-500">
                        Showing {(assetMeta.page - 1) * 10 + 1}–
                        {Math.min(assetMeta.page * 10, assetMeta.total)} of {assetMeta.total}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          disabled={assetMeta.page === 1 || assetsLoading}
                          onClick={() => fetchAssetsData({ page: assetMeta.page - 1 })}
                        >
                          Previous
                        </Button>
                        <div className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600">
                          Page {assetMeta.page} / {assetMeta.totalPages}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          disabled={assetMeta.page === assetMeta.totalPages || assetsLoading}
                          onClick={() => fetchAssetsData({ page: assetMeta.page + 1 })}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </section>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              {/* Equipment Requests */}
              <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Equipment Requests</h2>
                    <p className="text-sm text-gray-600">
                      Review pending farmer requests before assigning equipment.
                    </p>
                  </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600">
                <ClipboardList className="h-4 w-4" />
                {requestsLoading ? "Loading…" : `${equipmentRequests.length} pending`}
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-white to-blue-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Pending Equipment Requests</CardTitle>
                    <p className="text-sm text-gray-500">
                      Farmers awaiting equipment assignments and approvals.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-blue-200 bg-white text-xs font-semibold text-blue-600"
                  >
                    {equipmentRequests.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {requestsLoading ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    Loading equipment requests…
                  </div>
                ) : equipmentRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-gray-500">
                    <ClipboardList className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No pending equipment requests</p>
                      <p className="text-sm text-gray-500">
                        Farmers will appear here once they request tractors, coolers, sprayers, or other assets.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-blue-50/70">
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Farmer
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Requested Asset
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Request Details
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipmentRequests.map((request) => (
                          <TableRow key={request.id} className="hover:bg-blue-50/30">
                            <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                              <div className="font-semibold text-gray-900">
                                {request.farmer?.name || "Unknown Farmer"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {request.farmer?.phone || "No phone"} • {request.farmer?.farmerCode || "No farmer code"}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                              <div className="font-semibold text-gray-900">
                                {request.asset?.name ||
                                  capitalize(request.asset?.assetType) ||
                                  capitalize(request.requestedAssetType) ||
                                  "Requested Equipment"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Request ID {request.id.slice(-6)}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                              <div className="text-xs text-gray-500">
                                Submitted:{" "}
                                <span className="font-semibold text-gray-900">
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Notes:{" "}
                                <span className="font-semibold text-gray-900">
                                  {request.contractDoc ? request.contractDoc.slice(0, 40) : "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  size="sm"
                                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
                                  onClick={() => {
                                    setNewRentalForm((prev) => ({
                                      ...prev,
                                      assetId: request.asset?.id || "",
                                      farmerId: request.farmer?.id || "",
                                      rentStart: "",
                                      rentEnd: "",
                                      rentFeePerDay: "",
                                      deposit: "",
                                      contractDoc: request.contractDoc || "",
                                    }))
                                    setRentalDialogOpen(true)
                                  }}
                                >
                                  Start Rental
                                </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                onClick={() => toast.info("Approval workflow coming soon")}
                              >
                                  Request Details
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Inventory Highlights */}
          <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="rounded-2xl border border-blue-100 bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Low Stock Alerts</CardTitle>
                  <p className="text-sm text-gray-500">Top items below reorder threshold</p>
                </div>
                <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600">
                  {inventorySummary.lowStockCount}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {inventorySummary.lowStockProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-6 text-center text-sm text-blue-500">
                    No low stock warnings at the moment.
                  </div>
                ) : (
                  inventorySummary.lowStockProducts.map((product: any) => (
                    <div
                      key={product?.id}
                      className="relative overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-b from-blue-100/60 via-blue-100/10 to-transparent" />
                      <div className="relative flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{product?.name || "Unnamed Product"}</h3>
                          <p className="text-xs text-gray-500">
                            Stock:{" "}
                            <span className="font-semibold text-blue-600">
                              {(product?.computedStock ?? 0).toLocaleString()}
                            </span>{" "}
                            • Reorder:{" "}
                            <span className="font-medium text-gray-600">
                              {(product?.reorderThreshold ?? product?.reorder_threshold ?? 0).toLocaleString()}
                            </span>
                          </p>
                        </div>
                        <Badge className="rounded-full bg-white text-xs font-semibold text-blue-600 shadow-sm">
                          {product?.pharmacyWarehouse?.name || "Warehouse"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-blue-100 bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Expiring Soon</CardTitle>
                  <p className="text-sm text-gray-500">Products approaching expiry in 7 days</p>
                </div>
                <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600">
                  {inventorySummary.expiringCount}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {inventorySummary.expiringProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-6 text-center text-sm text-blue-500">
                    No upcoming expiries detected.
                  </div>
                ) : (
                  inventorySummary.expiringProducts.map((product: any) => (
                    <div
                      key={product?.id}
                      className="relative overflow-hidden rounded-xl border border-blue-200 bg-blue-50/50 p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-b from-rose-100/60 via-rose-100/10 to-transparent" />
                      <div className="relative flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{product?.name || "Unnamed Product"}</h3>
                          <p className="text-xs text-gray-500">
                            Expires:{" "}
                            <span className="font-semibold text-rose-600">
                              {formatDate(product?.expiryDate || product?.expiry_date)}
                            </span>{" "}
                            • Stock:{" "}
                            <span className="font-medium text-gray-600">
                              {(product?.computedStock ?? 0).toLocaleString()}
                            </span>
                          </p>
                        </div>
                        <Badge className="rounded-full bg-white text-xs font-semibold text-rose-600 shadow-sm">
                          {product?.pharmacyWarehouse?.name || "Warehouse"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-blue-100 bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
                  <p className="text-sm text-gray-500">Keep assets and rentals up to date</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-blue-100 p-2">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-900">Add Asset</h3>
                      <p className="text-xs text-gray-500">
                        Register new equipment, assign categories, and track status changes.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        onClick={() => setAssetDialogOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New asset
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2">
                      <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-900">Issue Rental</h3>
                      <p className="text-xs text-gray-500">
                        Deploy equipment to farmers with customizable rental contracts and return tracking.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                        onClick={() => {
                          fetchFarmersAndAvailableAssets()
                          setRentalDialogOpen(true)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        New rental
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-indigo-100 p-2">
                      <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-900">Return Equipment</h3>
                      <p className="text-xs text-gray-500">
                        Quickly close rentals and update asset condition after inspection.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                        onClick={() => {
                          setReturnForm((prev) => ({
                            ...prev,
                            rentalId: rentals.find((r) => !r.returned)?.id || "",
                          }))
                          setReturnDialogOpen(true)
                        }}
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        Mark return
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
            </TabsContent>

            {/* Rentals Tab */}
            <TabsContent value="rentals" className="space-y-6">
              {/* Summary Cards for Rentals */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Card className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-emerald-100/50 via-teal-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                          Active Rentals
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{rentalSummary.active}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <Truck className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>
                        Total{" "}
                        <strong className="font-semibold text-gray-900">{rentalSummary.total}</strong>
                      </span>
                      <span>
                        Returned{" "}
                        <strong className="font-semibold text-slate-700">{rentalSummary.returned}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {rentalSummary.overdue} overdue
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-blue-100/50 via-indigo-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                          Equipment Assets
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{assetSummary.total}</p>
                      </div>
                      <div className="rounded-2xl bg-blue-50 p-3">
                        <Box className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span>
                        Available{" "}
                        <strong className="font-semibold text-emerald-600">{assetSummary.available}</strong>
                      </span>
                      <span>
                        Rented{" "}
                        <strong className="font-semibold text-blue-600">{assetSummary.rented}</strong>
                      </span>
                      <span>
                        Maintenance{" "}
                        <strong className="font-semibold text-orange-600">{assetSummary.maintenance}</strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-b from-indigo-100/60 via-purple-100/30 to-transparent" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                          Pending Requests
                        </CardTitle>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{rentalSummary.requests}</p>
                      </div>
                      <div className="rounded-2xl bg-indigo-50 p-3">
                        <ClipboardList className="h-6 w-6 text-indigo-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="text-xs">
                        Farmers awaiting equipment assignments
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Rentals Table */}
              <section className="mt-12 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Equipment Rentals</h2>
                <p className="text-sm text-gray-600">
                  Monitor issued equipment, due dates, and outstanding returns.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search rentals..."
                    value={rentalFilters.search}
                    onChange={(event) => setRentalFilters((prev) => ({ ...prev, search: event.target.value }))}
                    className={cn(commonInputClasses, "w-full pl-10 pr-2 sm:w-64")}
                  />
                </div>
                <Select
                  value={rentalFilters.status}
                  onValueChange={(value) => {
                    setRentalFilters((prev) => ({ ...prev, status: value }))
                    fetchRentalsData({ page: 1, status: value })
                  }}
                >
                  <SelectTrigger className={cn(commonInputClasses, "w-full sm:w-40")}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="inline-flex items-center gap-2 text-sm">
                        <Filter className="h-3.5 w-3.5 text-gray-500" />
                        All rentals
                      </span>
                    </SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl">
              <CardHeader className="bg-gradient-to-r from-white to-emerald-50/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Active Equipment Rentals</CardTitle>
                    <p className="text-sm text-gray-500">
                      {rentalSummary.total} total rentals • page {rentalMeta.page} of {rentalMeta.totalPages}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600">
                    {filteredRentals.length} visible
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRentals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
                    <Truck className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">No rentals found</p>
                      <p className="text-sm text-gray-500">
                        {rentalFilters.search
                          ? `No rentals match "${rentalFilters.search}".`
                          : "Issue equipment to farmers to start tracking rentals."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-emerald-50/70">
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Rental
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Farmer
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Period
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Financials
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Status
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRentals.map((rental) => {
                          const isOverdue =
                            !rental.returned &&
                            rental.rentEnd &&
                            !Number.isNaN(new Date(rental.rentEnd).getTime()) &&
                            new Date(rental.rentEnd).getTime() < Date.now()

                          return (
                            <TableRow key={rental.id} className="hover:bg-emerald-50/40">
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="font-semibold text-gray-900">
                                  {rental.asset?.name || "Equipment Rental"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Serial {rental.asset?.serial || "—"} · {capitalize(rental.asset?.assetType)}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="font-semibold text-gray-900">{rental.farmer?.name || "Unknown Farmer"}</div>
                                <div className="text-xs text-gray-500">
                                  {rental.farmer?.phone || "No phone"} •{" "}
                                  {rental.farmer?.farmerCode ? `Code ${rental.farmer.farmerCode}` : "No code"}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="text-xs text-gray-500">
                                  Start: <span className="font-semibold text-gray-900">{formatDate(rental.rentStart)}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  End:{" "}
                                  <span className={cn("font-semibold", isOverdue ? "text-rose-600" : "text-gray-900")}>
                                    {formatDate(rental.rentEnd)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="text-xs text-gray-500">
                                  Fee/day:{" "}
                                  <span className="font-semibold text-gray-900">
                                    RF {Number(rental.rentFeePerDay || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Deposit:{" "}
                                  <span className="font-semibold text-gray-900">
                                    RF {Number(rental.deposit || 0).toLocaleString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                <div className="flex flex-col gap-2">
                                  <Badge
                                    className={cn(
                                      "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                                      rental.returned
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-blue-50 text-blue-600",
                                    )}
                                  >
                                    {rental.returned ? "Returned" : "Active"}
                                  </Badge>
                                  {isOverdue ? (
                                    <Badge className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                                      Overdue
                                    </Badge>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap py-4 text-sm text-gray-700">
                                {!rental.returned ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                      setReturnForm({
                                        rentalId: rental.id,
                                        condition: "good",
                                        notes: "",
                                      })
                                      setReturnDialogOpen(true)
                                    }}
                                  >
                                    Mark Returned
                                  </Button>
                                ) : (
                                  <div className="text-xs text-gray-400">
                                    Returned {formatDate(rental.returnedAt)}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>

              {rentalMeta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/40 px-6 py-4">
                  <p className="text-xs text-gray-500">
                    Showing {(rentalMeta.page - 1) * 10 + 1}–
                    {Math.min(rentalMeta.page * 10, rentalMeta.total)} of {rentalMeta.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      disabled={rentalMeta.page === 1 || rentalsLoading}
                      onClick={() => fetchRentalsData({ page: rentalMeta.page - 1 })}
                    >
                      Previous
                    </Button>
                    <div className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-600">
                      Page {rentalMeta.page} / {rentalMeta.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      disabled={rentalMeta.page === rentalMeta.totalPages || rentalsLoading}
                      onClick={() => fetchRentalsData({ page: rentalMeta.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
              </section>
            </TabsContent>
          </Tabs>
        </div>

      {/* Create Asset Dialog */}
      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-blue-100 bg-white shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold text-gray-900">Register Equipment Asset</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Add new equipment to your MCC inventory, ready for rental or deployment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serial" className="text-sm font-semibold text-gray-700">
                  Serial Number<span className="text-rose-500">*</span>
                </Label>
                  <Input
                    id="serial"
                    placeholder="e.g. ASSET-2025-001"
                    value={newAssetForm.serial}
                    onChange={(event) => setNewAssetForm((prev) => ({ ...prev, serial: event.target.value }))}
                    className={commonInputClasses}
                  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetType" className="text-sm font-semibold text-gray-700">
                  Asset Type<span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={newAssetForm.assetType}
                  onValueChange={(value) => setNewAssetForm((prev) => ({ ...prev, assetType: value }))}
                >
                  <SelectTrigger className={commonInputClasses}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Asset Name
                </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Kawacool Chiller"
                    value={newAssetForm.name}
                    onChange={(event) => setNewAssetForm((prev) => ({ ...prev, name: event.target.value }))}
                    className={commonInputClasses}
                  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasedAt" className="text-sm font-semibold text-gray-700">
                  Purchase Date
                </Label>
                  <Input
                    id="purchasedAt"
                    type="date"
                    value={newAssetForm.purchasedAt}
                    onChange={(event) => setNewAssetForm((prev) => ({ ...prev, purchasedAt: event.target.value }))}
                    className={commonInputClasses}
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  />
              </div>
            </div>

            {/* Type-specific specifications — fields depend on selected Asset Type */}
            {newAssetForm.assetType && (
              <div className="space-y-4 rounded-xl border border-[#bfdbfe] bg-slate-50/30 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  Specifications — {assetTypes.find((t) => t.value === newAssetForm.assetType)?.label || newAssetForm.assetType}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(ASSET_TYPE_SPECS[newAssetForm.assetType] || []).map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`spec-${field.key}`} className="text-sm font-medium text-gray-600">
                        {field.label}
                        {field.unit && <span className="ml-1 font-normal text-gray-500">({field.unit})</span>}
                      </Label>
                      <Input
                        id={`spec-${field.key}`}
                        type={field.type}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? field.key === "accuracyPercent" ? 0.1 : 0.1 : undefined}
                        placeholder={field.placeholder}
                        value={newAssetForm.specValues[field.key] ?? ""}
                        onChange={(e) =>
                          setNewAssetForm((prev) => ({
                            ...prev,
                            specValues: { ...prev.specValues, [field.key]: e.target.value },
                          }))
                        }
                        className={commonInputClasses}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 rounded-xl border border-[#bfdbfe] bg-slate-50/50 px-4 py-3">
              <Checkbox
                id="rentable"
                checked={newAssetForm.rentable}
                onCheckedChange={(checked) =>
                  setNewAssetForm((prev) => ({ ...prev, rentable: checked === true }))
                }
                className="h-4 w-4 rounded border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div className="grid gap-0.5 leading-none">
                <Label
                  htmlFor="rentable"
                  className="text-sm font-semibold text-gray-700 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can be rented
                </Label>
                <p className="text-xs text-gray-500">
                  Allow this asset to be rented to farmers. Uncheck for MCC-only or non-rental equipment.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add maintenance reminders, warranty info, or deployment guidelines..."
                value={newAssetForm.notes}
                onChange={(event) => setNewAssetForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={3}
                className={commonInputClasses}
                style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px' }}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setAssetDialogOpen(false)}
              className="rounded-xl border border-blue-200 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssetSubmit}
              disabled={assetSaveLoading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-70 disabled:pointer-events-none"
            >
              {assetSaveLoading ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </>
              ) : (
                "Save Asset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Rental Dialog */}
      <Dialog open={rentalDialogOpen} onOpenChange={setRentalDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl border border-blue-100 bg-white shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Issue Equipment Rental
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Deploy an available asset to a farmer. Track rental period, fees, and deposit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Select Asset<span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={newRentalForm.assetId}
                  onValueChange={(value) => setNewRentalForm((prev) => ({ ...prev, assetId: value }))}
                >
                  <SelectTrigger className={commonInputClasses}>
                    <SelectValue placeholder="Choose available asset" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {availableAssets.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No available assets
                      </SelectItem>
                    ) : (
                      availableAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {asset.name || asset.serial}
                            </span>
                            <span className="text-xs text-gray-500">
                              Serial {asset.serial} • {capitalize(asset.assetType)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Assign Farmer<span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={newRentalForm.farmerId}
                  onValueChange={(value) => setNewRentalForm((prev) => ({ ...prev, farmerId: value }))}
                >
                  <SelectTrigger className={commonInputClasses}>
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {farmers.length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No farmers available
                      </SelectItem>
                    ) : (
                      farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {farmer.name || "Unnamed Farmer"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {farmer.phone || "No phone"} • {farmer.farmerCode || "No code"}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Rental Start</Label>
                  <Input
                    type="date"
                    value={newRentalForm.rentStart}
                    onChange={(event) => setNewRentalForm((prev) => ({ ...prev, rentStart: event.target.value }))}
                    className={commonInputClasses}
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Expected Return</Label>
                  <Input
                    type="date"
                    value={newRentalForm.rentEnd}
                    onChange={(event) => setNewRentalForm((prev) => ({ ...prev, rentEnd: event.target.value }))}
                    className={commonInputClasses}
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Fee per Day (RF)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newRentalForm.rentFeePerDay}
                    onChange={(event) => setNewRentalForm((prev) => ({ ...prev, rentFeePerDay: event.target.value }))}
                    className={commonInputClasses}
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Deposit (RF)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newRentalForm.deposit}
                    onChange={(event) => setNewRentalForm((prev) => ({ ...prev, deposit: event.target.value }))}
                    className={commonInputClasses}
                    style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px', paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Contract Notes</Label>
                <Textarea
                  placeholder="Explain rental conditions, maintenance responsibilities, or attach contract URL."
                  value={newRentalForm.contractDoc}
                  onChange={(event) => setNewRentalForm((prev) => ({ ...prev, contractDoc: event.target.value }))}
                  rows={4}
                  className={commonInputClasses}
                  style={{ border: '1px solid rgb(191, 219, 254)', borderWidth: '1px' }}
                />
              </div>

              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                <p className="font-semibold">Reminder</p>
                <p className="mt-1 leading-relaxed">
                  The equipment status will change to <strong>rented</strong> automatically. You can mark it as
                  returned once the farmer brings the asset back.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 lg:flex-row lg:justify-end">
            <Button
              variant="outline"
              onClick={() => setRentalDialogOpen(false)}
              className="rounded-xl border border-blue-200 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRentalSubmit}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              Issue Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Rental Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-blue-100 bg-white shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-gray-900">Mark Rental as Returned</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Update the asset status and capture its condition upon return.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Select Rental<span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={returnForm.rentalId}
                  onValueChange={(value) => setReturnForm((prev) => ({ ...prev, rentalId: value }))}
                >
                  <SelectTrigger className={commonInputClasses}>
                    <SelectValue placeholder="Choose active rental" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {rentals.filter((rental) => !rental.returned).length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No active rentals
                      </SelectItem>
                    ) : (
                      rentals
                        .filter((rental) => !rental.returned)
                        .map((rental) => (
                          <SelectItem key={rental.id} value={rental.id}>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">
                                {rental.asset?.name || rental.asset?.serial || "Equipment"}
                              </span>
                              <span className="text-xs text-gray-500">
                                Farmer {rental.farmer?.name || "Unknown"} • Due {formatDate(rental.rentEnd)}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Asset Condition<span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={returnForm.condition}
                    onValueChange={(value) => setReturnForm((prev) => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger className={commonInputClasses}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Return Notes</Label>
                  <Input
                    placeholder="Optional remarks..."
                    value={returnForm.notes}
                    onChange={(event) => setReturnForm((prev) => ({ ...prev, notes: event.target.value }))}
                    className={commonInputClasses}
                  />
                </div>
              </div>

            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-sm text-indigo-700">
              <p className="font-semibold">Note</p>
              <p className="mt-1 leading-relaxed">
                Returned rentals will update the asset status automatically. Damaged equipment will move to{" "}
                <strong>maintenance</strong> for follow-up.
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setReturnDialogOpen(false)}
              className="rounded-xl border border-blue-200 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReturnSubmit}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function InventoryRentalsPage() {
  return <InventoryRentalsContent />
}

