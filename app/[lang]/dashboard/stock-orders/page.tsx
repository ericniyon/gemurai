"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { 
  Package, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ShoppingCart,
  CreditCard,
  Package2,
  RefreshCw,
  Download,
  ArrowUpDown,
  Filter,
  X,
  Calendar as CalendarIcon,
  Trash2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

// Function to format currency without currency symbol
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("rw-RW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface StockOrderProduct {
  id: string
  quantity: number
  currentStock: number
  requestedStock: number
  price: number
  product: {
    id: string
    name: string
    price: number
    commission?: number
    sellerId: string
    purchasePrice?: number
    costPrice?: number
  }
}

interface StockOrder {
  id: string
  dccId: string
  totalAmount: number
  status: string
  priority: string
  requestDate: string
  estimatedDelivery?: string
  notes?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  paymentConfirmedBy?: string
  paymentConfirmedAt?: string
  completedBy?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  dccSector?: string
  dcc: {
    id: string
    name: string
    email: string
    district?: string | null
    dccProfile?: { location: string, application?: { formData?: any } } | null
  }
  products: StockOrderProduct[]
  payment?: {
    id: string
    amount: number
    method: string
    status: string
    paidAt?: string
  }
}

export default function StockOrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<StockOrder | null>(null)
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<string | null>(null)
  const [orderToReject, setOrderToReject] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Verification function for Purchase Price calculation
  const verifyPurchasePriceCalculation = (order: StockOrder) => {
    console.log(`\n=== VERIFICATION FOR ORDER ${order.id} ===`)
    console.log(`DCC: ${order.dcc.name}`)
    console.log(`Status: ${order.status}`)
    console.log(`Products in order: ${order.products.length}`)
    
    let totalPurchasePrice = 0
    
    order.products.forEach((product, index) => {
      const unitPurchasePrice = product.product.purchasePrice || product.product.costPrice || 0
      const productTotal = unitPurchasePrice * product.quantity
      totalPurchasePrice += productTotal
      
      console.log(`\nProduct ${index + 1}: ${product.product.name}`)
      console.log(`  - Quantity: ${product.quantity}`)
      console.log(`  - Unit Purchase Price: ${unitPurchasePrice} RWF`)
      console.log(`  - Product Total: ${productTotal} RWF`)
      console.log(`  - purchasePrice field: ${product.product.purchasePrice}`)
      console.log(`  - costPrice field: ${product.product.costPrice}`)
    })
    
    console.log(`\nTOTAL PURCHASE PRICE: ${totalPurchasePrice} RWF`)
    console.log(`=== END VERIFICATION ===\n`)
    
    return totalPurchasePrice
  }
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<StockOrder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    status: "all" as string,
    dcc: "all" as string,
    product: "" as string,
    minAmount: "" as string,
    maxAmount: "" as string
  })
  const [showFilters, setShowFilters] = useState(false)
  const [dccSearchTerm, setDccSearchTerm] = useState("")

  // Robust location parsing helpers
  const parseLocationParts = (location?: string | null): string[] => {
    if (!location) return []
    const raw = String(location)
    const parts = raw.split(/[\,\|\/-]+/)
    return parts
      .map(p => p
        .replace(/\b(Province|District|Sector|Cell|Country)\b[:\-]?/gi, "")
        .trim())
      .filter(Boolean)
  }

  const getDistrictFromLocation = (location?: string | null): string => {
    const parts = parseLocationParts(location)
    // Prefer second token; fallback to first
    if (parts.length >= 2) return parts[1]
    if (parts.length >= 1) return parts[0]
    return '—'
  }

  const getSectorFromLocation = (location?: string | null): string => {
    if (!location) return '—'
    // Extract explicitly labeled sector if present
    const labeled = /sector\s*[:\-]?\s*([A-Za-z\s]+)/i.exec(location)
    if (labeled?.[1]) {
      const val = labeled[1].trim()
      if (val) return val
    }
    const parts = parseLocationParts(location)
    // Prefer third token; fallback to last token
    if (parts.length >= 3) return parts[2]
    if (parts.length >= 1) return parts[parts.length - 1]
    return '—'
  }

  const getSectorFromFormData = (formData?: any): string | undefined => {
    if (!formData) return undefined
    // Support stringified JSON formData
    if (typeof formData === 'string') {
      try {
        const parsed = JSON.parse(formData)
        formData = parsed
      } catch {
        // Try to extract simple "sector: value" patterns from plain text
        const match = /sector\s*[:\-]?\s*([A-Za-z\s]+)/i.exec(formData)
        if (match?.[1]?.trim()) return match[1].trim()
        return undefined
      }
    }
    const directCandidates = [
      formData.sector,
      formData.q13,
      formData.SECTOR,
      formData.Sector,
    ]
    for (const c of directCandidates) {
      if (typeof c === 'string' && c.trim()) return c.trim()
    }
    const nested = [
      formData.address?.sector,
      formData.address?.Sector,
      formData.address?.SECTOR,
      formData.location?.sector,
      formData.location?.Sector,
    ]
    for (const c of nested) {
      if (typeof c === 'string' && c.trim()) return c.trim()
    }
    // Recursive search for any key containing 'sector'
    const stack: any[] = [formData]
    while (stack.length) {
      const current = stack.pop()
      if (current && typeof current === 'object') {
        for (const [key, value] of Object.entries(current)) {
          if (typeof value === 'string') {
            if (/sector/i.test(key) && value.trim()) return value.trim()
          } else if (value && typeof value === 'object') {
            stack.push(value)
          }
        }
      }
    }
    return undefined
  }

  

  // DataTable columns definition
  const baseColumns: ColumnDef<StockOrder>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => {
              setSelectAll(e.target.checked)
              if (e.target.checked) {
                setSelectedOrders(new Set(stockOrders.map(order => order.id)))
              } else {
                setSelectedOrders(new Set())
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedOrders.has(row.original.id)}
            onChange={(e) => {
              const orderId = row.original.id
              const newSelected = new Set(selectedOrders)
              if (e.target.checked) {
                newSelected.add(orderId)
              } else {
                newSelected.delete(orderId)
              }
              setSelectedOrders(newSelected)
              setSelectAll(newSelected.size === stockOrders.length)
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "dcc",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-bold text-gray-800 hover:bg-transparent hover:text-blue-600 transition-all duration-200 text-sm uppercase tracking-wide"
          >
            DCC
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="font-semibold text-gray-900 text-sm">{order.dcc.name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "totalQuantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-bold text-gray-800 hover:bg-transparent hover:text-blue-600 transition-all duration-200 text-sm uppercase tracking-wide"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      ),
      cell: ({ row }) => {
        const order = row.original
        const totalQuantity = order.products.reduce((sum, product) => sum + product.quantity, 0)
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800">
                {totalQuantity}
              </div>
              <div className="text-xs text-gray-500">
                {order.products.length} item{order.products.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )
      },
    },
    ...(user?.role === 'EMPLOYER' || user?.role === 'BRANCH_MANAGER' ? [
      {
        id: 'district',
        accessorFn: (row) => row?.dcc?.district ?? getDistrictFromLocation(row?.dcc?.dccProfile?.location ?? ''),
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-bold text-gray-800 hover:bg-transparent hover:text-blue-600 transition-all duration-200 text-sm uppercase tracking-wide"
          >
            District
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-900 font-medium text-sm">{row.original.dcc?.district ?? '—'}</span>
          </div>
        )
      } as ColumnDef<StockOrder>,
    ] : []),
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-bold text-gray-800 hover:bg-transparent hover:text-blue-600 transition-all duration-200 text-sm uppercase tracking-wide"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              {getStatusIcon(order.status)}
            </div>
            <Badge className={`${getStatusColor(order.status)} font-semibold text-xs px-3 py-1 rounded-full border-0 shadow-sm`}>
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        )
      },
    },


    {
      accessorKey: "totalPrice",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-bold text-gray-800 hover:bg-transparent hover:text-blue-600 transition-all duration-200 text-sm uppercase tracking-wide"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      ),
      cell: ({ row }) => {
        const order = row.original
        // Calculate total sales price from all products
        const totalSalesPrice = order.products.reduce((total, product) => {
          const unitPrice = product.price || product.product.price || 0
          return total + (unitPrice * product.quantity)
        }, 0)
        
        return (
          <div className="flex items-center">
            <div>
              <div className="font-bold text-sm text-gray-800">
                RWF {formatAmount(totalSalesPrice)}
              </div>
              <div className="text-xs text-gray-500">
                Sales price
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "purchasePrice",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-bold text-gray-800 hover:bg-transparent hover:text-blue-600 transition-all duration-200 text-sm uppercase tracking-wide"
          >
            Purchase Price
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.original
        // Calculate total purchase price from all products
        const totalPurchasePrice = order.products.reduce((total, product) => {
          // Use actual product purchase price (costPrice) directly
          const unitPurchasePrice = product.product.purchasePrice || product.product.costPrice || 0
          const productTotal = unitPurchasePrice * product.quantity
          
          // Debug logging to verify calculation
          console.log(`Order ${order.id} - Product ${product.product.name}:`, {
            quantity: product.quantity,
            unitPurchasePrice,
            productTotal,
            purchasePrice: product.product.purchasePrice,
            costPrice: product.product.costPrice
          })
          
          return total + productTotal
        }, 0)
        
        // Debug logging for total order calculation
        console.log(`Order ${order.id} - Total Purchase Price:`, totalPurchasePrice)
        
        return (
          <div className="flex items-center">
            <div>
              <div className="font-bold text-sm text-gray-800">
                RWF {formatAmount(totalPurchasePrice)}
              </div>
              <div className="text-xs text-gray-500">
                {order.products.length} product{order.products.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )
      },
    },
    // Removed Request Date column as requested
  ]

  // Conditionally include Actions column based on user role
  const columns: ColumnDef<StockOrder>[] = user?.role === "BRANCH_MANAGER" 
    ? baseColumns 
    : [...baseColumns, {
        id: "actions",
        header: () => (
          <div className="font-bold text-gray-800 text-sm uppercase tracking-wide">
            Actions
          </div>
        ),
        cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
                <DialogHeader className="pb-4 flex-shrink-0">
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Order Details - #{order.id.slice(-8)}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-lg">
                    Detailed information about this stock order
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        DCC Information
                      </h4>
                      <div className="space-y-3">
                        <p className="flex justify-between">
                          <span className="font-semibold text-gray-700">Name:</span>
                          <span className="text-gray-900">{order.dcc.name}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-semibold text-gray-700">Email:</span>
                          <span className="text-gray-900">{order.dcc.email}</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Order Information
                      </h4>
                      <div className="space-y-3">
                        <p className="flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Status:</span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status.replace("_", " ").toUpperCase()}</span>
                          </span>
                        </p>

                        <p className="flex justify-between">
                          <span className="font-semibold text-gray-700">Total Amount:</span>
                          <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            RWF {formatAmount(order.totalAmount)}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-semibold text-gray-700">Purchase Price:</span>
                          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            RWF {formatAmount(order.products.reduce((total, product) => {
                              const unitSales = product.price || product.product.price || 0
                              const unitCommission = product.product.commission || 0
                              const unitPurchase = unitSales - unitCommission
                              return total + (unitPurchase * product.quantity)
                            }, 0))}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-semibold text-gray-700">Total Commission:</span>
                          <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            RWF {formatAmount(order.products.reduce((total, product) => {
                              const unitCommission = product.product.commission || 0
                              return total + (unitCommission * product.quantity)
                            }, 0))}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6">
                    <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-purple-600" />
                      Products ({order.products.length})
                    </h4>
                    <div className="space-y-3">
                      {order.products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-gray-900">{product.product.name}</p>
                            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
                              Qty: {product.quantity}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Unit Price:</span>
                              <p className="font-semibold text-gray-900">RWF {formatAmount(product.price)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Unit Commission:</span>
                              <p className="font-semibold text-orange-600">RWF {formatAmount(product.product.commission || 0)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Purchase Price:</span>
                              <p className="font-semibold text-blue-600">RWF {formatAmount((product.price || product.product.price || 0) - (product.product.commission || 0))}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Commission:</span>
                              <p className="font-semibold text-orange-600">RWF {formatAmount((product.product.commission || 0) * product.quantity)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Total:</span>
                              <p className="font-bold text-lg bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                                RWF {formatAmount(product.quantity * product.price)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Current Stock:</span>
                              <p className="font-semibold text-gray-900">{product.currentStock}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.payment && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        Payment Information
                      </h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600 text-sm">Status:</span>
                            <p className="font-semibold text-gray-900">{order.payment.status}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Method:</span>
                            <p className="font-semibold text-gray-900">{order.payment.method}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Amount:</span>
                            <p className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              RWF {formatAmount(order.payment.amount)}
                            </p>
                          </div>
                          {order.payment.paidAt && (
                            <div>
                              <span className="text-gray-600 text-sm">Paid:</span>
                              <p className="font-semibold text-gray-900">{formatDate(order.payment.paidAt)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {order.notes && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        Notes
                      </h4>
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-100">
                        <p className="text-gray-900 leading-relaxed">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="pt-6 flex-shrink-0">
                  <Button 
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {order.status === "pending" && order.payment && order.payment.status === "PENDING" && user?.role !== "DCC" && (
              <Button 
                size="sm" 
                variant="outline"
                className="!border-green-600 !text-green-600 hover:!bg-green-50 hover:!border-green-700 transition-all duration-200"
                onClick={() => handleConfirmPaymentClick(order.id)}
                disabled={isConfirmingPayment}
              >
                {isConfirmingPayment ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            )}

            {(order.status === "payment_confirmed" || (order.status === "pending" && order.payment && order.payment.status === "COMPLETED")) && (
              <div className="flex gap-2">
                {order.status === "payment_confirmed" && (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => handleConfirmOrder(order.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Order
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700 transition-all duration-200"
                  onClick={() => handleRejectOrderClick(order.id)}
                  disabled={isApproving}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}

            {order.status === "confirmed" && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => handleDeliverOrder(order.id)}
                  disabled={deliveringOrderId === order.id}
                >
                  {deliveringOrderId === order.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  {deliveringOrderId === order.id ? "Delivering..." : "Delivered"}
                </Button>
              </div>
            )}


            {/* Delete button for pending, rejected, payment_confirmed, cancelled, and received orders */}
            {(order.status === "pending" || order.status === "rejected" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOrderToDelete(order)
                  setIsDeleteDialogOpen(true)
                }}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}

          </div>
        )
      },
    },
  ]


  // Fetch stock orders on component mount
  useEffect(() => {
    if (isAuthenticated && (user?.role === "EMPLOYER" || user?.role === "BRANCH_MANAGER")) {
      fetchStockOrders()
    }
  }, [isAuthenticated, user?.role])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "payment_confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <DollarSign className="h-4 w-4" />
      case "payment_confirmed":
        return <DollarSign className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(stockOrders.map(order => order.status))]
  const uniqueDCCs = [...new Set(stockOrders.map(order => order.dcc.name))]
  const uniqueProducts = [...new Set(stockOrders.flatMap(order => 
    order.products.map(product => product.product.name)
  ))]

  // Filter DCCs based on search term
  const filteredDCCs = uniqueDCCs.filter(dcc => 
    dcc.toLowerCase().includes(dccSearchTerm.toLowerCase())
  )

  // Filter orders based on current filters
  const filteredOrders = stockOrders.filter(order => {
    // Date range filter
    if (filters.dateFrom) {
      const orderDate = new Date(order.requestDate)
      if (orderDate < filters.dateFrom) return false
    }
    if (filters.dateTo) {
      const orderDate = new Date(order.requestDate)
      if (orderDate > filters.dateTo) return false
    }

    // Status filter
    if (filters.status && filters.status !== "all" && order.status !== filters.status) return false

    // DCC filter
    if (filters.dcc && filters.dcc !== "all" && order.dcc.name !== filters.dcc) return false

    // Product filter
    if (filters.product) {
      const hasProduct = order.products.some(product => 
        product.product.name.toLowerCase().includes(filters.product.toLowerCase())
      )
      if (!hasProduct) return false
    }

    // Amount range filter
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount)
      if (order.totalAmount < minAmount) return false
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount)
      if (order.totalAmount > maxAmount) return false
    }

    return true
  })

  // Calculate total value of all filtered orders using purchase price
  const totalValue = filteredOrders.reduce((sum, order) => {
    const orderPurchaseValue = order.products.reduce((productSum, product) => {
      const purchasePrice = product.product.purchasePrice || product.product.costPrice || 0
      return productSum + (purchasePrice * product.quantity)
    }, 0)
    return sum + orderPurchaseValue
  }, 0)
  
  // Calculate total value by status using purchase price
  const totalValueByStatus = {
    pending: filteredOrders.filter(order => order.status === "pending").reduce((sum, order) => {
      const orderPurchaseValue = order.products.reduce((productSum, product) => {
        const purchasePrice = product.product.purchasePrice || product.product.costPrice || 0
        return productSum + (purchasePrice * product.quantity)
      }, 0)
      return sum + orderPurchaseValue
    }, 0),
    payment_confirmed: filteredOrders.filter(order => order.status === "payment_confirmed").reduce((sum, order) => {
      const orderPurchaseValue = order.products.reduce((productSum, product) => {
        const purchasePrice = product.product.purchasePrice || product.product.costPrice || 0
        return productSum + (purchasePrice * product.quantity)
      }, 0)
      return sum + orderPurchaseValue
    }, 0),
    approved: filteredOrders.filter(order => order.status === "approved").reduce((sum, order) => {
      const orderPurchaseValue = order.products.reduce((productSum, product) => {
        const purchasePrice = product.product.purchasePrice || product.product.costPrice || 0
        return productSum + (purchasePrice * product.quantity)
      }, 0)
      return sum + orderPurchaseValue
    }, 0),
    completed: filteredOrders.filter(order => order.status === "completed").reduce((sum, order) => {
      const orderPurchaseValue = order.products.reduce((productSum, product) => {
        const purchasePrice = product.product.purchasePrice || product.product.costPrice || 0
        return productSum + (purchasePrice * product.quantity)
      }, 0)
      return sum + orderPurchaseValue
    }, 0),
    rejected: filteredOrders.filter(order => order.status === "rejected").reduce((sum, order) => {
      const orderPurchaseValue = order.products.reduce((productSum, product) => {
        const purchasePrice = product.product.purchasePrice || product.product.costPrice || 0
        return productSum + (purchasePrice * product.quantity)
      }, 0)
      return sum + orderPurchaseValue
    }, 0)
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      status: "all",
      dcc: "all",
      product: "",
      minAmount: "",
      maxAmount: ""
    })
    setDccSearchTerm("")
  }

  const handleExport = () => {
    try {
      const ordersToExport = selectedOrders.size > 0
        ? stockOrders.filter(order => selectedOrders.has(order.id))
        : filteredOrders

      if (!ordersToExport.length) {
        toast({ title: "No data", description: "There are no orders to export." })
        return
      }

      const calculatePurchasePrice = (order: StockOrder) => {
        return order.products.reduce((total, product) => {
          const unitSales = product.price || product.product.price || 0
          const unitCommission = product.product.commission || 0
          const unitPurchase = unitSales - unitCommission
          return total + unitPurchase * product.quantity
        }, 0)
      }

      const calculateTotalCommission = (order: StockOrder) => {
        return order.products.reduce((total, product) => {
          const unitCommission = product.product.commission || 0
          return total + unitCommission * product.quantity
        }, 0)
      }

      const headers = [
        "Order ID",
        "DCC Name",
        "DCC Email",
        "Status",
        "Total Amount (RWF)",
        "Purchase Price (RWF)",
        "Total Commission (RWF)",
        "Products Count",
        "Request Date",
        "Approved At",
        "Rejected At",
        "Payment Status",
        "Paid At"
      ]

      const escapeCsv = (value: unknown) => {
        if (value === null || value === undefined) return ""
        const str = String(value)
        if (/[",\n]/.test(str)) {
          return '"' + str.replace(/"/g, '""') + '"'
        }
        return str
      }

      const rows = ordersToExport.map(order => {
        const purchasePrice = calculatePurchasePrice(order)
        const totalCommission = calculateTotalCommission(order)
        return [
          order.id,
          order.dcc?.name || "",
          order.dcc?.email || "",
          order.status,
          order.totalAmount,
          purchasePrice,
          totalCommission,
          order.products?.length || 0,
          formatDate(order.requestDate),
          order.approvedAt ? formatDate(order.approvedAt) : "",
          order.rejectedAt ? formatDate(order.rejectedAt) : "",
          order.payment?.status || "",
          order.payment?.paidAt ? formatDate(order.payment.paidAt) : ""
        ].map(escapeCsv).join(",")
      })

      const csvContent = [headers.join(","), ...rows].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      link.download = `stock_orders_${dateStr}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export complete",
        description: `Exported ${ordersToExport.length} order(s) to CSV`,
      })
    } catch (e) {
      console.error("Export failed:", e)
      toast({ title: "Export failed", description: "Could not export orders.", variant: "destructive" })
    }
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'status' || key === 'dcc') {
      return value !== null && value !== "" && value !== "all"
    }
    return value !== null && value !== ""
  })



  const fetchStockOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isAuthenticated) {
        throw new Error("Please log in to view stock orders")
      }

      const response = await fetch("/api/v1/stock-orders", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        credentials: "include"
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.")
        }
        throw new Error("Failed to fetch stock orders")
      }

      const data = await response.json()
      if (data.success) {
        // Debug: inspect sector-related fields to diagnose why Sector shows as dash
        try {
          const sample = Array.isArray(data.data) ? data.data[0] : undefined
          if (sample) {
            // eslint-disable-next-line no-console
            console.log("[StockOrders] Sample order sector fields:", {
              dccSector: sample?.dccSector,
              formSector: sample?.dcc?.dccProfile?.application?.formData?.sector,
              formAnySector: sample?.dcc?.dccProfile?.application?.formData,
              location: sample?.dcc?.dccProfile?.location,
              district: sample?.dcc?.district,
              dccName: sample?.dcc?.name,
              orderId: sample?.id,
            })
          }
        } catch {}
        const orders: StockOrder[] = data.data || []
        setStockOrders(orders)

        // Verify Purchase Price calculation for each order
        console.log(`\n🔍 VERIFYING PURCHASE PRICE CALCULATIONS FOR ${orders.length} ORDERS`)
        orders.forEach((order, index) => {
          if (index < 3) { // Only verify first 3 orders to avoid console spam
            verifyPurchasePriceCalculation(order)
          }
        })
        console.log(`\n✅ Verification complete for first 3 orders. Check console for details.\n`)

        // Attempt to enrich missing sector values by looking up DCC user profiles
        // using the users/dcc endpoint (search by email) and parsing sector from location.
        try {
          const missingSectorDccs = Array.from(new Set(
            orders
              .filter(o => !(
                (o as any)?.dccSector
                || getSectorFromFormData(o?.dcc?.dccProfile?.application?.formData)
                || getSectorFromLocation(o?.dcc?.dccProfile?.location)
              ))
              .map(o => o.dcc?.email)
              .filter(Boolean) as string[]
          ))

          if (missingSectorDccs.length > 0) {
            const lookups = await Promise.all(missingSectorDccs.map(async (email) => {
              try {
                const ures = await fetch(`/api/v1/users/dcc?search=${encodeURIComponent(email)}&limit=1`, {
                  credentials: 'include'
                })
                if (!ures.ok) return [email, undefined] as const
                const udata = await ures.json()
                const user = Array.isArray(udata?.data) ? udata.data[0] : null
                const apiSector = (user as any)?.sector as string | undefined
                if (apiSector && apiSector.trim()) {
                  return [email, apiSector.trim()] as const
                }
                const location = user?.dccProfile?.location as string | undefined
                const sectorFromLoc = getSectorFromLocation(location)
                return [email, sectorFromLoc && sectorFromLoc !== '—' ? sectorFromLoc : undefined] as const
              } catch {
                return [email, undefined] as const
              }
            }))

            const emailToSector = new Map<string, string | undefined>(lookups)
            if (emailToSector.size > 0) {
              setStockOrders(prev => prev.map(o => {
                const email = o.dcc?.email
                const existing = (o as any)?.dccSector
                  || getSectorFromFormData(o?.dcc?.dccProfile?.application?.formData)
                  || getSectorFromLocation(o?.dcc?.dccProfile?.location)
                if (existing) return o
                const derived = email ? emailToSector.get(email) : undefined
                return derived ? { ...o, dccSector: derived } : o
              }))
            }
          }
        } catch {}
      } else {
        throw new Error(data.message || "Failed to fetch stock orders")
      }
    } catch (error) {
      console.error("Error fetching stock orders:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch stock orders"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPaymentClick = (orderId: string) => {
    setOrderToConfirm(orderId)
    setShowConfirmDialog(true)
  }

  const confirmPayment = async (orderId: string) => {
    try {
      setIsConfirmingPayment(true)
      
      const response = await fetch(`/api/v1/stock-orders`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "payment_confirmed"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to confirm payment")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Payment Confirmed",
          description: "Payment has been successfully confirmed.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to confirm payment")
      }
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm payment",
        variant: "destructive"
      })
    } finally {
      setIsConfirmingPayment(false)
      setShowConfirmDialog(false)
      setOrderToConfirm(null)
    }
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/v1/stock-orders`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "approved"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to approve order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Order Approved",
          description: "Stock order has been successfully approved.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to approve order")
      }
    } catch (error) {
      console.error("Error approving order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve order",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectOrderClick = (orderId: string) => {
    setOrderToReject(orderId)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const handleBulkApprove = async () => {
    try {
      setIsApproving(true)
      const promises = Array.from(selectedOrders).map(orderId => 
        fetch(`/api/v1/stock-orders`, {
          method: 'PATCH',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify({
            orderId: orderId,
            status: "approved"
          })
        })
      )
      
      await Promise.all(promises)
      
      toast({
        title: "Bulk Approval Successful",
        description: `Successfully approved ${selectedOrders.size} orders.`,
        variant: "default"
      })
      
      setSelectedOrders(new Set())
      setSelectAll(false)
      await fetchStockOrders()
    } catch (error) {
      console.error("Error bulk approving orders:", error)
      toast({
        title: "Error",
        description: "Failed to approve some orders. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleBulkReject = async () => {
    try {
      setIsApproving(true)
      const promises = Array.from(selectedOrders).map(orderId => 
        fetch(`/api/v1/stock-orders`, {
          method: 'PATCH',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
          body: JSON.stringify({
            orderId: orderId,
            status: "rejected",
            notes: "Bulk rejected by employer"
          })
        })
      )
      
      await Promise.all(promises)
      
      toast({
        title: "Bulk Rejection Successful",
        description: `Successfully rejected ${selectedOrders.size} orders.`,
        variant: "default"
      })
      
      setSelectedOrders(new Set())
      setSelectAll(false)
      await fetchStockOrders()
    } catch (error) {
      console.error("Error bulk rejecting orders:", error)
      toast({
        title: "Error",
        description: "Failed to reject some orders. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectOrder = async (orderId: string, reason?: string) => {
    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/v1/stock-orders`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "rejected",
          notes: reason || "Order rejected by employer"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to reject order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Order Rejected",
          description: "Stock order has been successfully rejected.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to reject order")
      }
    } catch (error) {
      console.error("Error rejecting order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject order",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
      setShowRejectDialog(false)
      setOrderToReject(null)
      setRejectReason("")
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/stock-orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Order Deleted",
          description: "Stock order has been successfully deleted.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
        // Close dialog
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
      } else {
        throw new Error(data.message || "Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete order",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/v1/stock-orders`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "completed"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to confirm voucher order delivery")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Voucher Order Delivery Confirmed",
          description: "Voucher order delivery has been successfully confirmed.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to confirm voucher order delivery")
      }
    } catch (error) {
      console.error("Error completing order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm voucher order delivery",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/v1/stock-orders`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "confirmed"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to confirm order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Order Confirmed",
          description: "Stock order has been successfully confirmed.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to confirm order")
      }
    } catch (error) {
      console.error("Error confirming order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm order",
        variant: "destructive"
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleDeliverOrder = async (orderId: string) => {
    try {
      setDeliveringOrderId(orderId)
      
      const response = await fetch(`/api/v1/stock-orders`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          orderId: orderId,
          status: "delivered"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to deliver order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Order Delivered",
          description: "Stock order has been successfully delivered.",
          variant: "default"
        })
        // Refresh the orders list
        await fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to deliver order")
      }
    } catch (error) {
      console.error("Error delivering order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deliver order",
        variant: "destructive"
      })
    } finally {
      setDeliveringOrderId(null)
    }
  }

  useEffect(() => {
    if (isAuthenticated && (user?.role === "EMPLOYER" || user?.role === "BRANCH_MANAGER")) {
      fetchStockOrders()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to view stock orders.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user?.role !== "EMPLOYER" && user?.role !== "BRANCH_MANAGER") {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only EMPLOYER and BRANCH_MANAGER users can view stock orders.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">



        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
                  <p className="text-xs text-gray-500">
                    {hasActiveFilters ? `${stockOrders.length} total` : "All orders"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                  <p className="text-xs text-gray-500">
                    {hasActiveFilters ? `${formatCurrency(stockOrders.reduce((sum, order) => sum + order.totalAmount, 0))} total` : "All orders"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(order => order.status === "pending").length}</p>
                  <p className="text-xs text-gray-500">Awaiting action</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Payment Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOrders.filter(order => order.status === "payment_confirmed").length}</p>
                  <p className="text-xs text-gray-500">Ready to approve</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Orders DataTable */}
        {loading ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Stock Orders</h3>
              <p className="text-gray-500">Please wait while we fetch your stock orders...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button 
                onClick={fetchStockOrders} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : stockOrders.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stock Orders</h3>
              <p className="text-gray-500">No stock orders have been made for your products yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border border-gray-200 shadow-sm">
            {/* Filters Section */}
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Filters</CardTitle>
                    {hasActiveFilters && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 mt-1">
                        {Object.values(filters).filter(v => v !== null && v !== "").length} active
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="border-slate-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-300 transition-all duration-300 hover:shadow-md hover:scale-105 font-semibold"
                      type="button"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 hover:shadow-md hover:scale-105 font-semibold"
                    type="button"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? "Hide" : "Show"} Filters
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                    <div className="flex gap-2">
                      <Popover>
                                                <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            className="w-full justify-start text-left font-normal !bg-white !border-gray-300 border hover:bg-gray-50 text-gray-900"
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? formatDate(filters.dateFrom.toISOString()) : "From"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 !bg-white border border-gray-300" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom ?? undefined}
                            onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date ?? null }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                                                <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            className="w-full justify-normal text-left font-normal !bg-white !border-gray-300 border hover:bg-gray-50 text-gray-900"
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? formatDate(filters.dateTo.toISOString()) : "To"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 !bg-white border border-gray-300" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo ?? undefined}
                            onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date ?? null }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                                    {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-full !bg-white !border-gray-300 border text-gray-900">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white border border-gray-300">
                        <SelectItem value="all">All Statuses</SelectItem>
                        {uniqueStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                                    {/* DCC Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">DCC</Label>
                    <Select value={filters.dcc} onValueChange={(value) => setFilters(prev => ({ ...prev, dcc: value }))}>
                      <SelectTrigger className="w-full !bg-white !border-gray-300 border text-gray-900">
                        <SelectValue placeholder="All DCCs" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white border border-gray-300">
                        <div className="p-2 border-b border-gray-200">
                          <Input
                            placeholder="Search DCCs..."
                            value={dccSearchTerm}
                            onChange={(e) => setDccSearchTerm(e.target.value)}
                            className="!bg-white border border-gray-300 text-sm"
                          />
                        </div>
                        <SelectItem value="all">All DCCs</SelectItem>
                        {filteredDCCs.map(dcc => (
                          <SelectItem key={dcc} value={dcc}>
                            {dcc}
                          </SelectItem>
                        ))}
                        {filteredDCCs.length === 0 && dccSearchTerm && (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            No DCCs found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Product</Label>
                    <Input
                      placeholder="Search products..."
                      value={filters.product}
                      onChange={(e) => setFilters(prev => ({ ...prev, product: e.target.value }))}
                      className="w-full !bg-white border border-gray-300"
                    />
                  </div>

                  {/* Amount Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Min Amount (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                      className="w-full !bg-white border border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Max Amount (RWF)</Label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                      className="w-full !bg-white border border-gray-300"
                    />
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Bulk Actions Toolbar */}
            {selectedOrders.size > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{selectedOrders.size}</span>
                      </div>
                      <span className="text-slate-700 font-medium">
                        {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrders(new Set())
                        setSelectAll(false)
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Clear selection
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                      onClick={handleBulkApprove}
                      disabled={isApproving}
                      type="button"
                    >
                      {isApproving ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve All ({selectedOrders.size})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-300 hover:shadow-md hover:scale-105 font-semibold"
                      onClick={handleBulkReject}
                      disabled={isApproving}
                      type="button"
                    >
                      {isApproving ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject All ({selectedOrders.size})
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-b-2xl">
                <DataTable 
                  columns={columns} 
                  data={filteredOrders} 
                  searchKey="dcc.name"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Are you sure you want to confirm the payment for this stock order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowConfirmDialog(false)
                setOrderToConfirm(null)
              }}
              className="border-slate-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md hover:scale-105 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
              onClick={() => orderToConfirm && confirmPayment(orderToConfirm)}
              disabled={isConfirmingPayment}
            >
              {isConfirmingPayment ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Reject Order
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Are you sure you want to reject this stock order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection (Optional)
            </label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all duration-300 hover:border-gray-400"
              rows={3}
            />
          </div>
          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false)
                setOrderToReject(null)
                setRejectReason("")
              }}
              className="border-slate-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:border-gray-400 transition-all duration-300 hover:shadow-md hover:scale-105 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
              onClick={() => orderToReject && handleRejectOrder(orderToReject, rejectReason)}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md">
          <AlertDialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center">
              <Trash2 className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Delete Stock Order
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base">
              Are you sure you want to delete this stock order? This action cannot be undone.
              {orderToDelete && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <p className="font-semibold text-gray-800">Order Details:</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Order ID:</strong> {orderToDelete.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> {formatCurrency(orderToDelete.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {orderToDelete.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Products:</strong> {orderToDelete.products?.map(p => `${p.product.name} (${p.quantity})`).join(", ")}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg border-0"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Order
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}