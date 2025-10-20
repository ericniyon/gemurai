'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  price: number
  image?: string
  stock: number
  category: string
}

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: Product
  dcc?: {
    id: string
    name: string
    email: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  subtotal: number
  taxAmount: number
  shippingAmount: number
  createdAt: string
  items: any[]
  payments: any[]
  tracking: any[]
}

export default function TestCustomerPurchase() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'cart' | 'checkout' | 'orders'>('cart')
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: '',
    customerNotes: '',
    paymentMethod: 'CASH'
  })
  const { toast } = useToast()

  // Load products
  useEffect(() => {
    loadProducts()
    loadCart()
    loadOrders()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      if (data.success) {
        setProducts(data.products.slice(0, 5)) // Show first 5 products
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadCart = async () => {
    try {
      const response = await fetch('/api/customer/cart')
      const data = await response.json()
      if (data.success) {
        setCart(data.cart.items)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/customer/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const addToCart = async () => {
    if (!selectedProduct || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a product and quantity",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: quantity
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Item added to cart"
        })
        loadCart()
        setSelectedProduct('')
        setQuantity(1)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      const response = await fetch(`/api/customer/cart?cartItemId=${cartItemId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Item removed from cart"
        })
        loadCart()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      })
    }
  }

  const processCheckout = async () => {
    if (!checkoutData.shippingAddress) {
      toast({
        title: "Error",
        description: "Please provide shipping address",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/customer/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shippingAddress: {
            street: checkoutData.shippingAddress,
            city: 'Kigali',
            province: 'Kigali',
            postalCode: '12345',
            country: 'Rwanda'
          },
          customerNotes: checkoutData.customerNotes,
          paymentMethod: checkoutData.paymentMethod
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Order created: ${data.order.orderNumber}`
        })
        setActiveTab('orders')
        loadOrders()
        setCheckoutData({
          shippingAddress: '',
          customerNotes: '',
          paymentMethod: 'CASH'
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PENDING':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Purchase API Test</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'cart' ? 'default' : 'outline'}
          onClick={() => setActiveTab('cart')}
        >
          Cart ({cart.length})
        </Button>
        <Button
          variant={activeTab === 'checkout' ? 'default' : 'outline'}
          onClick={() => setActiveTab('checkout')}
          disabled={cart.length === 0}
        >
          Checkout
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'outline'}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </Button>
      </div>

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add to Cart */}
          <Card>
            <CardHeader>
              <CardTitle>Add to Cart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - RWF {product.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              <Button onClick={addToCart} disabled={loading || !selectedProduct}>
                {loading ? 'Adding...' : 'Add to Cart'}
              </Button>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-gray-500">Cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          RWF {item.product.price.toLocaleString()} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          RWF {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>RWF {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Checkout Tab */}
      {activeTab === 'checkout' && (
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                placeholder="Enter your shipping address"
                value={checkoutData.shippingAddress}
                onChange={(e) => setCheckoutData({
                  ...checkoutData,
                  shippingAddress: e.target.value
                })}
              />
            </div>

            <div>
              <Label htmlFor="customerNotes">Notes (Optional)</Label>
              <Textarea
                id="customerNotes"
                placeholder="Any special instructions"
                value={checkoutData.customerNotes}
                onChange={(e) => setCheckoutData({
                  ...checkoutData,
                  customerNotes: e.target.value
                })}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={checkoutData.paymentMethod}
                onValueChange={(value) => setCheckoutData({
                  ...checkoutData,
                  paymentMethod: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash on Delivery</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>RWF {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>RWF {(cartTotal * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>RWF 500</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>RWF {(cartTotal * 1.18 + 500).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button onClick={processCheckout} disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <span className="font-medium">
                          RWF {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {order.items.length} item(s) • {order.tracking.length} tracking update(s)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
