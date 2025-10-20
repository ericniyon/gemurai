"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Package, AlertCircle, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductVariant {
  id: string
  productId: string
  sku: string
  color?: string
  size?: string
  model?: string
  weight?: number
  dimensions?: Record<string, any>
  stock: number
  price: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface ProductSpecification {
  id: string
  productId: string
  name: string
  value: string
  createdAt: string
  updatedAt: string
}

interface Seller {
  id: string
  name: string
  email: string
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  images?: string[]
  category: string
  stock: number
  status: "active" | "inactive" | "out_of_stock"
  rating?: number
  reviews?: number
  provider?: string
  sellerId?: string
  isNew?: boolean
  isPopular?: boolean
  createdAt: string
  updatedAt: string
  minOrderQuantity?: number
}

interface StockOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  product?: Product | null
}

export function StockOrderDialog({ isOpen, onClose, onSuccess, product }: StockOrderDialogProps) {
  const { token, isAuthenticated, user } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<string>(product?.id || "")
  const [quantity, setQuantity] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [wallet, setWallet] = useState<{ balance: number } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  useEffect(() => {
    if (product) {
      setSelectedProduct(product.id)
    }
  }, [product])

  useEffect(() => {
    // Calculate total amount when product or quantity changes
    const selectedProductDetails = products.find(p => p.id === selectedProduct)
    if (selectedProductDetails && quantity) {
      setTotalAmount(selectedProductDetails.price * parseInt(quantity))
    } else {
      setTotalAmount(0)
    }
  }, [selectedProduct, quantity, products])

  // Load wallet data
  useEffect(() => {
    let isMounted = true

    const loadWallet = async () => {
      try {
        if (!isAuthenticated || !token) {
          console.error("No auth token found")
          return
        }

        const response = await fetch("/api/wallet", {
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
          throw new Error("Failed to fetch wallet")
        }

        const data = await response.json()
        if (isMounted && data.success) {
          setWallet(data.data)
        }
      } catch (error) {
        console.error("Failed to load wallet:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load wallet",
          variant: "destructive"
        })
      }
    }

    if (isOpen && user?.role === "DCC") {
      loadWallet()
    }

    return () => {
      isMounted = false
    }
  }, [isOpen, user?.role, isAuthenticated, token])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)

      if (!isAuthenticated || !token) {
        throw new Error("Please log in to view products")
      }

      const response = await fetch("/api/products", {
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
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      if (data.success) {
        // If user is EMPLOYER, only show their products
        const filteredProducts = user?.role === "EMPLOYER" 
          ? data.products.filter((p: Product) => p.sellerId === user.id)
          : data.products

        setProducts(filteredProducts)
      } else {
        throw new Error(data.error || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch products",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check if user has sufficient balance
    if (!wallet || wallet.balance < totalAmount) {
      toast({
        title: "Error",
        description: "Insufficient wallet balance",
        variant: "destructive",
      })
      return
    }

    setShowPaymentInfo(true)
  }

  const handleConfirmPayment = async () => {
    try {
      setIsSubmitting(true)

      if (!isAuthenticated || !token) {
        throw new Error("Please log in to create order")
      }

      const response = await fetch("/api/stock-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: parseInt(quantity),
          comment,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.")
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create stock order")
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Stock order created and payment processed successfully.",
        })
        // Reset form
        setSelectedProduct("")
        setQuantity("")
        setComment("")
        setShowPaymentInfo(false)
        // Close dialog
        onClose()
        // Refresh parent component if callback provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error(data.error || "Failed to create stock order")
      }
    } catch (error) {
      console.error("Error creating stock order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create stock order",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedProductDetails = products.find((p) => p.id === selectedProduct)

  const isInsufficientBalance = wallet !== null && selectedProductDetails && selectedProductDetails.price * parseInt(quantity) > wallet.balance
  
  // Check minimum order quantity - only validate if minOrderQuantity exists and quantity is valid
  const isBelowMinimumOrder = selectedProductDetails && 
    selectedProductDetails.minOrderQuantity && 
    quantity && 
    !isNaN(parseInt(quantity)) &&
    parseInt(quantity) > 0 && 
    parseInt(quantity) < selectedProductDetails.minOrderQuantity

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => {
      if (!open) {
        onClose()
        setShowPaymentInfo(false)
      }
    }}>
      <style jsx>{`
        .dialog-overlay {
          background-color: hsl(var(--background)) !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
        }
        .dialog-content {
          background-color: hsl(var(--background)) !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
        }
        [data-radix-dialog-overlay] {
          background-color: hsl(var(--background)) !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
        }
        [data-radix-dialog-content] {
          background-color: hsl(var(--background)) !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
        }
      `}</style>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border-2 border-border shadow-2xl rounded-xl bg-background dialog-content" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1, backdropFilter: 'none' }}>
        <DialogHeader className="px-6 pt-6 pb-5 border-b-2 border-border bg-background" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
          <DialogTitle className="flex items-center gap-3.5 text-xl font-semibold">
            <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center ring-2 ring-primary shadow-sm">
                              <Package className="h-[22px] w-[22px] text-white" />
            </div>
            <div className="space-y-1.5">
              {showPaymentInfo ? "Confirm Payment" : "Create Stock Order"}
              <DialogDescription className="text-sm text-muted-foreground font-normal leading-relaxed" style={{ opacity: 1 }}>
                {showPaymentInfo 
                  ? "Review and confirm your payment details"
                  : "Request additional stock for products in your inventory"}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={showPaymentInfo ? undefined : handleProceedToPayment} className="px-6 py-6 space-y-7" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
          <div className="space-y-7" style={{ opacity: 1 }}>
            {/* Wallet Balance Display */}
            {wallet && (
              <div className="p-4 bg-muted rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))', opacity: 1 }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available Balance:</span>
                  <span className="text-lg font-semibold">
                    {new Intl.NumberFormat("rw-RW", {
                      style: "currency",
                      currency: "RWF"
                    }).format(wallet.balance)}
                  </span>
                </div>
              </div>
            )}

            {showPaymentInfo ? (
              <div className="space-y-4" style={{ opacity: 1 }}>
                <div className="p-4 bg-muted rounded-lg" style={{ backgroundColor: 'hsl(var(--muted))', opacity: 1 }}>
                  <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="font-semibold">
                        {products.find(p => p.id === selectedProduct)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span className="font-semibold">{quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit Price:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("rw-RW", {
                          style: "currency",
                          currency: "RWF"
                        }).format(products.find(p => p.id === selectedProduct)?.price || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-3 mt-3">
                      <span>Total Amount:</span>
                      <span>
                        {new Intl.NumberFormat("rw-RW", {
                          style: "currency",
                          currency: "RWF"
                        }).format(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span className="font-semibold">Wallet Balance</span>
                    </div>
                    <div className="mt-4 p-4 bg-background rounded border" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
                      <h4 className="font-medium mb-2">Order Details:</h4>
                      <div className="space-y-2 text-sm">
                        <p>Order Reference: SO-{new Date().getTime()}</p>
                        {comment && (
                          <p>Comment: {comment}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      By confirming, the amount will be deducted from your wallet balance.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3.5" style={{ opacity: 1 }}>
                  <Label className="text-[0.925rem] font-medium flex items-center gap-1.5">
                Select Product <span className="text-destructive">*</span>
                    <span className="ml-auto text-xs text-muted-foreground font-normal">
                  {products.length} products available
                </span>
              </Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                disabled={isLoading}
              >
                    <SelectTrigger className="w-full h-[46px] bg-background ring-2 ring-input transition-all hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary" style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                  <SelectValue placeholder={isLoading ? "Loading products..." : "Choose a product from inventory"} style={{ opacity: 1 }} />
                </SelectTrigger>
                    <SelectContent className="max-h-[320px] bg-background border-2 border-border shadow-2xl rounded-lg !bg-background" style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                  {isLoading ? (
                        <div className="py-10 text-center bg-background" style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                          <Loader2 className="h-9 w-9 animate-spin mx-auto mb-3.5 text-primary" style={{ opacity: 1 }} />
                          <p className="text-sm text-muted-foreground" style={{ opacity: 1 }}>Loading available products...</p>
                    </div>
                  ) : products.length === 0 ? (
                        <div className="py-10 text-center bg-background" style={{ backgroundColor: '#f5f5f5', opacity: 1 }}>
                          <AlertCircle className="h-9 w-9 text-muted-foreground mx-auto mb-3.5" style={{ opacity: 1 }} />
                          <p className="text-[0.925rem] font-medium" style={{ opacity: 1 }}>No Products Available</p>
                          <p className="text-sm text-muted-foreground mt-1.5" style={{ opacity: 1 }}>Please check back later</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id}
                            className="py-3.5 cursor-pointer transition-all hover:bg-muted !bg-background"
                            style={{ backgroundColor: '#f5f5f5', opacity: 1 }}
                      >
                        <div className="flex items-center justify-between gap-4" style={{ opacity: 1 }}>
                          <div className="flex-1 min-w-0" style={{ opacity: 1 }}>
                            <p className="font-medium truncate" style={{ opacity: 1 }}>{product.name}</p>
                                <div className="flex items-center gap-3 mt-1.5" style={{ opacity: 1 }}>
                                  <p className="text-xs text-muted-foreground" style={{ opacity: 1 }}>
                                    Price: {new Intl.NumberFormat("rw-RW", {
                                      style: "currency",
                                      currency: "RWF"
                                    }).format(product.price)}
                              </p>
                                  <span className="text-xs text-muted-foreground" style={{ opacity: 1 }}>•</span>
                                  <p className="text-xs text-muted-foreground" style={{ opacity: 1 }}>
                                Category: {product.category}
                              </p>
                                  {product.minOrderQuantity && (
                                    <>
                                      <span className="text-xs text-muted-foreground" style={{ opacity: 1 }}>•</span>
                                      <p className="text-xs text-orange-600 font-medium" style={{ opacity: 1 }}>
                                        Min: {product.minOrderQuantity}
                                      </p>
                                    </>
                                  )}
                            </div>
                          </div>
                          <Badge 
                            variant={product.stock > 0 ? "secondary" : "destructive"} 
                            className={cn(
                                  "shrink-0 transition-all px-2.5 py-1",
                              product.stock > 0 ? "bg-primary text-white hover:bg-primary" : ""
                            )}
                            style={{ opacity: 1 }}
                          >
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedProductDetails && (
              <Card className="border border-dashed bg-muted animate-in fade-in-0 slide-in-from-top-2 duration-300" style={{ backgroundColor: 'hsl(var(--muted))', opacity: 1 }}>
                    <CardContent className="p-4.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate flex items-center gap-2.5">
                        {selectedProductDetails.name}
                            <Badge variant="outline" className="font-normal bg-background">
                          Selected
                        </Badge>
                      </h4>
                          <div className="flex items-center gap-3.5 mt-2.5">
                            <p className="text-sm text-muted-foreground">
                              Price: {new Intl.NumberFormat("rw-RW", {
                                style: "currency",
                                currency: "RWF"
                              }).format(selectedProductDetails.price)}
                        </p>
                            <span className="text-muted-foreground">•</span>
                        <Badge 
                          variant={selectedProductDetails.stock > 0 ? "secondary" : "destructive"}
                          className={cn(
                                "shrink-0 px-2.5 py-1",
                            selectedProductDetails.stock > 0 ? "bg-primary text-white" : ""
                          )}
                        >
                          Current Stock: {selectedProductDetails.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

                <div className="space-y-3.5" style={{ opacity: 1 }}>
                  <Label className="text-[0.925rem] font-medium flex items-center gap-1.5">
                Quantity <span className="text-destructive">*</span>
                {selectedProductDetails && (
                      <span className="ml-auto text-xs text-muted-foreground font-normal">
                    Current stock: {selectedProductDetails.stock}
                  </span>
                )}
              </Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter the quantity needed"
                    className="h-[46px] bg-background ring-2 ring-input transition-all hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary"
              />
                  {selectedProductDetails && quantity && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Total Value: {new Intl.NumberFormat("rw-RW", {
                          style: "currency",
                          currency: "RWF"
                        }).format(selectedProductDetails.price * parseInt(quantity))}
                      </p>
                      {wallet && selectedProductDetails.price * parseInt(quantity) > wallet.balance && (
                        <p className="text-sm text-destructive">
                          Insufficient balance. Please add funds to your wallet.
                        </p>
                      )}
                      {isBelowMinimumOrder && (
                        <p className="text-sm text-destructive">
                          Minimum order quantity is {selectedProductDetails.minOrderQuantity} units. Please increase the quantity.
                        </p>
                      )}
                    </div>
                  )}
            </div>

                <div className="space-y-3.5" style={{ opacity: 1 }}>
                  <Label className="text-[0.925rem] font-medium flex items-center gap-2.5">
                Comment
                    <span className="text-xs font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional notes or requirements..."
                    className="min-h-[130px] bg-background ring-2 ring-input resize-none transition-all hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary"
              />
            </div>
              </>
            )}
          </div>

          <DialogFooter className="px-0 py-4 border-t-2 border-border mt-8" style={{ backgroundColor: 'hsl(var(--background))', opacity: 1 }}>
            <div className="flex items-center justify-end gap-3.5 w-full">
            <Button
              type="button"
              variant="outline"
                onClick={() => {
                  if (showPaymentInfo) {
                    setShowPaymentInfo(false)
                  } else {
                    onClose()
                  }
                }}
              disabled={isSubmitting}
                className="min-w-[110px] h-[46px] transition-all hover:bg-background font-medium"
            >
                {showPaymentInfo ? "Back" : "Cancel"}
            </Button>
            <Button 
                type={showPaymentInfo ? "button" : "submit"}
                onClick={showPaymentInfo ? handleConfirmPayment : undefined}
                disabled={
                  isSubmitting || 
                  !selectedProduct || 
                  !quantity || 
                  isInsufficientBalance ||
                  isBelowMinimumOrder
                }
              className={cn(
                  "min-w-[150px] h-[46px] gap-2.5 font-medium transition-all",
                !isSubmitting && selectedProduct && quantity && "bg-primary hover:bg-primary"
              )}
            >
              {isSubmitting ? (
                <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                    Processing...
                  </>
                ) : showPaymentInfo ? (
                  <>
                    <DollarSign className="h-[18px] w-[18px]" />
                    Confirm Payment
                </>
              ) : (
                <>
                    <Package className="h-[18px] w-[18px]" />
                    Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 