"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Milk,
  ArrowLeft,
  Edit,
  Users,
  MapPin,
  Building2,
  TrendingUp,
  Activity,
  DollarSign,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface MCC {
  id: string
  name: string
  code: string
  region: string
  address: string
  manager?: {
    id: string
    name: string
    email: string
    phone: string
  }
  _count?: {
    staff: number
    farmers: number
    collections: number
    sales: number
  }
}

export default function MCCDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const mccId = params.id as string

  const [mcc, setMcc] = useState<MCC | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (mccId) {
      fetchMCC()
    }
  }, [mccId])

  const fetchMCC = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("Gemurai_token")
      if (!token) {
        toast.error("Authentication required")
        router.push("/superadmin/login")
        return
      }

      const response = await fetch(`/api/v1/mcc/setup?id=${mccId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch MCC")
      }

      const data = await response.json()
      setMcc(data.data || null)
    } catch (error) {
      console.error("Error fetching MCC:", error)
      toast.error("Failed to load MCC details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading MCC details...</span>
      </div>
    )
  }

  if (!mcc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Milk className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">MCC not found</p>
        <Button onClick={() => router.push("/superadmin/mccs")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to MCCs
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 bg-gray-50 max-w-[2000px] mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/superadmin/mccs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 break-words">
            {mcc.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Code: {mcc.code} • {mcc.region}
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => router.push(`/superadmin/mccs/${mccId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit MCC
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Staff</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {mcc._count?.staff || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Farmers</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {mcc._count?.farmers || 0}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Collections</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {mcc._count?.collections || 0}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Milk className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sales</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {mcc._count?.sales || 0}
                </h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>MCC Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base font-semibold">{mcc.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Code</p>
                  <p className="text-base font-semibold">{mcc.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-base font-semibold">{mcc.region || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base font-semibold">{mcc.address || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manager</CardTitle>
              </CardHeader>
              <CardContent>
                {mcc.manager ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-base font-semibold">{mcc.manager.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base font-semibold">{mcc.manager.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-base font-semibold">{mcc.manager.phone || "N/A"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No manager assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Milk Collections</CardTitle>
              <CardDescription>View all milk collections for this MCC</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/superadmin/mccs/${mccId}/collections`}>
                <Button>View All Collections</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Sales</CardTitle>
              <CardDescription>View all product sales for this MCC</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/superadmin/mccs/${mccId}/sales`}>
                <Button>View All Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>View all payments for this MCC</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/superadmin/mccs/${mccId}/payments`}>
                <Button>View All Payments</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farmers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Farmers</CardTitle>
              <CardDescription>View all farmers registered with this MCC</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/superadmin/mccs/${mccId}/farmers`}>
                <Button>View All Farmers</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouses</CardTitle>
              <CardDescription>Manage warehouses for this MCC</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Manage warehouses, collection centers, and storage facilities
                </p>
                <Button onClick={() => router.push(`/superadmin/mccs/${mccId}/warehouses`)}>
                  <Package className="h-4 w-4 mr-2" />
                  Manage Warehouses
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure pricing, quality rules, and manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Configure MCC settings including pricing, quality rules, and manager assignment
                </p>
                <Button onClick={() => router.push(`/superadmin/mccs/${mccId}/settings`)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Open Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Generate and view reports for this MCC</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/superadmin/mccs/${mccId}/reports`}>
                <Button>View Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

