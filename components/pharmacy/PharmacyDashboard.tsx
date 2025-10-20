"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pill, 
  AlertTriangle, 
  Clock, 
  Package, 
  Users, 
  TrendingUp,
  Calendar,
  Activity,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface PharmacyInventorySummary {
  pharmacy: {
    id: string;
    name: string;
    licenseNumber: string;
    location: string;
  };
  inventorySummary: {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
    expiringSoon: number;
    lowStockItems: number;
    pendingPrescriptions: number;
    warehouses: Array<{
      id: string;
      name: string;
      type: string;
      capacity: number;
    }>;
  };
}

interface Prescription {
  id: string;
  prescriptionNumber: string;
  prescriptionDate: string;
  status: string;
  totalAmount: number;
  animalId: string;
  doctorId: string;
  items: Array<{
    id: string;
    product: {
      name: string;
      strength: string;
      dosageForm: string;
    };
    quantity: number;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

interface ExpiringDrug {
  id: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  alertLevel: string;
  product: {
    name: string;
    strength: string;
  };
  warehouse: {
    name: string;
  };
}

export default function PharmacyDashboard() {
  const [inventorySummary, setInventorySummary] = useState<PharmacyInventorySummary | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expiringDrugs, setExpiringDrugs] = useState<ExpiringDrug[]>([]);
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState("pharmacy_1"); // Default pharmacy ID

  useEffect(() => {
    fetchInventorySummary();
    fetchPrescriptions();
    fetchExpiringDrugs();
  }, [pharmacyId]);

  const fetchInventorySummary = async () => {
    try {
      const response = await fetch(`/api/v1/pharmacy/inventory?pharmacyId=${pharmacyId}`);
      const data = await response.json();
      
      if (data.success) {
        setInventorySummary(data.data);
      } else {
        toast.error("Failed to load inventory summary");
      }
    } catch (error) {
      console.error("Failed to fetch inventory summary:", error);
      toast.error("Failed to load inventory summary");
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`/api/v1/pharmacy/prescriptions?pharmacyId=${pharmacyId}&status=PENDING`);
      const data = await response.json();
      
      if (data.success) {
        setPrescriptions(data.data);
      } else {
        toast.error("Failed to load prescriptions");
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      toast.error("Failed to load prescriptions");
    }
  };

  const fetchExpiringDrugs = async () => {
    try {
      const response = await fetch(`/api/v1/pharmacy/expiry-alerts?pharmacyId=${pharmacyId}&daysAhead=30`);
      const data = await response.json();
      
      if (data.success) {
        setExpiringDrugs(data.data);
      } else {
        toast.error("Failed to load expiring drugs");
      }
    } catch (error) {
      console.error("Failed to fetch expiring drugs:", error);
      toast.error("Failed to load expiring drugs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/v1/pharmacy/prescriptions/${prescriptionId}/dispense`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Prescription approved successfully");
        fetchPrescriptions();
      } else {
        toast.error(data.error || "Failed to approve prescription");
      }
    } catch (error) {
      console.error("Failed to approve prescription:", error);
      toast.error("Failed to approve prescription");
    }
  };

  const handleDispensePrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/v1/pharmacy/prescriptions/${prescriptionId}/dispense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dispensedBy: "current-user-id" }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Prescription dispensed successfully");
        fetchPrescriptions();
        fetchInventorySummary();
      } else {
        toast.error(data.error || "Failed to dispense prescription");
      }
    } catch (error) {
      console.error("Failed to dispense prescription:", error);
      toast.error("Failed to dispense prescription");
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CRITICAL":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "DISPENSED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {inventorySummary?.pharmacy.name} - {inventorySummary?.pharmacy.licenseNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search prescriptions..."
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.inventorySummary.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pharmacy products in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.inventorySummary.totalQuantity || 0}</div>
            <p className="text-xs text-muted-foreground">
              Units available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RWF {(inventorySummary?.inventorySummary.totalValue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.inventorySummary.pendingPrescriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(inventorySummary?.inventorySummary.expiringSoon || 0) > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{inventorySummary?.inventorySummary.expiringSoon} products</strong> are expiring soon and need attention.
          </AlertDescription>
        </Alert>
      )}

      {(inventorySummary?.inventorySummary.lowStockItems || 0) > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{inventorySummary?.inventorySummary.lowStockItems} products</strong> are running low on stock.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Alerts</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        {/* Prescriptions Tab */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Pending Prescriptions
              </CardTitle>
              <CardDescription>
                Prescriptions awaiting approval and dispensing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending prescriptions
                  </div>
                ) : (
                  prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Prescription #{prescription.prescriptionNumber}</h3>
                          <p className="text-sm text-gray-600">
                            Animal: {prescription.animalId} | Doctor: {prescription.doctorId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(prescription.prescriptionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(prescription.status)}>
                            {prescription.status}
                          </Badge>
                          <span className="font-semibold">
                            RWF {prescription.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Medications:</h4>
                        {prescription.items.map((item) => (
                          <div key={item.id} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">{item.product.name}</span>
                                <span className="text-gray-600 ml-2">
                                  {item.product.strength} {item.product.dosageForm}
                                </span>
                              </div>
                              <div className="text-right">
                                <div>Qty: {item.quantity}</div>
                                <div className="text-gray-600">
                                  {item.dosage} - {item.frequency} - {item.duration}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprovePrescription(prescription.id)}
                          disabled={prescription.status !== "PENDING"}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDispensePrescription(prescription.id)}
                          disabled={prescription.status !== "APPROVED"}
                        >
                          Dispense
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Inventory</CardTitle>
              <CardDescription>
                Overview of all pharmacy products and stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Inventory details will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Alerts Tab */}
        <TabsContent value="expiry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Expiry Alerts
              </CardTitle>
              <CardDescription>
                Drugs expiring within the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiringDrugs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No drugs expiring soon
                  </div>
                ) : (
                  expiringDrugs.map((drug) => (
                    <div key={drug.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{drug.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {drug.product.strength} | Batch: {drug.batchNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            Warehouse: {drug.warehouse.name} | Qty: {drug.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getAlertLevelColor(drug.alertLevel)}>
                            {drug.alertLevel}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            Expires: {new Date(drug.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Warehouses</CardTitle>
              <CardDescription>
                Warehouse locations and capacity information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventorySummary?.inventorySummary.warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">{warehouse.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      Type: {warehouse.type.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Capacity: {warehouse.capacity} units
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


