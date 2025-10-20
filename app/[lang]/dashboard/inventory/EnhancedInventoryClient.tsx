"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Droplets, 
  Pill, 
  Package,
  Activity, 
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export default function EnhancedInventoryClient() {
  const [stats, setStats] = useState({
    milk: {
      totalProducts: 4,
      totalQuantity: 743,
      totalValue: 334350,
      pendingCollections: 20,
      activeFarmers: 5
    },
    pharmacy: {
      totalProducts: 11,
      totalQuantity: 440,
      totalValue: 15200,
      pendingPrescriptions: 5,
      expiringDrugs: 3
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
            <div className="flex items-center justify-between">
                <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Inventory Management</h1>
          <p className="text-gray-600 mt-2">
            Unified inventory system for Milk and Pharmacy products
          </p>
                </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✅ Dual System Active
          </Badge>
            </div>
          </div>
          
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.milk.totalProducts + stats.pharmacy.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Across both inventory types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.milk.totalQuantity + stats.pharmacy.totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {(stats.milk.totalValue + stats.pharmacy.totalValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.milk.pendingCollections + stats.pharmacy.pendingPrescriptions}</div>
            <p className="text-xs text-muted-foreground">
              Collections + Prescriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Types */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-50"
              >
            <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Overview</span>
              </TabsTrigger>
          
              <TabsTrigger 
            value="milk" 
            className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-50"
              >
            <Droplets className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Milk Inventory</span>
              </TabsTrigger>
          
              <TabsTrigger 
            value="pharmacy" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 py-3 px-4 rounded-md transition-all duration-200 hover:bg-gray-50"
          >
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Pharmacy Inventory</span>
              </TabsTrigger>
            </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milk Inventory Overview */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Droplets className="h-5 w-5" />
                  Milk Inventory
                </CardTitle>
                <CardDescription>
                  MCC Management and milk collection tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-700">{stats.milk.totalProducts}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{stats.milk.totalQuantity}L</div>
                      <div className="text-sm text-gray-600">Total Milk</div>
          </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">RWF {stats.milk.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Value</div>
                      </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{stats.milk.activeFarmers}</div>
                      <div className="text-sm text-gray-600">Active Farmers</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">{stats.milk.pendingCollections} pending collections</span>
                    </div>
                    <Link href="/dashboard/mcc">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pharmacy Inventory Overview */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Pill className="h-5 w-5" />
                  Pharmacy Inventory
                </CardTitle>
                <CardDescription>
                  Prescription management and drug tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-purple-700">{stats.pharmacy.totalProducts}</div>
                      <div className="text-sm text-gray-600">Products</div>
                            </div>
                            <div>
                      <div className="text-2xl font-bold text-purple-700">{stats.pharmacy.totalQuantity}</div>
                      <div className="text-sm text-gray-600">Units</div>
                    </div>
                        <div>
                      <div className="text-2xl font-bold text-purple-700">RWF {stats.pharmacy.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Value</div>
                      </div>
                        <div>
                      <div className="text-2xl font-bold text-purple-700">{stats.pharmacy.expiringDrugs}</div>
                      <div className="text-sm text-gray-600">Expiring Soon</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-600">{stats.pharmacy.pendingPrescriptions} pending prescriptions</span>
                    </div>
                    <Link href="/dashboard/pharmacy">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Milk Inventory</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✅ Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Pharmacy Inventory</span>
                </div>
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    ✅ Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Unified System</span>
                </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    ✅ Integrated
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
            </TabsContent>

        <TabsContent value="milk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Milk Inventory Management
              </CardTitle>
              <CardDescription>
                Manage MCC operations, farmers, and milk collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Droplets className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Milk Inventory System</h3>
                <p className="text-gray-600 mb-6">
                  Access the complete MCC management system with farmer tracking, milk collections, and processing workflows.
                </p>
                <Link href="/dashboard/mcc">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Droplets className="h-4 w-4 mr-2" />
                    Go to MCC Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            </TabsContent>

        <TabsContent value="pharmacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Pharmacy Inventory Management
              </CardTitle>
              <CardDescription>
                Manage prescriptions, drug inventory, and expiry tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Pill className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pharmacy Inventory System</h3>
                <p className="text-gray-600 mb-6">
                  Access the complete pharmacy management system with prescription workflow, drug tracking, and expiry alerts.
                </p>
                <Link href="/dashboard/pharmacy">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Pill className="h-4 w-4 mr-2" />
                    Go to Pharmacy Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}