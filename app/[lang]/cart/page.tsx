"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Package,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { ClientOnly } from "@/components/client-only"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  description: string
  category: string
  stock: number
}

function CartContent() {
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || "en"
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const { toast } = useToast()

  // Fetch cart items from API
  const fetchCartItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customer/cart')
      const data = await response.json()
      
      if (response.ok && data.success) {
        const items = data.cart.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || '/img/Cooking_Oil_Vegetable.png',
          quantity: item.quantity,
          description: item.product.description || '',
          category: item.product.category || '',
          stock: item.product.stock || 0
        }))
        setCartItems(items)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId)
      return
    }

    // Find the cart item by productId
    const cartItem = cartItems.find(item => item.productId === productId)
    if (!cartItem) {
      toast({
        title: "Error",
        description: "Cart item not found",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/customer/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId: cartItem.id,
          quantity: newQuantity
        })
      })

      if (response.ok) {
        // Update local state instead of refetching
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.productId === productId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        )
        toast({
          title: "Cart Updated",
          description: "Item quantity has been updated.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (productId: string) => {
    // Find the cart item by productId
    const cartItem = cartItems.find(item => item.productId === productId)
    if (!cartItem) {
      toast({
        title: "Error",
        description: "Cart item not found",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/customer/cart?cartItemId=${cartItem.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update local state instead of refetching
        setCartItems(prevItems => 
          prevItems.filter(item => item.productId !== productId)
        )
        toast({
          title: "Item Removed",
          description: "Item has been removed from your cart.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      // Remove all items one by one
      for (const item of cartItems) {
        await fetch(`/api/customer/cart?cartItemId=${item.id}`, {
          method: 'DELETE',
        })
      }
      
      // Clear local state immediately
      setCartItems([])
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a delivery address.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Order Placed Successfully!",
        description: `Your order for RWF ${totalAmount.toLocaleString()} has been placed successfully.`,
      })

      setCartItems([])
      setShowCheckoutDialog(false)
      setDeliveryAddress("")
      setDeliveryNotes("")
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  const tax = subtotal * 0.18 // 18% VAT
  const totalAmount = subtotal + tax
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <AuthFooter />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50">
        <AuthHeader />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-4 py-6">
            <Link 
              href={`/${lang}/marketplace`} 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Marketplace</span>
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600 mt-1">Your cart is empty</p>
              </div>
            </div>
          </div>
        </header>

        {/* Empty Cart Content */}
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Looks like you haven't added any products to your cart yet. Start shopping to build your order!
              </p>
              <Link href={`/${lang}/marketplace`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Package className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </main>
        
        <AuthFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <AuthHeader />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <Link 
            href={`/${lang}/marketplace`} 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Marketplace</span>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">Review your items before checkout</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{totalItems} items</span>
              </div>
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items ({totalItems})
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/Cooking_Oil_Vegetable.png';
                          }}
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {item.category}
                              </Badge>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{item.stock} in stock</span>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-gray-900">
                              RWF {(item.price || 0).toLocaleString()}
                            </div>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, (item.quantity || 0) - 1)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                disabled={(item.quantity || 0) <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="w-12 text-center font-semibold text-gray-900">{item.quantity || 0}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, (item.quantity || 0) + 1)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                disabled={(item.quantity || 0) >= (item.stock || 0)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">RWF {(subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (VAT)</span>
                    <span className="font-medium">RWF {(tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-blue-600">RWF {(totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>



                {/* Checkout Button */}
                <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        Delivery Information
                      </DialogTitle>
                      <DialogDescription>
                        Enter your delivery details to complete the order
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Delivery Address *</Label>
                        <Textarea
                          placeholder="Enter your full delivery address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Delivery Notes (Optional)</Label>
                        <Textarea
                          placeholder="Any special instructions for delivery"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="min-h-[60px] resize-none"
                        />
                      </div>
                      
                      {/* Order Summary in Dialog */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <h4 className="font-semibold text-gray-900">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items</span>
                            <span className="font-medium">{totalItems}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">RWF {(subtotal || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax (VAT)</span>
                            <span className="font-medium">RWF {(tax || 0).toLocaleString()}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-blue-600">RWF {(totalAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCheckoutDialog(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCheckout} 
                        disabled={isCheckingOut}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                      >
                        {isCheckingOut ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Order
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Truck className="h-5 w-5" />
                  <span className="font-medium">Free Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-green-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-purple-600">
                  <Package className="h-5 w-5" />
                  <span className="font-medium">Quality Assured</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <AuthFooter />
    </div>
  )
}

export default function Cart() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-blue-50">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Loading cart...</p>
          </div>
        </div>
        <AuthFooter />
      </div>
    }>
      <CartContent />
    </ClientOnly>
  )
} 