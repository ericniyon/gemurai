"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, CreditCard, AlertTriangle, CheckCircle2, Clock, Receipt, ShoppingBag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

function formatCurrencyRWF(amount?: number) {
  if (typeof amount !== "number") return "RWF 0"
  return new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", minimumFractionDigits: 0 })
    .format(amount)
    .replace("RF", "RWF")
}

function timeRemaining24h(createdAt?: string) {
  try {
    const created = createdAt ? new Date(createdAt).getTime() : Date.now()
    const deadline = created + 24 * 60 * 60 * 1000
    const remainingMs = deadline - Date.now()
    if (remainingMs <= 0) return { label: "Overdue", overdue: true }
    const hours = Math.floor(remainingMs / (60 * 60 * 1000))
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
    return { label: `${hours}h ${minutes}m`, overdue: false }
  } catch {
    return { label: "24h", overdue: false }
  }
}

export default function NotificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const orderId = (params?.id as string) || ""
  const lang = (params?.lang as string) || "en"

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const resp = await fetch("/api/v1/stock-orders")
        const data = await resp.json()
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error("Failed to load order data")
        }
        const found = data.data.find((o: any) => String(o.id) === String(orderId))
        if (!found) {
          throw new Error("Notification not found or order no longer available")
        }
        setOrder(found)
      } catch (e: any) {
        setError(e?.message || "Failed to load notification")
      } finally {
        setLoading(false)
      }
    }
    if (orderId) load()
  }, [orderId])

  const isPending = order?.payment?.status === "PENDING"
  const statusChip = useMemo(() => {
    const s = order?.payment?.status || "N/A"
    if (s === "PENDING") return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
    if (s === "CONFIRMED") return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Confirmed</span>
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{s}</span>
  }, [order?.payment?.status])

  const remaining = timeRemaining24h(order?.createdAt)

  const handlePayNow = () => {
    if (!order) return
    if (!isPending) {
      toast({ title: "No payment required", description: "This order is not pending payment." })
      return
    }
    router.push(`/${lang}/dashboard/dcc-stock/orders#order-${order.id}`)
    toast({ title: "Proceed to Payment", description: `Order #${String(order.id).slice(-8)} requires payment.` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/${lang}/dashboard/dcc-stock/orders`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>

      {/* Hero Notification Banner */}
      <div className={`rounded-xl border p-4 ${isPending ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isPending ? (
              <AlertTriangle className="h-5 w-5 text-yellow-700 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-700 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-semibold text-gray-900">Order #{String(orderId).slice(-8)}</div>
              <div className="text-sm text-gray-700">
                {isPending ? 'Payment is pending. Please complete within 24 hours.' : 'Payment is not pending for this order.'}
              </div>
              {isPending && (
                <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${remaining.overdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800' }`}>
                  <Clock className="h-3 w-3" />
                  Time remaining: <span className="font-semibold">{remaining.label}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPending ? (
              <Button onClick={handlePayNow} className="gap-2">
                <CreditCard className="h-4 w-4" />
                Pay Now
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Order Details
            </CardTitle>
            <CardDescription>Summary and items</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-sm text-gray-600">Loading...</div>
            ) : error ? (
              <div className="py-8 text-sm text-red-600">{error}</div>
            ) : order ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Order ID</div>
                    <div className="text-sm font-semibold break-all">{order.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Created At</div>
                    <div className="text-sm font-semibold">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Payment</div>
                    <div className="text-sm font-semibold flex items-center gap-2">{statusChip}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="text-sm font-semibold">{formatCurrencyRWF(order.totalAmount)}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Items
                  </div>
                  {Array.isArray(order.products) && order.products.length > 0 ? (
                    <div className="space-y-3">
                      {order.products.map((p: any) => (
                        <div key={`${order.id}-${p.productId}`} className="flex items-center justify-between text-sm">
                          <div className="text-gray-700">
                            {p.product?.name || 'Product'}
                            <span className="ml-2 text-gray-500">× {p.quantity}</span>
                          </div>
                          <div className="text-gray-900 font-medium">
                            {formatCurrencyRWF((p.product?.costPrice || 0) * (p.quantity || 0))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No items found for this order.</div>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Right: Actions & Help */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Complete your payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPending ? (
              <Button onClick={handlePayNow} className="w-full gap-2">
                <CreditCard className="h-4 w-4" /> Pay Now
              </Button>
            ) : (
              <div className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Payment not required
              </div>
            )}
            <Link href={`/${lang}/dashboard/dcc-stock/orders#order-${orderId}`} className="block">
              <Button variant="outline" className="w-full">View in Orders</Button>
            </Link>
            <div className="text-xs text-gray-500">
              Need help? Contact support if you are unable to complete the payment within 24 hours.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


