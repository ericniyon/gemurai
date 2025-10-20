"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { Package, Clock, DollarSign, ShoppingBag, AlertCircle, Loader2, ArrowUpDown, User, MoreVertical, CheckCircle, XCircle, CreditCard, Package2, Trash2, CheckSquare, Square } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { LucideIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Product {
  id: string
  name: string
  price: number
  sellerId: string
}

interface StockOrderProduct {
  id: string
  product: Product
  quantity: number
  price: number
  currentStock: number
  requestedStock: number
}

interface Payment {
  id: string
  status: string
  amount: number
  method?: string
  reference?: string
  paidAt?: Date
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string
  createdAt: Date
}

interface StockOrder {
  id: string
  products: StockOrderProduct[]
  totalAmount: number
  totalRequestedQuantity: number
  status: string
  priority: string
  createdAt: Date
  updatedAt: Date
  dccSector?: string
  payment?: Payment
  transaction?: Transaction
  paymentConfirmedAt?: Date
  dcc?: {
    id: string
    name: string
    email: string
    district?: string | null
    dccProfile?: { location: string, application?: { formData?: any } }
  }
}

interface RequestedBy {
  id: string
  name: string
  email: string
}

interface StockOrderListProps {
  isEmployer?: boolean
}

interface Action {
  action: string
  label: string
  icon: LucideIcon
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("rw-RW", {
    style: "currency",
    currency: "RWF"
  }).format(amount)
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "completed":
      return "default"
    case "approved":
    case "payment_confirmed":
      return "secondary"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

const getStatusText = (status: string): string => {
  return status.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ")
}

// Location helpers: handle formats like "Province, District, Sector" and other separators
const parseLocationParts = (location?: string | null): string[] => {
  if (!location) return []
  const raw = String(location)
  // Support commas, pipes, slashes, and hyphens as separators
  const parts = raw.split(/[\,\|\/-]+/)
  return parts.map(p => p.trim()).filter(Boolean)
}

const getDistrictFromLocation = (location?: string | null): string | undefined => {
  const parts = parseLocationParts(location)
  // Prefer the second element when present
  if (parts.length >= 2) return parts[1]
  // Fallback: if there are at least 2 parts, use the penultimate
  if (parts.length >= 1) return parts[0]
  return undefined
}

const getSectorFromLocation = (location?: string | null): string | undefined => {
  const parts = parseLocationParts(location)
  // Prefer the third element when present
  if (parts.length >= 3) return parts[2]
  // Fallback: use the last part as the most specific area
  if (parts.length >= 1) return parts[parts.length - 1]
  return undefined
}

const getSectorFromFormData = (formData?: any): string | undefined => {
  if (!formData) return undefined
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

export function StockOrderList({ isEmployer = false }: StockOrderListProps) {
  const { token, isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<StockOrder | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | "confirm_payment" | "complete" | "view_payment" | null>(null)
  const [actionNote, setActionNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<StockOrder | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

    const fetchStockOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!isAuthenticated) {
          throw new Error("Please log in to view stock orders")
        }

        // Use v1 endpoint for employers, regular endpoint for DCCs
        const endpoint = isEmployer ? "/api/v1/stock-orders" : "/api/stock-orders"
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        }

        // Add Authorization header if token exists
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(endpoint, {
          headers,
          credentials: "include" // Include cookies for session auth
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please log in again.")
          }
          throw new Error("Failed to fetch stock orders")
        }

        const data = await response.json()
        if (data.success) {
          // Use data.data for v1 endpoint response
          const orders = data.data || data.stockOrders || []
          console.log("Fetched orders:", orders)
          console.log("Orders with payment_confirmed status:", orders.filter(o => o.status === "payment_confirmed"))
          setStockOrders(orders)
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
        setIsLoading(false)
      }
    }

  useEffect(() => {
    if (isAuthenticated) {
    fetchStockOrders()
    }
  }, [isAuthenticated])

  const handleSort = (key: typeof sortField) => {
    setSortField(key)
    setSortDirection(current => current === "asc" ? "desc" : "asc")
  }

  const sortedOrders = stockOrders
    .filter(order => {
      const searchLower = searchQuery.toLowerCase()
      
      // Check if any of the order's products match the search query
      const matchesProduct = order.products?.some(orderProduct => 
        orderProduct.product.name.toLowerCase().includes(searchLower)
      ) || false
      
      // Check if status matches
    const matchesStatus = order.status.toLowerCase().includes(searchLower)
      
      // Check if order ID matches
      const matchesId = order.id.toLowerCase().includes(searchLower)
      
      return matchesProduct || matchesStatus || matchesId
  })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleAction = async (order: StockOrder, action: string) => {
    try {
      setIsSubmitting(true)

      if (action === "view_payment") {
        setSelectedOrder(order)
        setIsPaymentDialogOpen(true)
        setIsSubmitting(false)
        return
      }

      if (action === "delete") {
        setOrderToDelete(order)
        setIsDeleteDialogOpen(true)
        setIsSubmitting(false)
        return
      }

      if (!isAuthenticated || !token) {
        throw new Error("Please log in to perform this action")
      }

      // Map action to status
      const statusMap = {
        approve: "approved",
        reject: "rejected",
        confirm_payment: "payment_confirmed",
        complete: "completed"
      }

      const status = statusMap[action as keyof typeof statusMap]
      if (!status) {
        throw new Error("Invalid action")
      }

      const response = await fetch(`/api/v1/stock-orders`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: order.id,
          status
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.")
        }
        const data = await response.json()
        throw new Error(data.message || "Failed to update order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Order ${getStatusText(status).toLowerCase()} successfully`,
        })
        // Refresh the list
        fetchStockOrders()
      } else {
        throw new Error(data.message || "Failed to update order")
      }
    } catch (error) {
      console.error("Error updating stock order:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update order"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete || !isAuthenticated || !token) {
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/stock-orders/${orderToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.")
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to delete order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock order deleted successfully",
        })
        // Refresh the list
        fetchStockOrders()
        // Close dialog
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
      } else {
        throw new Error(data.message || "Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting stock order:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete order"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const handleSelectAll = () => {
    const deletableOrders = sortedOrders.filter(order => {
      if (user?.role === "DCC") {
        return order.status === "pending" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received"
      } else if (isEmployer) {
        return order.status === "pending" || order.status === "rejected" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received"
      }
      return false
    })
    
    if (selectedOrders.size === deletableOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(deletableOrders.map(order => order.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) return

    try {
      setIsBulkDeleting(true)

      const deletePromises = Array.from(selectedOrders).map(orderId => 
        fetch(`/api/stock-orders/${orderId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        })
      )

      const responses = await Promise.all(deletePromises)
      const failedDeletes = responses.filter(response => !response.ok)

      if (failedDeletes.length === 0) {
        toast({
          title: "Success",
          description: `${selectedOrders.size} stock orders deleted successfully`,
        })
        // Refresh the list
        fetchStockOrders()
        // Clear selection
        setSelectedOrders(new Set())
        // Close dialog
        setIsBulkDeleteDialogOpen(false)
      } else {
        toast({
          title: "Partial Success",
          description: `${selectedOrders.size - failedDeletes.length} orders deleted, ${failedDeletes.length} failed`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error bulk deleting stock orders:", error)
      toast({
        title: "Error",
        description: "Failed to delete some orders",
        variant: "destructive"
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const isOrderDeletable = (order: StockOrder) => {
    if (user?.role === "DCC") {
      return order.status === "pending" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received"
    } else if (isEmployer) {
      return order.status === "pending" || order.status === "rejected" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received"
    }
    return false
  }

  const getActionTitle = () => {
    switch (actionType) {
      case "approve":
        return "Approve Stock Order"
      case "reject":
        return "Reject Stock Order"
      case "confirm_payment":
        return "Confirm Payment"
      case "complete":
        return "Complete Order"
      case "view_payment":
        return "Payment Details"
      default:
        return "Update Stock Order"
    }
  }

  const getActionDescription = () => {
    switch (actionType) {
      case "approve":
        return "Are you sure you want to approve this stock order? This will allow the DCC to proceed with payment."
      case "reject":
        return "Are you sure you want to reject this stock order? This action cannot be undone."
      case "confirm_payment":
        return "Are you sure you want to confirm payment for this stock order? This indicates that you have received the payment."
      case "complete":
        return "Are you sure you want to mark this order as complete? This indicates that the stock has been delivered."
      case "view_payment":
        return "View payment details for this stock order."
      default:
        return "Are you sure you want to update this stock order?"
    }
  }

  const getActionIcon = () => {
    switch (actionType) {
      case "approve":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "reject":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "confirm_payment":
        return <CreditCard className="h-5 w-5 text-blue-600" />
      case "complete":
        return <Package2 className="h-5 w-5 text-purple-600" />
      case "view_payment":
        return <DollarSign className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getAvailableActions = (status: string, userRole: string): Action[] => {
    if (userRole === "DCC") {
      // DCC users can delete their own pending, payment_confirmed, cancelled, or received orders
      const actions: Action[] = []
      if (status === "pending" || status === "payment_confirmed" || status === "cancelled" || status === "received") {
        actions.push({ action: "delete", label: "Delete", icon: Trash2 })
      }
      return actions
    }

    if (isEmployer) {
      const actions: Action[] = []
      
      // Always allow viewing payment details
      actions.push({ action: "view_payment", label: "View Payment", icon: DollarSign })

      // Allow deleting pending, rejected, payment_confirmed, cancelled, or received orders
      if (status === "pending" || status === "rejected" || status === "payment_confirmed" || status === "cancelled" || status === "received") {
        actions.push({ action: "delete", label: "Delete", icon: Trash2 })
      }

      switch (status) {
        case "payment_confirmed":
          actions.push(
            { action: "approve", label: "Approve", icon: CheckCircle },
            { action: "reject", label: "Reject", icon: XCircle }
          )
          break
        case "approved":
          actions.push({ action: "complete", label: "Complete", icon: Package2 })
          break
      }
      
      return actions
    }

    return []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (stockOrders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Stock Orders Yet</h3>
          <p className="text-muted-foreground max-w-sm">
            {user?.role === "DCC" 
              ? "You haven't placed any stock orders yet. Create your first order to manage your inventory."
              : "No stock orders have been placed for your products yet."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedOrders.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              disabled={isBulkDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedOrders.size > 0 && selectedOrders.size === sortedOrders.filter(isOrderDeletable).length}
                  onCheckedChange={handleSelectAll}
                  disabled={sortedOrders.filter(isOrderDeletable).length === 0}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Products</TableHead>
              {isEmployer && (<>
                <TableHead>District</TableHead>
              </>)}
              <TableHead>Total Amount</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id} className={order.status === "payment_confirmed" ? "bg-yellow-50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.has(order.id)}
                    onCheckedChange={() => handleSelectOrder(order.id)}
                    disabled={!isOrderDeletable(order)}
                  />
                </TableCell>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  {order.products?.map((orderProduct, index) => (
                    <div key={orderProduct.id}>
                      {orderProduct.product.name} ({orderProduct.quantity} units)
                      {index < (order.products?.length || 0) - 1 && ", "}
                    </div>
                  ))}
                </TableCell>
                {isEmployer && (<>
                  <TableCell>{order.dcc?.district ?? getDistrictFromLocation(order.dcc?.dccProfile?.location) ?? '—'}</TableCell>
                </>)}
                <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell className="font-medium">{order.totalRequestedQuantity || 0}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)} className="px-2 py-1">
                    {getStatusText(order.status)}
                    {order.status === "payment_confirmed" && (
                      <span className="block text-xs font-normal">Waiting for approval</span>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {isEmployer && (
                      <>
                        {order.status === "payment_confirmed" && (
                          <div className="flex items-center gap-2 bg-yellow-100/50 p-2 rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAction(order, "approve")}
                              disabled={isSubmitting}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve Order"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAction(order, "reject")}
                              disabled={isSubmitting}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject Order"
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                        {order.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction(order, "complete")}
                            disabled={isSubmitting}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Complete Order"
                          >
                            <Package2 className="h-5 w-5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction(order, "view_payment")}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="View Payment"
                        >
                          <DollarSign className="h-5 w-5" />
                        </Button>
                        {(order.status === "pending" || order.status === "rejected" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction(order, "delete")}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Order"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </>
                    )}
                    {!isEmployer && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAction(order, "view_payment")}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="View Payment"
                        >
                          <DollarSign className="h-5 w-5" />
                        </Button>
                        {(order.status === "pending" || order.status === "payment_confirmed" || order.status === "cancelled" || order.status === "received") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAction(order, "delete")}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Order"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Products</h4>
                {selectedOrder.products?.map((orderProduct) => (
                  <div key={orderProduct.id} className="text-sm">
                    {orderProduct.product.name} - {orderProduct.quantity} units at {formatCurrency(orderProduct.price)} each
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium">Total Amount</h4>
                <p className="text-sm">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              <div>
                <h4 className="font-medium">Payment Status</h4>
                <Badge variant={getStatusVariant(selectedOrder.payment?.status || selectedOrder.status)}>
                  {getStatusText(selectedOrder.payment?.status || selectedOrder.status)}
              </Badge>
              </div>
              {selectedOrder.payment?.method && (
                <div>
                  <h4 className="font-medium">Payment Method</h4>
                  <p className="text-sm">{selectedOrder.payment.method}</p>
                </div>
              )}
              {selectedOrder.payment?.paidAt && (
                <div>
                  <h4 className="font-medium">Paid At</h4>
                  <p className="text-sm">{formatDate(selectedOrder.payment.paidAt)}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Stock Order
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stock order? This action cannot be undone.
              {orderToDelete && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Order ID: {orderToDelete.id}</p>
                  <p className="text-sm text-gray-600">
                    Total Amount: {formatCurrency(orderToDelete.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Products: {orderToDelete.products?.map(p => `${p.product.name} (${p.quantity})`).join(", ")}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Multiple Stock Orders
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedOrders.size} stock orders? This action cannot be undone.
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Selected Orders:</p>
                <p className="text-sm text-gray-600">
                  {Array.from(selectedOrders).slice(0, 3).join(", ")}
                  {selectedOrders.size > 3 && ` and ${selectedOrders.size - 3} more...`}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedOrders.size} Orders
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 